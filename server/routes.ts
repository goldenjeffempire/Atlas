import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBookingSchema, insertWorkspaceSchema, insertNotificationSchema } from "@shared/schema";
import { sendBookingConfirmation } from "./mailer";
import { handleChatRequest } from "./openai";

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

      // Create notification for booking confirmation
      await storage.createNotification({
        userId: req.user.id,
        title: "Booking Confirmed",
        message: `Your booking for ${workspace?.name} has been confirmed`,
        type: "success",
        read: false
      });
      
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
  
  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      
      // Support query parameters for filtering
      const { limit, unreadOnly } = req.query;
      const options: { limit?: number; unreadOnly?: boolean } = {};
      
      if (limit) {
        options.limit = parseInt(limit as string);
      }
      
      if (unreadOnly === 'true') {
        options.unreadOnly = true;
      }
      
      const notifications = await storage.getUserNotifications(userId, options);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error counting notifications:", error);
      res.status(500).json({ message: "Failed to count notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      
      // Check if user is allowed to create notifications for the specified user
      if (validatedData.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "You can only create notifications for your own account" });
      }
      
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify notification belongs to this user
      const notification = await storage.getNotification(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const updatedCount = await storage.markAllNotificationsAsRead(userId);
      res.json({ message: `Marked ${updatedCount} notifications as read`, count: updatedCount });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify notification belongs to this user
      const notification = await storage.getNotification(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteNotification(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.delete("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const { readOnly } = req.query;
      
      let deletedCount;
      if (readOnly === 'true') {
        deletedCount = await storage.deleteReadNotifications(userId);
      } else {
        deletedCount = await storage.deleteAllUserNotifications(userId);
      }
      
      res.status(200).json({ 
        message: `Successfully deleted ${deletedCount} notifications`,
        count: deletedCount
      });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      res.status(500).json({ message: "Failed to delete notifications" });
    }
  });

  // AI Chat endpoint using OpenAI
  app.post("/api/chat", async (req, res) => {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: 'AI service unavailable, please configure OpenAI API key',
          choices: [{
            message: {
              role: 'assistant',
              content: 'Sorry, the AI assistant is currently unavailable. Please try again later.'
            }
          }]
        });
      }
      
      // Use OpenAI for chat responses
      return await handleChatRequest(req, res);
    } catch (error) {
      console.error('Chat endpoint error:', error);
      return res.status(500).json({ error: 'Failed to process chat request' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
