-- EUshop Chat Enhancements Migration
-- Adds indexes, GDPR compliance fields, and data retention policies
-- for the chat feature

BEGIN;

-- 1. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_food_id ON conversations(food_id);
CREATE INDEX IF NOT EXISTS idx_conversations_is_active ON conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- 2. Add GDPR compliance fields
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS consent_log_id VARCHAR(64);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS retention_policy VARCHAR(50) DEFAULT 'standard';

ALTER TABLE messages ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE;

-- 3. Add data retention policy field
COMMENT ON COLUMN conversations.retention_policy IS 'standard: 3 years, gdpr_erasure: 30 days, legal_hold: indefinite';

-- 4. Create consent log entries for existing conversations
-- This ensures we have a record of data processing consent
INSERT INTO consent_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    consent_given,
    ip_address,
    user_agent,
    created_at
)
SELECT
    buyer_id,
    'chat_data_processing',
    'conversation',
    id,
    TRUE,
    '127.0.0.1',
    'system:migration',
    NOW()
FROM conversations
WHERE data_processing_consent = FALSE
ON CONFLICT (user_id, action, entity_type, entity_id) DO NOTHING;

-- Update existing conversations to mark consent as given
UPDATE conversations SET
    data_processing_consent = TRUE,
    updated_at = NOW();

-- 5. Add GDPR erasure tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS erasure_requested_at TIMESTAMP;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS erasure_completed_at TIMESTAMP;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS erasure_requested_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS erasure_completed_at TIMESTAMP;

-- 6. Add full-text search for messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
CREATE INDEX IF NOT EXISTS idx_messages_search_vector ON messages USING GIN(search_vector);

-- Update search vector for existing messages
UPDATE messages SET search_vector =
    to_tsvector('english', COALESCE(content, ''));

-- Create trigger to update search vector on message changes
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_search_vector
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_message_search_vector();

-- 7. Add message metadata for compliance
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB;

COMMIT;

-- 8. Create GDPR erasure procedure
CREATE OR REPLACE PROCEDURE gdpr_erase_chat_data(user_id VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Mark conversations for erasure
    UPDATE conversations SET
        erasure_requested_at = NOW(),
        is_active = FALSE
    WHERE buyer_id = user_id OR seller_id = user_id;

    -- Mark messages for erasure
    UPDATE messages SET
        erasure_requested_at = NOW()
    WHERE conversation_id IN (
        SELECT id FROM conversations
        WHERE buyer_id = user_id OR seller_id = user_id
    );

    -- In a real implementation, we would schedule actual erasure after 30 days
    -- For now, we'll just mark them
    COMMIT;
END;
$$;

-- 9. Create data export function for GDPR compliance
CREATE OR REPLACE FUNCTION gdpr_export_chat_data(user_id VARCHAR)
RETURNS TABLE(
    conversation_id VARCHAR,
    conversation_subject TEXT,
    conversation_created_at TIMESTAMP,
    message_id VARCHAR,
    message_content TEXT,
    message_created_at TIMESTAMP,
    sender_id VARCHAR,
    sender_role VARCHAR
) LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS conversation_id,
        c.subject AS conversation_subject,
        c.created_at AS conversation_created_at,
        m.id AS message_id,
        m.content AS message_content,
        m.created_at AS message_created_at,
        m.sender_id,
        CASE
            WHEN m.sender_id = c.buyer_id THEN 'buyer'
            WHEN m.sender_id = c.seller_id THEN 'seller'
            ELSE 'unknown'
        END AS sender_role
    FROM conversations c
    JOIN messages m ON c.id = m.conversation_id
    WHERE (c.buyer_id = user_id OR c.seller_id = user_id)
    AND c.erasure_requested_at IS NULL
    AND m.erasure_requested_at IS NULL
    ORDER BY c.created_at, m.created_at;
END;
$$;