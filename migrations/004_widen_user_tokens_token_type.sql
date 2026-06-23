-- Widen token_type to support longer type names (e.g. email_verify_code)
ALTER TABLE user_tokens
  ALTER COLUMN token_type TYPE VARCHAR(32);
