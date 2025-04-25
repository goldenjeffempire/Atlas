-- Add missing columns to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_calendar_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS floor_plan text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS hourly_rate integer;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS availability jsonb;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS check_in_code text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS zoom_room_id text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS participants jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_calendar_event_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_time timestamp;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out_time timestamp;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_booking_id integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_pattern text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();