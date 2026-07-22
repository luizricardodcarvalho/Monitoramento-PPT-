-- =========================================================================
-- PPT SUPABASE POSTGRESQL - SCHEMA CORRECTIONS & ALIGNMENT
-- Project: Plantio & Vinhaça Control System
-- Objective: Fix minor structural mismatches in DDS (Diálogo Diário de Segurança) 
--            tables without erasing any existing records or disrupting service.
-- =========================================================================

-- 1. ALIGN dds_topics TABLE WITH THE FRONTEND DdsTopic INTERFACE
-- The frontend interface expect: title, category, description, urgency, and rules array.
-- Currently, dds_topics table only has title, category, and content.
-- We safely add the missing columns.

-- Add 'description' column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dds_topics' AND column_name='description') THEN
        ALTER TABLE public.dds_topics ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add 'urgency' column if it doesn't exist (Defaulting to 'Médio')
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dds_topics' AND column_name='urgency') THEN
        ALTER TABLE public.dds_topics ADD COLUMN urgency TEXT DEFAULT 'Médio';
    END IF;
END $$;

-- Add 'rules' column (text array) if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dds_topics' AND column_name='rules') THEN
        ALTER TABLE public.dds_topics ADD COLUMN rules TEXT[] DEFAULT '{}'::text[];
    END IF;
END $$;

-- Populate 'description' with 'content' for any existing rows to prevent data loss,
-- then make description NOT NULL once populated (optional/safe).
UPDATE public.dds_topics 
SET description = COALESCE(description, content)
WHERE description IS NULL;


-- 2. ALIGN dds_meetings TABLE WITH THE FRONTEND newMeeting STRUCTURE
-- The frontend logs: date, time, usina, supervisor, topicTitle, category, and attendees list.
-- Currently, dds_meetings table has: id, date, usina, frente, topic_title, category, attendees.
-- It is missing: supervisor, time. We add them safely.

-- Add 'supervisor' column if it doesn't exist (Defaulting to 'Líder de Campo')
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dds_meetings' AND column_name='supervisor') THEN
        ALTER TABLE public.dds_meetings ADD COLUMN supervisor TEXT DEFAULT 'Líder de Campo';
    END IF;
END $$;

-- Add 'time' column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dds_meetings' AND column_name='time') THEN
        ALTER TABLE public.dds_meetings ADD COLUMN time TEXT;
    END IF;
END $$;


-- 3. ENSURE RLS POLICIES REMAIN ACTIVE AND CORRECT
-- Since we are altering existing tables, we verify that Row Level Security (RLS) is intact.
-- Row level security is already enabled for both tables.
-- This command is idempotent and ensures all policies remain properly associated.
ALTER TABLE public.dds_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dds_meetings ENABLE ROW LEVEL SECURITY;

-- Note: No existing user records or other system tables are altered, preserving all history logs,
-- planting metrics, area registrations, and vinhaça dispatch workflows.
