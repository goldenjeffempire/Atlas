import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBookingSchema, insertWorkspaceSchema } from "@shared/schema";
import { sendBookingConfirmation } from "./mailer";
import { handleChatRequest } from "./perplexity";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes (login, register, logout, user)
  setupAuth(app);
  
  // Workspace routes
  app.get("/api/workspaces", async (req, res) => {
    try {
      const workspaces = await storage.getWorkspaces();
      res.json(workspaces);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.get("/api/workspaces/:id", async (req, res) => {
    try {
      const workspace = await storage.getWorkspace(parseInt(req.params.id));
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      res.json(workspace);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.post("/api/workspaces", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const validatedData = insertWorkspaceSchema.parse(req.body);
      const workspace = await storage.createWorkspace(validatedData);
      res.status(201).json(workspace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workspace data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  // Booking routes
  app.get("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let bookings;
      if (req.user.role === "admin") {
        bookings = await storage.getAllBookings();
      } else {
        bookings = await storage.getUserBookings(req.user.id);
      }

      // Get workspace details for each booking
      const bookingsWithWorkspaces = await Promise.all(
        bookings.map(async (booking) => {
          const workspace = await storage.getWorkspace(booking.workspaceId);
          return { ...booking, workspace };
        })
      );

      res.json(bookingsWithWorkspaces);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if workspace is available for the requested time
      const isAvailable = await storage.checkWorkspaceAvailability(
        validatedData.workspaceId,
        new Date(validatedData.startTime),
        new Date(validatedData.endTime)
      );

      if (!isAvailable) {
        return res.status(409).json({ message: "Workspace is not available for the selected time" });
      }

      const booking = await storage.createBooking(validatedData);
      
      // Get workspace details
      const workspace = await storage.getWorkspace(booking.workspaceId);
      
      // Send confirmation email
      if (workspace && req.user.email) {
        sendBookingConfirmation(req.user.email, {
          userName: req.user.companyName,
          workspaceName: workspace.name,
          workspaceLocation: workspace.location,
          startTime: new Date(booking.startTime).toLocaleString(),
          endTime: new Date(booking.endTime).toLocaleString(),
          bookingId: booking.id.toString()
        });
      }

      res.status(201).json({ ...booking, workspace });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking or is admin
      if (booking.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Only allow updating status or rescheduling
      const updates: Partial<typeof booking> = {};
      
      if (req.body.status) {
        updates.status = req.body.status;
      }
      
      if (req.body.startTime && req.body.endTime) {
        // Check availability for new time if it's being updated
        const isAvailable = await storage.checkWorkspaceAvailability(
          booking.workspaceId,
          new Date(req.body.startTime),
          new Date(req.body.endTime),
          bookingId // Exclude current booking from check
        );

        if (!isAvailable) {
          return res.status(409).json({ message: "Workspace is not available for the selected time" });
        }

        updates.startTime = new Date(req.body.startTime);
        updates.endTime = new Date(req.body.endTime);
      }

      const updatedBooking = await storage.updateBooking(bookingId, updates);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking or is admin
      if (booking.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteBooking(bookingId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Admin Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const stats = await storage.getAnalytics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  
  // AI Chat endpoint
  app.post("/api/chat", handleChatRequest);

  const httpServer = createServer(app);
  return httpServer;
}
