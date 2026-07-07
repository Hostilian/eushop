-- Create table for tracking processed Stripe webhook events to ensure processing idempotency
CREATE TABLE IF NOT EXISTS processed_webhook_events (
    event_id VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
