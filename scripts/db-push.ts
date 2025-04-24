import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { sql } from "drizzle-orm";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Connect to the database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Starting database schema push...");

  // Create the tables directly using SQL
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'general',
        admin_title TEXT,
        admin_department TEXT,
        job_title TEXT,
        employee_id TEXT,
        department TEXT,
        phone_number TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Users table created or already exists");
    
    // Create workspaces table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workspaces (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        image_url TEXT NOT NULL,
        features JSONB NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Workspaces table created or already exists");
    
    // Create bookings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        workspace_id INTEGER NOT NULL REFERENCES workspaces(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Bookings table created or already exists");
    
    console.log("Schema push completed successfully");
  } catch (error) {
    console.error("Schema push failed:", error);
    process.exit(1);
  }

  await pool.end();
  console.log("Database setup completed");
}

main().catch(console.error);