import { 
  users, workspaces, bookings, notifications,
  User, InsertUser, 
  Workspace, InsertWorkspace,
  Booking, InsertBooking,
  Notification, InsertNotification
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, or, gte, lt, ne, lte, gt, desc, count } from "drizzle-orm";

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

  // Notification operations
  getUserNotifications(userId: number, options?: { limit?: number; unreadOnly?: boolean }): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<number>;
  deleteNotification(id: number): Promise<void>;
  deleteAllUserNotifications(userId: number): Promise<number>;
  deleteReadNotifications(userId: number): Promise<number>;

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
      tableName: 'session'
    });

    // Initialize sample workspace data when database is first created
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if we already have workspaces and users
      const existingWorkspaces = await this.getWorkspaces();
      const adminUser = await this.getUserByEmail('admin@atlas.com');

      // Create test users if they don't exist
      if (!adminUser) {
        // Use a simple, consistent password hash for test users
        const hashedPassword = 'test1234_hash';

        // Create admin user
        await this.createUser({
          email: 'admin@atlas.com',
          password: hashedPassword,
          companyName: 'ATLAS Admin',
          role: 'admin',
          adminTitle: 'Facility Manager',
          adminDepartment: 'Operations'
        });

        // Create employee user
        await this.createUser({
          email: 'employee@atlas.com',
          password: hashedPassword, 
          companyName: 'ATLAS Corp',
          role: 'employee',
          employeeId: 'EMP001',
          department: 'Engineering'
        });

        // Create general user
        await this.createUser({
          email: 'user@atlas.com',
          password: hashedPassword,
          companyName: 'ATLAS User',
          role: 'general',
          jobTitle: 'Contractor'
        });
      }

      // Only initialize workspaces if there are none
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
    // Get all bookings for the workspace that are not cancelled
    let query = db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.workspaceId, workspaceId),
          ne(bookings.status, "cancelled")
        )
      );

    // Exclude the booking we're trying to update if applicable
    if (excludeBookingId) {
      query = db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.workspaceId, workspaceId),
            ne(bookings.status, "cancelled"),
            ne(bookings.id, excludeBookingId)
          )
        );
    }

    const workspaceBookings = await query;

    // Check for overlapping bookings manually since date comparison in the query is complex
    const overlappingBookings = workspaceBookings.filter(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return (
        (startTime >= bookingStart && startTime < bookingEnd) || // Start time is within existing booking
        (endTime > bookingStart && endTime <= bookingEnd) || // End time is within existing booking
        (startTime <= bookingStart && endTime >= bookingEnd) // New booking completely contains existing booking
      );
    });

    return overlappingBookings.length === 0;
  }

  // Notification methods
  async getUserNotifications(userId: number, options: { limit?: number; unreadOnly?: boolean } = {}): Promise<Notification[]> {
    try {
      let query = db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));

      if (options.unreadOnly) {
        query = query.where(eq(notifications.isRead, false));
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    try {
      const result = await db.select({ count: count() })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error counting unread notifications:", error);
      throw error;
    }
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    try {
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id));
      return notification;
    } catch (error) {
      console.error("Error getting notification:", error);
      throw error;
    }
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    try {
      const [updatedNotification] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();

      if (!updatedNotification) {
        throw new Error("Notification not found");
      }

      return updatedNotification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<number> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      return result.rowCount || 0;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteNotification(id: number): Promise<void> {
    try {
      await db
        .delete(notifications)
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  async deleteAllUserNotifications(userId: number): Promise<number> {
    try {
      const result = await db
        .delete(notifications)
        .where(eq(notifications.userId, userId));

      return result.rowCount || 0;
    } catch (error) {
      console.error("Error deleting all user notifications:", error);
      throw error;
    }
  }

  async deleteReadNotifications(userId: number): Promise<number> {
    try {
      const result = await db
        .delete(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, true)
        ));

      return result.rowCount || 0;
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      throw error;
    }
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