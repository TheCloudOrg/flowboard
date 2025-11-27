-- Migration: Add tech_stack column to cards table
-- Description: Adds optional tech_stack field to store technology stack information for cards

-- Add tech_stack column to cards table
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS tech_stack TEXT;

-- Add comment to document the column
COMMENT ON COLUMN cards.tech_stack IS 'Technology stack or tools associated with the card (e.g., "Next.js, TypeScript, Supabase")';
