/*
# Add hiring/booking system

## Overview
Creates a hiring request system where organizers can book players.
The WhatsApp contact is only revealed after a confirmed booking with payment.

## New Tables

### hires
- `id` (uuid, primary key)
- `player_id` (uuid, references profiles)
- `organizer_id` (uuid, references profiles)
- `call_up_id` (uuid, references call_ups, nullable)
- `game_date` (date)
- `game_time` (time)
- `location` (text)
- `gross_amount` (decimal - total amount including fee)
- `platform_fee` (decimal - 10% fee)
- `net_amount` (decimal - player receives)
- `status` (text: pending, accepted, rejected, cancelled, completed)
- `payment_status` (text: pending, paid, refunded)
- `payment_intent_id` (text - Stripe payment intent ID)
- `notes` (text, nullable)
- `created_at` (timestamp)

## Security
- RLS enabled
- Players can view their own hires
- Organizers can view hires they created
*/

CREATE TABLE IF NOT EXISTS hires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  call_up_id uuid REFERENCES call_ups(id) ON DELETE SET NULL,
  game_date date NOT NULL,
  game_time time NOT NULL,
  location text NOT NULL,
  gross_amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) NOT NULL DEFAULT 0,
  net_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_intent_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hires ENABLE ROW LEVEL SECURITY;

-- Policies for hires
DROP POLICY IF EXISTS "select_own_hires" ON hires;
CREATE POLICY "select_own_hires" ON hires FOR SELECT
  TO authenticated USING (auth.uid() = player_id OR auth.uid() = organizer_id);

DROP POLICY IF EXISTS "insert_hire_organizer" ON hires;
CREATE POLICY "insert_hire_organizer" ON hires FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "update_hire_participant" ON hires;
CREATE POLICY "update_hire_participant" ON hires FOR UPDATE
  TO authenticated USING (auth.uid() = player_id OR auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = player_id OR auth.uid() = organizer_id);

-- Add storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for profile photos
DROP POLICY IF EXISTS "profile_photos_select" ON storage.objects;
CREATE POLICY "profile_photos_select" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "profile_photos_insert" ON storage.objects;
CREATE POLICY "profile_photos_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "profile_photos_update" ON storage.objects;
CREATE POLICY "profile_photos_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "profile_photos_delete" ON storage.objects;
CREATE POLICY "profile_photos_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index
CREATE INDEX IF NOT EXISTS idx_hires_player ON hires(player_id);
CREATE INDEX IF NOT EXISTS idx_hires_organizer ON hires(organizer_id);
CREATE INDEX IF NOT EXISTS idx_hires_status ON hires(status);