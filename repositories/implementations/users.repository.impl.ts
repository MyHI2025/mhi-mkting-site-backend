import { IUsersRepository } from "../users.repository";
import { NotFoundError, DuplicateError } from "../base.repository";
import type {
  User,
  InsertUser,
  Role,
  InsertRole,
  UserRole,
} from "@myhi2025/shared";
import { randomUUID } from "crypto";

export class UsersRepositoryImpl implements IUsersRepository {
  private users: Map<string, User>;
  private roles: Map<string, Role>;
  private userRoles: Map<string, UserRole>;

  constructor() {
    this.users = new Map();
    this.roles = new Map();
    this.userRoles = new Map();

    this.initializeDefaultRoles();
  }

  private async initializeDefaultRoles() {
    const superAdminRole: Role = {
      id: randomUUID(),
      name: "super_admin",
      description: "Full system access",
      permissions: [
        { resource: "users", actions: ["create", "read", "update", "delete"] },
        {
          resource: "pages",
          actions: ["create", "read", "update", "delete", "publish"],
        },
        {
          resource: "content",
          actions: ["create", "read", "update", "delete", "publish"],
        },
        { resource: "media", actions: ["create", "read", "update", "delete"] },
        {
          resource: "navigation",
          actions: ["create", "read", "update", "delete"],
        },
        { resource: "themes", actions: ["create", "read", "update", "delete"] },
      ],
      createdAt: new Date(),
    };

    const contentEditorRole: Role = {
      id: randomUUID(),
      name: "content_editor",
      description: "Can edit content and media",
      permissions: [
        { resource: "pages", actions: ["read", "update"] },
        {
          resource: "content",
          actions: ["create", "read", "update", "delete"],
        },
        { resource: "media", actions: ["create", "read", "update", "delete"] },
      ],
      createdAt: new Date(),
    };

    const contentViewerRole: Role = {
      id: randomUUID(),
      name: "content_viewer",
      description: "Read-only access to content",
      permissions: [
        { resource: "pages", actions: ["read"] },
        { resource: "content", actions: ["read"] },
        { resource: "media", actions: ["read"] },
      ],
      createdAt: new Date(),
    };

    this.roles.set(superAdminRole.id, superAdminRole);
    this.roles.set(contentEditorRole.id, contentEditorRole);
    this.roles.set(contentViewerRole.id, contentViewerRole);
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return (
      Array.from(this.users.values()).find(
        (user) => user.username === username
      ) || null
    );
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return (
      Array.from(this.users.values()).find((user) => user.email === email) ||
      null
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(data: InsertUser): Promise<User> {
    const existingByUsername = await this.findUserByUsername(data.username);
    if (existingByUsername) {
      throw new DuplicateError("User", "username");
    }

    const existingByEmail = await this.findUserByEmail(data.email);
    if (existingByEmail) {
      throw new DuplicateError("User", "email");
    }

    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...data,
      id,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    const updatedUser: User = {
      ...user,
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    const userRoles = Array.from(this.userRoles.values()).filter(
      (ur) => ur.userId === id
    );
    userRoles.forEach((userRole) => this.userRoles.delete(userRole.id));

    this.users.delete(id);
    return { success: true, message: "User deleted successfully" };
  }

  async findRoleById(id: string): Promise<Role | null> {
    return this.roles.get(id) || null;
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return (
      Array.from(this.roles.values()).find((role) => role.name === name) || null
    );
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async createRole(data: InsertRole): Promise<Role> {
    const existing = await this.findRoleByName(data.name);
    if (existing) {
      throw new DuplicateError("Role", "name");
    }

    const id = randomUUID();
    const role: Role = {
      ...data,
      id,
      description: data.description || null,
      permissions: data.permissions || [],
      createdAt: new Date(),
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const role = this.roles.get(id);
    if (!role) {
      throw new NotFoundError("Role", id);
    }

    const updatedRole: Role = { ...role, ...data, id };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoleRecords = Array.from(this.userRoles.values()).filter(
      (ur) => ur.userId === userId
    );
    const roles: Role[] = [];
    for (const userRole of userRoleRecords) {
      const role = this.roles.get(userRole.roleId);
      if (role) {
        roles.push(role);
      }
    }
    return roles;
  }

  async assignRoleToUser(
    userId: string,
    roleId: string
  ): Promise<{ success: boolean }> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const role = await this.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError("Role", roleId);
    }

    const existing = Array.from(this.userRoles.values()).find(
      (ur) => ur.userId === userId && ur.roleId === roleId
    );

    if (existing) {
      return { success: true };
    }

    const id = randomUUID();
    const userRole: UserRole = {
      id,
      userId,
      roleId,
      createdAt: new Date(),
    };
    this.userRoles.set(id, userRole);
    return { success: true };
  }

  async removeRoleFromUser(
    userId: string,
    roleId: string
  ): Promise<{ success: boolean }> {
    const userRole = Array.from(this.userRoles.values()).find(
      (ur) => ur.userId === userId && ur.roleId === roleId
    );

    if (!userRole) {
      throw new NotFoundError("UserRole", `${userId}-${roleId}`);
    }

    this.userRoles.delete(userRole.id);
    return { success: true };
  }
}

export const usersRepository = new UsersRepositoryImpl();
