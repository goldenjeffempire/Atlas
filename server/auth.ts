import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import jwt from "jsonwebtoken";
//const { sign } = jsonwebtoken; //Removed incorrect destructuring
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES = '12h';
const JWT_REFRESH_EXPIRES = '7d';
const JWT_OPTIONS = {
  expiresIn: '7d'
};
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import type { Express } from "express";

const scryptAsync = promisify(scrypt);

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  // JWT Secret
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    },
    name: '__secure_session',
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) return done(null, false);

      const [hashedPassword, salt] = user.password.split('.');
      const hashedBuffer = await scryptAsync(password, salt, 64) as Buffer;
      const storedHashedBuffer = Buffer.from(hashedPassword, 'hex');

      if (!timingSafeEqual(hashedBuffer, storedHashedBuffer)) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByEmail(profile.emails![0].value);

        if (!user) {
          user = await storage.createUser({
            email: profile.emails![0].value,
            name: profile.displayName,
            googleId: profile.id,
            role: 'general'
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // LinkedIn OAuth Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "/auth/linkedin/callback",
      scope: ['r_emailaddress', 'r_liteprofile']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByEmail(profile.emails![0].value);

        if (!user) {
          user = await storage.createUser({
            email: profile.emails![0].value,
            name: profile.displayName,
            linkedinId: profile.id,
            role: 'general'
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, role, companyName, adminTitle, adminDepartment } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Special handling for admin registration
      if (role === 'admin') {
        const existingAdmins = await storage.getAdminCount();
        if (existingAdmins === 0 || req.body.isOwner) {
          // First admin becomes super admin
          const salt = randomBytes(16).toString('hex');
          const hashedBuffer = await scryptAsync(password, salt, 64) as Buffer;
          const hashedPassword = `${hashedBuffer.toString('hex')}.${salt}`;

          const user = await storage.createUser({
            email,
            password: hashedPassword,
            name,
            role: 'admin',
            companyName,
            adminTitle,
            adminDepartment,
            isActive: true,
            verified: true,
            isSuperAdmin: true
          });

          return res.json({ message: 'Admin registration successful', user });
        }
      }

      const salt = randomBytes(16).toString('hex');
      const hashedBuffer = await scryptAsync(password, salt, 64) as Buffer;
      const hashedPassword = `${hashedBuffer.toString('hex')}.${salt}`;

      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role,
        verified: false
      });

      // Send verification email
      // TODO: Implement verification email sending

      res.json({ message: 'Registration successful' });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/direct-access', async (req, res) => {
    try {
      // Create a temporary user session
      const tempUser = {
        id: 999,
        email: 'guest@atlas.app',
        name: 'Guest User',
        role: 'general',
        companyName: 'Guest Company',
        isActive: true,
        verified: true
      };

      const token = jwt.sign({ id: tempUser.id }, JWT_SECRET, JWT_OPTIONS);
      res.cookie('jwt', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 
      });

      return res.status(200).json({ 
        success: true,
        user: tempUser
      });
    } catch (error) {
      console.error('Direct access error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      passport.authenticate('local', async (err, user, info) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const token = jwt.sign({ id: user.id }, JWT_SECRET, JWT_OPTIONS);
          res.cookie('jwt', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 
          });

          const { password, ...safeUserData } = user;
          return res.status(200).json({ 
            success: true,
            user: safeUserData 
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/api/auth/google/callback', passport.authenticate('google'), (req, res) => {
    res.redirect('/dashboard');
  });

  app.get('/api/auth/linkedin', passport.authenticate('linkedin'));
  app.get('/api/auth/linkedin/callback', passport.authenticate('linkedin'), (req, res) => {
    res.redirect('/dashboard');
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.clearCookie('jwt');
      res.json({ message: 'Logged out' });
    });
  });
}

// Middleware to verify JWT
export function verifyJWT(req: any, res: any, next: any) {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = (decoded as any).id;
    next();
  } catch (error) {
    res.clearCookie('jwt');
    res.status(401).json({ message: 'Invalid token' });
  }
}