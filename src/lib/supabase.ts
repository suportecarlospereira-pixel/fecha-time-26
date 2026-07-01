import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  user_type: 'player' | 'organizer';
  name: string;
  photo_url: string | null;
  whatsapp: string | null;
  city: string;
  neighborhood: string;
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  primary_position: Position;
  secondary_positions: Position[];
  skill_level: SkillLevel;
  game_types: GameType[];
  price_per_game: number | null;
  availability: Record<string, string[]>;
  is_available: boolean;
  rating_avg: number;
  rating_count: number;
  profiles: Profile;
};

export type CallUp = {
  id: string;
  organizer_id: string;
  title: string;
  game_date: string;
  game_time: string;
  location_name: string;
  address: string;
  city: string;
  neighborhood: string;
  game_type: GameType;
  positions_needed: Position[];
  players_needed: number;
  skill_level: SkillLevel | 'any';
  payment_amount: number | null;
  platform_fee_percent: number;
  net_amount: number | null;
  notes: string | null;
  status: 'open' | 'closed' | 'cancelled';
  created_at: string;
  profiles: Profile;
  applications_count?: number;
};

export type CallUpApplication = {
  id: string;
  call_up_id: string;
  player_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: Profile;
  players: Player;
};

export type Rating = {
  id: string;
  call_up_id: string;
  rater_id: string;
  rated_player_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Hire = {
  id: string;
  player_id: string;
  organizer_id: string;
  call_up_id: string | null;
  game_date: string;
  game_time: string;
  location: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_intent_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles: Profile; // organizer info
  players: Player; // player info
};

export type Position = 'goalkeeper' | 'defender' | 'fullback' | 'defensive_midfielder' | 'midfielder' | 'attacking_midfielder' | 'winger' | 'forward';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';
export type GameType = 'field' | 'society' | 'futsal' | 'beach';

export const POSITION_LABELS: Record<Position, string> = {
  goalkeeper: 'Goleiro',
  defender: 'Zagueiro',
  fullback: 'Lateral',
  defensive_midfielder: 'Volante',
  midfielder: 'Meio-campo',
  attacking_midfielder: 'Meia-atacante',
  winger: 'Ponta',
  forward: 'Atacante',
};

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  professional: 'Profissional',
};

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  field: 'Campo',
  society: 'Society',
  futsal: 'Futsal',
  beach: 'Areia',
};
