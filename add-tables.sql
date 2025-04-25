-- Create new tables
CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer,
        "action" text NOT NULL,
        "entity_type" text NOT NULL,
        "entity_id" integer,
        "details" jsonb,
        "ip_address" text,
        "user_agent" text,
        "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "analytics" (
        "id" serial PRIMARY KEY NOT NULL,
        "metric_date" timestamp NOT NULL,
        "metric_type" text NOT NULL,
        "metric_value" jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "notifications" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "type" text NOT NULL,
        "title" text NOT NULL,
        "message" text NOT NULL,
        "is_read" boolean DEFAULT false NOT NULL,
        "related_booking_id" integer,
        "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "activity_logs" 
ADD CONSTRAINT IF NOT EXISTS "activity_logs_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "notifications" 
ADD CONSTRAINT IF NOT EXISTS "notifications_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "notifications" 
ADD CONSTRAINT IF NOT EXISTS "notifications_related_booking_id_bookings_id_fk" 
FOREIGN KEY ("related_booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;