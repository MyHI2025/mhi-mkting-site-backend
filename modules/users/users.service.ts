import { storage } from '../../storage';
import { hashPassword, validatePasswordStrength, logUserAction } from '../../auth';
import { insertUserSchema, insertRoleSchema, updateUserPasswordSchema } from '@myhealthintegral/shared';
import { z } from 'zod';
import { Request } from 'express';

export class UsersService {
  async getAllUsers() {
    const users = await storage.getAllUsers();
    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async createUser(data: z.infer<typeof insertUserSchema>, currentUserId: string, req: Request) {
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw {
        status: 400,
        message: "Password does not meet requirements",
        details: passwordValidation.errors
      };
    }

    const existingUserByUsername = await storage.getUserByUsername(data.username);
    if (existingUserByUsername) {
      throw { status: 400, message: "Username already exists" };
    }

    const existingUserByEmail = await storage.getUserByEmail(data.email);
    if (existingUserByEmail) {
      throw { status: 400, message: "Email already exists" };
    }

    const hashedPassword = await hashPassword(data.password);
    
    const newUser = await storage.createUser({
      ...data,
      password: hashedPassword
    });

    await logUserAction(currentUserId, "create", "users", newUser.id, { created_user: newUser.username }, req);

    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  async getAllRoles() {
    return await storage.getAllRoles();
  }

  async createRole(data: z.infer<typeof insertRoleSchema>, currentUserId: string, req: Request) {
    const existingRole = await storage.getRoleByName(data.name);
    if (existingRole) {
      throw { status: 400, message: "Role name already exists" };
    }

    const newRole = await storage.createRole(data);
    await logUserAction(currentUserId, "create", "roles", newRole.id, { role_name: newRole.name }, req);

    return newRole;
  }

  async assignUserRole(userId: string, roleId: string, currentUserId: string, req: Request) {
    const user = await storage.getUser(userId);
    const role = await storage.getRole(roleId);
    
    if (!user) {
      throw { status: 404, message: "User not found" };
    }
    
    if (!role) {
      throw { status: 404, message: "Role not found" };
    }

    const existingUserRoles = await storage.getUserRoles(userId);
    const isAlreadyAssigned = existingUserRoles.some(ur => ur.roleId === roleId);
    
    if (isAlreadyAssigned) {
      throw { status: 400, message: "Role already assigned to user" };
    }

    const userRole = await storage.assignUserRole(userId, roleId);
    
    await logUserAction(currentUserId, "assign_role", "users", userId, { 
      role_name: role.name, 
      target_user: user.username 
    }, req);

    return userRole;
  }

  async updateUserPassword(userId: string, data: z.infer<typeof updateUserPasswordSchema>, currentUserId: string, req: Request) {
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const passwordValidation = validatePasswordStrength(data.newPassword);
    if (!passwordValidation.isValid) {
      throw {
        status: 400,
        message: "Password does not meet requirements",
        details: passwordValidation.errors
      };
    }

    const hashedPassword = await hashPassword(data.newPassword);
    
    await storage.updateUser(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    await logUserAction(currentUserId, "update_password", "users", userId, { 
      target_user: user.username 
    }, req);

    return { success: true, message: "Password updated successfully" };
  }
}

export const usersService = new UsersService();
