import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { type User, type Role, type Permission } from "@myhi2025/shared";
import { systemRepository } from "./repositories/implementations/system.repository.impl";
import dotenv from "dotenv";
dotenv.config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "24h";
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT token generation
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId, type: "access" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
};

// JWT token verification
export const verifyToken = (
  token: string
): { userId: string; type: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      type: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== "access") {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  try {
    const user = await storage.getUser(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: "User not found or inactive" });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};

// Permission checking
export const getUserPermissions = async (
  userId: string
): Promise<Permission[]> => {
  const userRoles = await storage.getUserRoles(userId);
  const allPermissions: Permission[] = [];

  for (const userRole of userRoles) {
    const role = await storage.getRole(userRole.roleId);
    if (role && role.permissions) {
      allPermissions.push(...(role.permissions as Permission[]));
    }
  }

  // Remove duplicates
  const uniquePermissions = allPermissions.filter(
    (permission, index, self) =>
      index === self.findIndex((p) => p.resource === permission.resource)
  );

  return uniquePermissions;
};

export const hasPermission = async (
  userId: string,
  resource: string,
  action: string
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);

  return permissions.some(
    (permission) =>
      permission.resource === resource &&
      permission.actions.includes(action as any)
  );
};

// Authorization middleware factory
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAccess = await hasPermission(user.id, resource, action);
    if (!hasAccess) {
      // Log unauthorized access attempt
      await storage.createAuditLog({
        userId: user.id,
        action: "unauthorized_access",
        resource: resource,
        resourceId: null,
        details: {
          attempted_action: action,
          ip_address: req.ip,
          user_agent: req.get("User-Agent"),
        },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null,
        // createdAt: new Date(),
      });

      return res.status(403).json({
        error: `Insufficient permissions. Required: ${action} on ${resource}`,
      });
    }

    next();
  };
};

// User session management
export const createUserSession = async (userId: string): Promise<string> => {
  // Clean up any existing sessions for this user first (optional, for single session per user)
  // await storage.deleteUserSessions(userId);

  const refreshToken = generateRefreshToken(userId);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

  await storage.createSession(userId, refreshToken, expiresAt);
  return refreshToken;
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<string | null> => {
  // First verify the JWT token itself
  const decoded = verifyToken(refreshToken);
  if (!decoded || decoded.type !== "refresh") {
    return null;
  }

  // Then check if session exists and is not expired
  const session = await systemRepository.findSessionByToken(refreshToken);
  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt! < new Date()) {
    // Clean up expired session
    await storage.deleteSession(refreshToken);
    return null;
  }

  const user = await storage.getUser(session.userId!);
  if (!user || !user.isActive) {
    // Clean up invalid session
    await storage.deleteSession(refreshToken);
    return null;
  }

  return generateAccessToken(user.id);
};

// Logout and session cleanup
export const logoutUser = async (refreshToken: string): Promise<boolean> => {
  // Verify the refresh token first
  const decoded = verifyToken(refreshToken);
  if (decoded && decoded.type === "refresh") {
    // Log the logout action
    await storage.createAuditLog({
      userId: decoded.userId,
      action: "logout",
      resource: "auth",
      resourceId: null,
      details: { token_invalidated: true },
      ipAddress: null,
      userAgent: null,
      // createdAt: new Date(),
    });
  }

  const result = await storage.deleteSession(refreshToken);
  return result;
};

export const logoutAllUserSessions = async (
  userId: string
): Promise<boolean> => {
  // Log the logout all action
  await storage.createAuditLog({
    userId,
    action: "logout_all",
    resource: "auth",
    resourceId: null,
    details: { all_sessions_invalidated: true },
    ipAddress: null,
    userAgent: null,
    // createdAt: new Date(),
  });

  // Note: deleteUserSessions not yet implemented in storage
  // return await storage.deleteUserSessions(userId);
  return true;
};

// Audit logging helper
export const logUserAction = async (
  userId: string,
  action: string,
  resource: string,
  resourceId: string | null,
  details: any,
  req: Request
) => {
  await storage.createAuditLog({
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.ip || null,
    userAgent: req.get("User-Agent") || null,
    // createdAt: new Date(),
  });
};

// Security helpers
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password change tracking for security
export const requirePasswordChange = async (
  userId: string
): Promise<boolean> => {
  const user = await storage.getUser(userId);
  if (!user) return false;

  // Mark user as requiring password change
  await storage.updateUser(userId, {
    // Note: We'd need to add a requirePasswordChange field to the schema for this
    // For now, we'll use audit logs to track this
  });

  await storage.createAuditLog({
    userId,
    action: "require_password_change",
    resource: "users",
    resourceId: userId,
    details: { reason: "default_password_usage" },
    ipAddress: null,
    userAgent: "System",
    // createdAt: new Date(),
  });

  return true;
};

const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const checkRateLimit = (
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): boolean => {
  const now = new Date();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  const timeDiff = now.getTime() - attempt.lastAttempt.getTime();

  if (timeDiff > windowMs) {
    // Reset window
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  if (attempt.count >= maxAttempts) {
    return false;
  }

  attempt.count++;
  attempt.lastAttempt = now;
  loginAttempts.set(identifier, attempt);

  return true;
};

export const resetRateLimit = (identifier: string): void => {
  loginAttempts.delete(identifier);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  return false;
};

export const blacklistToken = async (
  token: string,
  reason: string
): Promise<void> => {};
