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
  
  // Sample workspace data
  const sampleWorkspaces = [
    {
      name: "Executive Suite",
      location: "Floor 20, North Wing",
      type: "private_office",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c",
      features: JSON.stringify(["Window View", "Adjustable Desk", "Executive Chair", "Private Bathroom"]),
      capacity: 1
    },
    {
      name: "Collaboration Hub",
      location: "Floor 15, Central Area",
      type: "meeting_room",
      imageUrl: "https://images.unsplash.com/photo-1577412647305-991150c7d163",
      features: JSON.stringify(["Whiteboard", "Video Conferencing", "Smart TV", "Coffee Station"]),
      capacity: 8
    },
    {
      name: "Focus Pod A",
      location: "Floor 10, East Wing",
      type: "quiet_space",
      imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174",
      features: JSON.stringify(["Soundproof", "Ergonomic Chair", "Standing Desk", "Natural Light"]),
      capacity: 1
    },
    {
      name: "Creative Studio",
      location: "Floor 12, West Wing",
      type: "creative_space",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
      features: JSON.stringify(["Drawing Boards", "Comfortable Seating", "Art Supplies", "Inspiration Wall"]),
      capacity: 6
    },
    {
      name: "Technology Lab",
      location: "Floor 5, South Wing",
      type: "specialized",
      imageUrl: "https://images.unsplash.com/photo-1537726235470-8504e3beef77",
      features: JSON.stringify(["High-End Computers", "3D Printer", "Testing Equipment", "Project Display Area"]),
      capacity: 12
    }
  ];

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
    
    // Insert sample workspaces if they don't exist
    const existingWorkspaces = await db.execute(sql`SELECT COUNT(*) FROM workspaces`);
    const workspaceCount = parseInt(existingWorkspaces.rows[0].count, 10);
    
    if (workspaceCount === 0) {
      console.log("Inserting sample workspace data...");
      
      for (const workspace of sampleWorkspaces) {
        await db.execute(
          sql`INSERT INTO workspaces (name, location, type, image_url, features, capacity) 
              VALUES (${workspace.name}, ${workspace.location}, ${workspace.type}, 
                     ${workspace.imageUrl}, ${workspace.features}, ${workspace.capacity})`
        );
      }
      
      console.log("Sample workspace data inserted successfully");
    } else {
      console.log(`Skipping sample data insertion, found ${workspaceCount} existing workspaces`);
    }
  } catch (error) {
    console.error("Schema push failed:", error);
    process.exit(1);
  }

  await pool.end();
  console.log("Database setup completed");
}

main().catch(console.error);