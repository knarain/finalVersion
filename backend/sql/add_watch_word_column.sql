-- Add watch_word column to admin table
ALTER TABLE admins ADD COLUMN watch_word VARCHAR(255) NULL AFTER password;