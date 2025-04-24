import { 
  users, workspaces, bookings,
  User, InsertUser, 
  Workspace, InsertWorkspace,
  Booking, InsertBooking
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workspaces: Map<number, Workspace>;
  private bookings: Map<number, Booking>;
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private workspaceIdCounter: number;
  private bookingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.bookings = new Map();
    this.userIdCounter = 1;
    this.workspaceIdCounter = 1;
    this.bookingIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with some sample workspaces
    this.initializeWorkspaces();
  }

  private initializeWorkspaces() {
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
      
      this.createWorkspace({
        name: `${names[i]} ${String.fromCharCode(65 + i)}${Math.floor(Math.random() * 30)}`,
        location: locations[i % locations.length],
        type: type as any,
        imageUrl: workspaceImages[i % workspaceImages.length],
        features: featuresList[i % featuresList.length],
        capacity
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Workspace methods
  async getWorkspaces(): Promise<Workspace[]> {
    return Array.from(this.workspaces.values());
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }

  async createWorkspace(workspaceData: InsertWorkspace): Promise<Workspace> {
    const id = this.workspaceIdCounter++;
    const createdAt = new Date();
    const workspace: Workspace = { ...workspaceData, id, createdAt };
    this.workspaces.set(id, workspace);
    return workspace;
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const createdAt = new Date();
    const booking: Booking = { 
      ...bookingData, 
      id, 
      createdAt, 
      startTime: new Date(bookingData.startTime),
      endTime: new Date(bookingData.endTime),
      status: bookingData.status || "confirmed" 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const updatedBooking = { ...booking, ...bookingUpdate };
    
    if (bookingUpdate.startTime) {
      updatedBooking.startTime = new Date(bookingUpdate.startTime);
    }
    
    if (bookingUpdate.endTime) {
      updatedBooking.endTime = new Date(bookingUpdate.endTime);
    }
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<void> {
    this.bookings.delete(id);
  }

  async checkWorkspaceAvailability(
    workspaceId: number, 
    startTime: Date, 
    endTime: Date,
    excludeBookingId?: number
  ): Promise<boolean> {
    const overlappingBookings = Array.from(this.bookings.values()).filter(
      (booking) => {
        // Skip if this is the booking we're trying to update
        if (excludeBookingId && booking.id === excludeBookingId) {
          return false;
        }
        
        // Skip cancelled bookings
        if (booking.status === "cancelled") {
          return false;
        }
        
        // Check if booking is for the same workspace
        if (booking.workspaceId !== workspaceId) {
          return false;
        }
        
        // Check for time overlap
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        return (
          (startTime >= bookingStart && startTime < bookingEnd) || // Start time is within existing booking
          (endTime > bookingStart && endTime <= bookingEnd) || // End time is within existing booking
          (startTime <= bookingStart && endTime >= bookingEnd) // New booking completely contains existing booking
        );
      }
    );
    
    return overlappingBookings.length === 0;
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    const allBookings = Array.from(this.bookings.values());
    const allWorkspaces = Array.from(this.workspaces.values());
    
    // Current date for calculations
    const now = new Date();
    
    // Total active bookings
    const activeBookings = allBookings.filter(b => 
      b.status === "confirmed" && new Date(b.endTime) >= now
    );
    
    // Count by workspace type
    const bookingsByType: Record<string, number> = {};
    for (const booking of activeBookings) {
      const workspace = this.workspaces.get(booking.workspaceId);
      if (workspace) {
        bookingsByType[workspace.type] = (bookingsByType[workspace.type] || 0) + 1;
      }
    }
    
    // Most popular workspaces
    const workspacePopularity: Record<number, number> = {};
    for (const booking of allBookings) {
      if (booking.status !== "cancelled") {
        workspacePopularity[booking.workspaceId] = (workspacePopularity[booking.workspaceId] || 0) + 1;
      }
    }
    
    const popularWorkspaces = Object.entries(workspacePopularity)
      .map(([id, count]) => ({ 
        workspace: this.workspaces.get(parseInt(id)), 
        bookingsCount: count
      }))
      .filter(item => item.workspace !== undefined)
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5);
    
    return {
      totalWorkspaces: allWorkspaces.length,
      totalBookings: allBookings.length,
      activeBookings: activeBookings.length,
      bookingsByType,
      popularWorkspaces,
      totalUsers: this.users.size
    };
  }
}

export const storage = new MemStorage();
