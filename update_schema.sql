-- Database Update Script
-- Run this in phpMyAdmin to update your existing tables

-- Add 'is_read' column to 'messages' table
ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Add new columns to 'projects' table
ALTER TABLE projects ADD COLUMN logo_url TEXT;
ALTER TABLE projects ADD COLUMN download_url TEXT;
ALTER TABLE projects ADD COLUMN site_url TEXT;
ALTER TABLE projects ADD COLUMN social_instagram TEXT;
ALTER TABLE projects ADD COLUMN social_facebook TEXT;
ALTER TABLE projects ADD COLUMN social_x TEXT;
