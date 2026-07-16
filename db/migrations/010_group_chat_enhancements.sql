-- EUshop Group Chat Enhancements Migration
-- Adds support for group conversations and multiple participants

BEGIN;

-- 1. Add participants table for many-to-many relationship
CREATE TABLE conversation_participants (
  id VARCHAR(64) PRIMARY KEY,
  conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  role VARCHAR(20) DEFAULT 'member', -- 'member', 'admin', 'owner'
  UNIQUE(conversation_id, user_id)
);

-- 2. Add indexes for performance
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

-- 3. Add group chat specific fields to conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS group_name VARCHAR(255);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS group_description TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS group_image_url VARCHAR(512);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by VARCHAR(64) REFERENCES users(id);

-- 4. Migrate existing conversations to the new structure
INSERT INTO conversation_participants (id, conversation_id, user_id, role)
SELECT gen_random_uuid(), id, buyer_id, 'owner' FROM conversations;

INSERT INTO conversation_participants (id, conversation_id, user_id, role)
SELECT gen_random_uuid(), id, seller_id, 'member' FROM conversations;

-- 5. Update existing conversations to mark them as non-group
UPDATE conversations SET is_group = FALSE;

-- 6. Add triggers for maintaining conversation participants
CREATE OR REPLACE FUNCTION update_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add buyer as owner
    INSERT INTO conversation_participants (id, conversation_id, user_id, role)
    VALUES (gen_random_uuid(), NEW.id, NEW.buyer_id, 'owner');

    -- Add seller as member
    INSERT INTO conversation_participants (id, conversation_id, user_id, role)
    VALUES (gen_random_uuid(), NEW.id, NEW.seller_id, 'member');
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove all participants when conversation is deleted
    DELETE FROM conversation_participants WHERE conversation_id = OLD.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_participants_after_insert
AFTER INSERT ON conversations
FOR EACH ROW EXECUTE FUNCTION update_conversation_participants();

CREATE TRIGGER trigger_update_conversation_participants_before_delete
BEFORE DELETE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_conversation_participants();

-- 7. Add function to check if user is in conversation
CREATE OR REPLACE FUNCTION is_user_in_conversation(user_id VARCHAR, conversation_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE user_id = is_user_in_conversation.user_id
    AND conversation_id = is_user_in_conversation.conversation_id
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Add function to get other users in conversation
CREATE OR REPLACE FUNCTION get_other_users_in_conversation(user_id VARCHAR, conversation_id VARCHAR)
RETURNS TABLE(other_user_id VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT cp.user_id FROM conversation_participants cp
  WHERE cp.conversation_id = get_other_users_in_conversation.conversation_id
  AND cp.user_id != get_other_users_in_conversation.user_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;