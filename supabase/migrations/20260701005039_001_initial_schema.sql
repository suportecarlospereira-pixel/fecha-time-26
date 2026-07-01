/*
# Fecha Time - Initial Database Schema

## Overview
This migration creates the core tables for the Fecha Time app, a platform for organizing soccer games (peladas) and finding players.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `user_type` (text: 'player' or 'organizer')
- `name` (text)
- `photo_url` (text, nullable)
- `whatsapp` (text, nullable)
- `city` (text)
- `neighborhood` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### players
- `id` (uuid, primary key, references profiles)
- `primary_position` (text: goalkeeper, defender, fullback, defensive_midfielder, midfielder, attacking_midfielder, winger, forward)
- `secondary_positions` (text array)
- `skill_level` (text: beginner, intermediate, advanced, professional)
- `game_types` (text array: field, society, futsal, beach)
- `price_per_game` (decimal, nullable)
- `availability` (jsonb: weekday/time slots)
- `is_available` (boolean, default true)
- `rating_avg` (decimal, default 0)
- `rating_count` (integer, default 0)

### call_ups
- `id` (uuid, primary key)
- `organizer_id` (uuid, references profiles)
- `title` (text)
- `game_date` (date)
- `game_time` (time)
- `location_name` (text)
- `address` (text)
- `city` (text)
- `neighborhood` (text)
- `game_type` (text)
- `position_needed` (text array)
- `players_needed` (integer)
- `skill_level` (text)
- `payment_amount` (decimal, nullable)
- `notes` (text, nullable)
- `status` (text: open, closed, cancelled)
- `created_at` (timestamp)

### call_up_applications
- `id` (uuid, primary key)
- `call_up_id` (uuid, references call_ups)
- `player_id` (uuid, references profiles)
- `status` (text: pending, accepted, rejected)
- `created_at` (timestamp)

### ratings
- `id` (uuid, primary key)
- `call_up_id` (uuid, references call_ups)
- `rater_id` (uuid, references profiles)
- `rated_player_id` (uuid, references profiles)
- `rating` (integer, 1-5)
- `comment` (text, nullable)
- `created_at` (timestamp)

## Security
- RLS enabled on all tables
- Owner-scoped policies for authenticated users
- Players can view other players and call-ups
- Organizers can create call-ups and rate players
*/

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (shared by both players and organizers)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('player', 'organizer')),
  name text NOT NULL,
  photo_url text,
  whatsapp text,
  city text NOT NULL,
  neighborhood text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Players table (extended profile info for players)
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  primary_position text NOT NULL CHECK (primary_position IN ('goalkeeper', 'defender', 'fullback', 'defensive_midfielder', 'midfielder', 'attacking_midfielder', 'winger', 'forward')),
  secondary_positions text[] DEFAULT '{}',
  skill_level text NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  game_types text[] NOT NULL CHECK (array_length(game_types, 1) > 0),
  price_per_game numeric(10,2),
  availability jsonb DEFAULT '{}',
  is_available boolean DEFAULT true,
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Call-ups table (created by organizers)
CREATE TABLE IF NOT EXISTS call_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  game_date date NOT NULL,
  game_time time NOT NULL,
  location_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  neighborhood text NOT NULL,
  game_type text NOT NULL CHECK (game_type IN ('field', 'society', 'futsal', 'beach')),
  positions_needed text[] NOT NULL,
  players_needed integer NOT NULL,
  skill_level text NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'professional', 'any')),
  payment_amount numeric(10,2),
  notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE call_ups ENABLE ROW LEVEL SECURITY;

-- Call-up applications (players applying to call-ups)
CREATE TABLE IF NOT EXISTS call_up_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_up_id uuid NOT NULL REFERENCES call_ups(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(call_up_id, player_id)
);

ALTER TABLE call_up_applications ENABLE ROW LEVEL SECURITY;

-- Ratings table (organizers rate players after games)
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_up_id uuid NOT NULL REFERENCES call_ups(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(call_up_id, rater_id, rated_player_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Players policies
DROP POLICY IF EXISTS "select_players" ON players;
CREATE POLICY "select_players" ON players FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_player" ON players;
CREATE POLICY "insert_own_player" ON players FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_player" ON players;
CREATE POLICY "update_own_player" ON players FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Call-ups policies
DROP POLICY IF EXISTS "select_call_ups" ON call_ups;
CREATE POLICY "select_call_ups" ON call_ups FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_call_up" ON call_ups;
CREATE POLICY "insert_own_call_up" ON call_ups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "update_own_call_up" ON call_ups;
CREATE POLICY "update_own_call_up" ON call_ups FOR UPDATE
  TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "delete_own_call_up" ON call_ups;
CREATE POLICY "delete_own_call_up" ON call_ups FOR DELETE
  TO authenticated USING (auth.uid() = organizer_id);

-- Call-up applications policies
DROP POLICY IF EXISTS "select_applications" ON call_up_applications;
CREATE POLICY "select_applications" ON call_up_applications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_application" ON call_up_applications;
CREATE POLICY "insert_own_application" ON call_up_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "update_application_organizer" ON call_up_applications;
CREATE POLICY "update_application_organizer" ON call_up_applications FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM call_ups WHERE call_ups.id = call_up_applications.call_up_id AND call_ups.organizer_id = auth.uid())
  );

-- Ratings policies
DROP POLICY IF EXISTS "select_ratings" ON ratings;
CREATE POLICY "select_ratings" ON ratings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_rating" ON ratings;
CREATE POLICY "insert_rating" ON ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = rater_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_city ON players(id);
CREATE INDEX IF NOT EXISTS idx_call_ups_city ON call_ups(city);
CREATE INDEX IF NOT EXISTS idx_call_ups_status ON call_ups(status);
CREATE INDEX IF NOT EXISTS idx_call_ups_date ON call_ups(game_date);
CREATE INDEX IF NOT EXISTS idx_applications_call_up ON call_up_applications(call_up_id);
CREATE INDEX IF NOT EXISTS idx_applications_player ON call_up_applications(player_id);
CREATE INDEX IF NOT EXISTS idx_ratings_player ON ratings(rated_player_id);

-- Function to update player rating average
CREATE OR REPLACE FUNCTION update_player_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET rating_avg = (
    SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE rated_player_id = NEW.rated_player_id
  ),
  rating_count = (
    SELECT COUNT(*) FROM ratings WHERE rated_player_id = NEW.rated_player_id
  )
  WHERE id = NEW.rated_player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_rating
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_player_rating();