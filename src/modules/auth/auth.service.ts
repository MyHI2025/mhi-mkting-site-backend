import { storage } from '../../storage';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  createUserSession,
  refreshAccessToken,
  logoutUser,
  logUserAction,
  checkRateLimit,
  resetRateLimit
} from '../../auth';
import { Request } from 'express';

export class AuthService {
  async login(username: string, password: string, req: Request) {
    const identifier = req.ip || username;
    
    if (!checkRateLimit(identifier)) {
      throw { status: 429, message: "Too many login attempts. Please try again later." };
    }

    const user = await storage.getUserByUsername(username);
    if (!user || !user.isActive) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw { status: 401, message: "Invalid credentials" };
    }

    resetRateLimit(identifier);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await createUserSession(user.id);

    await storage.updateUser(user.id, { lastLoginAt: new Date() });
    await logUserAction(user.id, "login", "auth", null, { success: true }, req);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw { status: 400, message: "Refresh token is required" };
    }

    const newAccessToken = await refreshAccessToken(refreshToken);
    
    if (!newAccessToken) {
      throw { status: 401, message: "Invalid or expired refresh token" };
    }

    return { accessToken: newAccessToken };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await logoutUser(refreshToken);
    }
    return { message: "Logged out successfully" };
  }

  async getCurrentUser(userId: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const userRoles = await storage.getUserRoles(userId);
    const roleIds = userRoles.map(ur => ur.roleId);
    const roles = [];
    for (const roleId of roleIds) {
      const role = await storage.getRole(roleId);
      if (role) roles.push(role);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      lastLoginAt: user.lastLoginAt,
      roles
    };
  }
}

export const authService = new AuthService();
