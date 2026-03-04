-- Add duration TEXT column to trainings table
-- The existing duration_hours (INTEGER) was not being used by the UI;
-- the frontend sends duration as a text string like "8h", "4h 30min", etc.
ALTER TABLE public.trainings
  ADD COLUMN IF NOT EXISTS duration TEXT;
