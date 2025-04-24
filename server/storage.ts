import { 
  users, workspaces, bookings,
  User, InsertUser, 
  Workspace, InsertWorkspace,
  Booking, InsertBooking
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, or, gte, lt, ne, lte, gt } from "drizzle-orm";

// Import types for session store
import { Store } from "express-session";
const PostgresSessionStore = connectPg(session);

// Sample workspace images to use
const workspaceImages = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600508773759-be507abb2bee?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1540821924489-7690c70c4eac?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1416339698991-a20922e59443?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1520881363902-a0ff4e722963?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
];

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workspace operations
  getWorkspaces(): Promise<Workspace[]>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  
  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking>;
  deleteBooking(id: number): Promise<void>;
  checkWorkspaceAvailability(workspaceId: number, startTime: Date, endTime: Date, excludeBookingId?: number): Promise<boolean>;
  
  // Analytics
  getAnalytics(): Promise<any>;

  // Session storage
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    
    // Initialize sample workspace data when database is first created
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if we already have workspaces
      const existingWorkspaces = await this.getWorkspaces();
      
      // Only initialize if there are no workspaces
      if (existingWorkspaces.length === 0) {
        const workspaceTypes = ["desk", "meeting_room", "collaborative_space", "private_office", "focus_pod"];
        const locations = ["North Wing, Floor 4", "East Wing, Floor 2", "West Wing, Floor 3", "South Wing, Floor 1", "East Wing, Floor 5"];
        const names = [
          "Executive Desk", "Conference Room", "Collaborative Space", 
          "Private Office", "Focus Pod", "Standing Desk",
          "Premium Desk", "Meeting Room", "Team Space", "Quiet Zone"
        ];
        const featuresList = [
          ["Adjustable Height", "Power Outlets", "Quiet Zone"],
          ["Video Conference", "Projector", "Seats 12"],
          ["Team Space", "Whiteboard", "Lounge Area"],
          ["Sound-proof", "Dedicated Phone", "Premium Desk"],
          ["Privacy Glass", "Noise Cancelling", "Compact"],
          ["Ergonomic", "USB-C Power", "Natural Light"],
          ["Adjustable Height", "Window View", "Ergonomic Chair"],
          ["Video Conference", "Whiteboard", "Seats 8"],
          ["Team Space", "Projector", "Standing Desks"],
          ["Window View", "Power Outlets", "Quiet Zone"]
        ];

        // Create 10 sample workspaces
        for (let i = 0; i < 10; i++) {
          const typeIndex = i % workspaceTypes.length;
          const type = workspaceTypes[typeIndex];
          const capacity = type === "desk" || type === "focus_pod" ? 1 : 
                           type === "private_office" ? 4 : 
                           type === "collaborative_space" ? 8 : 12;
          
          await this.createWorkspace({
            name: `${names[i]} ${String.fromCharCode(65 + i)}${Math.floor(Math.random() * 30)}`,
            location: locations[i % locations.length],
            type: type as any,
            imageUrl: workspaceImages[i % workspaceImages.length],
            features: featuresList[i % featuresList.length],
            capacity
          });
        }
      }
    } catch (error) {
      console.error("Failed to initialize sample data", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const lowerCaseEmail = {
      ...userData,
      email: userData.email.toLowerCase()
    };
    
    const [newUser] = await db
      .insert(users)
      .values(lowerCaseEmail)
      .returning();
    
    return newUser;
  }

  // Workspace methods
  async getWorkspaces(): Promise<Workspace[]> {
    return db.select().from(workspaces);
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return workspace;
  }

  async createWorkspace(workspaceData: InsertWorkspace): Promise<Workspace> {
    const [newWorkspace] = await db
      .insert(workspaces)
      .values(workspaceData)
      .returning();
    
    return newWorkspace;
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings);
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();
    
    return newBooking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<Booking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingUpdate)
      .where(eq(bookings.id, id))
      .returning();
    
    if (!updatedBooking) {
      throw new Error("Booking not found");
    }
    
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<void> {
    await db
      .delete(bookings)
      .where(eq(bookings.id, id));
  }

  async checkWorkspaceAvailability(
    workspaceId: number, 
    startTime: Date, 
    endTime: Date,
    excludeBookingId?: number
  ): Promise<boolean> {
    // Query for any overlapping bookings
    let query = db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.workspaceId, workspaceId),
          ne(bookings.status, "cancelled"),
          or(
            // Start time is within existing booking
            and(
              gte(bookings.startTime, startTime),
              lt(bookings.startTime, endTime)
            ),
            // End time is within existing booking
            and(
              gt(bookings.endTime, startTime),
              gte(endTime, bookings.endTime)
            ),
            // New booking completely contains existing booking
            and(
              lte(bookings.startTime, startTime),
              gte(bookings.endTime, endTime)
            )
          )
        )
      );
    
    // Exclude the booking we're trying to update if applicable
    if (excludeBookingId) {
      query = query.where(ne(bookings.id, excludeBookingId));
    }
    
    const overlappingBookings = await query;
    
    return overlappingBookings.length === 0;
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    // Get all workspaces and bookings
    const allWorkspaces = await this.getWorkspaces();
    const allBookings = await this.getAllBookings();
    const allUsers = await db.select().from(users);
    
    // Current date for calculations
    const now = new Date();
    
    // Active bookings
    const activeBookings = allBookings.filter(b => 
      b.status === "confirmed" && new Date(b.endTime) >= now
    );
    
    // Count bookings by workspace type
    const bookingsByType: Record<string, number> = {};
    
    // Create a map of workspace IDs to types for efficient lookup
    const workspaceTypesMap = new Map(
      allWorkspaces.map(workspace => [workspace.id, workspace.type])
    );
    
    for (const booking of activeBookings) {
      const workspaceType = workspaceTypesMap.get(booking.workspaceId);
      if (workspaceType) {
        bookingsByType[workspaceType] = (bookingsByType[workspaceType] || 0) + 1;
      }
    }
    
    // Count bookings per workspace
    const bookingsCountByWorkspace = allBookings.reduce((counts, booking) => {
      if (booking.status !== "cancelled") {
        counts[booking.workspaceId] = (counts[booking.workspaceId] || 0) + 1;
      }
      return counts;
    }, {} as Record<number, number>);
    
    // Get the most popular workspaces
    const workspaceIdsSorted = Object.entries(bookingsCountByWorkspace)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([id]) => parseInt(id));
    
    const popularWorkspaces = allWorkspaces
      .filter(workspace => workspaceIdsSorted.includes(workspace.id))
      .map(workspace => ({
        workspace,
        bookingsCount: bookingsCountByWorkspace[workspace.id]
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount);
    
    return {
      totalWorkspaces: allWorkspaces.length,
      totalBookings: allBookings.length,
      activeBookings: activeBookings.length,
      bookingsByType,
      popularWorkspaces,
      totalUsers: allUsers.length
    };
  }
}

export const storage = new DatabaseStorage();
