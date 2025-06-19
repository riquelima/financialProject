import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertSettingsSchema, insertActiveMonthSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user session
      (req as any).session.userId = user.id;
      
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        username: userData.username,
        password_hash: passwordHash
      });
      
      // Store user session
      (req as any).session.userId = user.id;
      
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy();
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({ user: { id: user.id, username: user.username } });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    req.userId = req.session.userId;
    next();
  };

  // Month data routes
  app.get("/api/months", requireAuth, async (req: any, res) => {
    try {
      const months = await storage.getUserMonths(req.userId);
      res.json(months);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch months" });
    }
  });

  app.get("/api/months/:monthYear", requireAuth, async (req: any, res) => {
    try {
      const monthData = await storage.getMonthData(req.userId, req.params.monthYear);
      if (!monthData) {
        // Create default month data
        const newMonthData = await storage.createMonthData({
          user_id: req.userId,
          month_year: req.params.monthYear,
          opening_balance: 0,
          credit_card_limit: 0
        });
        return res.json(newMonthData);
      }
      res.json(monthData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch month data" });
    }
  });

  // Transaction routes
  app.get("/api/transactions/:monthYear", requireAuth, async (req: any, res) => {
    try {
      const transactions = await storage.getTransactions(req.userId, req.params.monthYear);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req: any, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Ensure month data exists
      let monthData = await storage.getMonthData(req.userId, transactionData.date.substring(0, 7));
      if (!monthData) {
        monthData = await storage.createMonthData({
          user_id: req.userId,
          month_year: transactionData.date.substring(0, 7),
          opening_balance: 0,
          credit_card_limit: 0
        });
      }
      
      const transaction = await storage.createTransaction({
        ...transactionData,
        month_data_id: monthData.id,
        user_id: req.userId
      });
      
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Settings routes
  app.get("/api/settings", requireAuth, async (req: any, res) => {
    try {
      let settings = await storage.getSettings(req.userId);
      if (!settings) {
        // Create default settings
        settings = await storage.upsertSettings({
          user_id: req.userId,
          currency_symbol: "R$",
          user_name_display: "Usuário",
          theme: "dark"
        });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", requireAuth, async (req: any, res) => {
    try {
      const settingsData = insertSettingsSchema.parse({
        ...req.body,
        user_id: req.userId
      });
      
      const settings = await storage.upsertSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  // Active month routes
  app.get("/api/active-month", requireAuth, async (req: any, res) => {
    try {
      let activeMonth = await storage.getActiveMonth(req.userId);
      if (!activeMonth) {
        // Set current month as default
        const currentDate = new Date();
        const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        activeMonth = await storage.setActiveMonth({
          user_id: req.userId,
          active_month_year: monthYear
        });
      }
      res.json(activeMonth);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active month" });
    }
  });

  app.post("/api/active-month", requireAuth, async (req: any, res) => {
    try {
      const activeMonthData = insertActiveMonthSchema.parse({
        ...req.body,
        user_id: req.userId
      });
      
      const activeMonth = await storage.setActiveMonth(activeMonthData);
      res.json(activeMonth);
    } catch (error) {
      res.status(400).json({ message: "Invalid active month data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
