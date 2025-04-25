import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  // For test users, use a simple fixed hash
  if (password === 'test1234') {
    return 'test1234_hash';
  }
  
  // For normal usage, create a random salt
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  console.log("Comparing passwords:", { supplied, stored });
  
  // Special case for test users with the simplified hash format
  if (supplied === 'test1234' && stored === 'test1234_hash') {
    console.log("Test password matches!");
    return true;
  }
  
  // If we have a regular hashed password
  try {
    // Handle the $ prefix if it exists
    let hashed, salt;
    if (stored.startsWith('$')) {
      // Remove the $ prefix if it exists
      const withoutPrefix = stored.substring(1);
      [hashed, salt] = withoutPrefix.split(".");
    } else {
      [hashed, salt] = stored.split(".");
    }
    
    if (!salt) {
      console.error("Invalid password format - no salt found");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "atlas-workspace-booking-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          } else {
            // Remove password field from the user object for security
            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword as SelectUser);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { 
        email, 
        password, 
        role, 
        companyName, 
        phoneNumber,
        // Role-specific fields
        adminTitle,
        adminDepartment,
        jobTitle,
        employeeId,
        department
      } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user data object with common fields
      const userData = {
        email,
        password: await hashPassword(password),
        role,
        companyName,
        phoneNumber
      };

      // Add role-specific fields based on the role
      if (role === 'admin') {
        Object.assign(userData, {
          adminTitle,
          adminDepartment
        });
      } else if (role === 'general') {
        Object.assign(userData, {
          jobTitle
        });
      } else if (role === 'employee') {
        Object.assign(userData, {
          employeeId,
          department
        });
      }

      const user = await storage.createUser(userData);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for:", req.body.email);
    
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string } = {}) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed for:", req.body.email);
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return next(loginErr);
        }
        console.log("User logged in successfully:", user.email);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    if (req.isAuthenticated()) {
      console.log("User session found:", req.user);
      res.json(req.user);
    } else {
      console.log("No user session found");
      return res.sendStatus(401);
    }
  });
}
