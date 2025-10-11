import type { User, InsertUser, Role, InsertRole } from "@myhealthintegral/shared";
import { IBaseRepository, NotFoundError, DuplicateError } from "./base.repository";

/**
 * Users Repository Interface
 * Handles all user-related data operations
 */
export interface IUsersRepository {
  // User CRUD
  findUserById(id: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  createUser(data: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<{ success: boolean; message: string }>;
  
  // Role management
  findRoleById(id: string): Promise<Role | null>;
  findRoleByName(name: string): Promise<Role | null>;
  getAllRoles(): Promise<Role[]>;
  createRole(data: InsertRole): Promise<Role>;
  updateRole(id: string, data: Partial<Role>): Promise<Role>;
  
  // User-Role associations
  getUserRoles(userId: string): Promise<Role[]>;
  assignRoleToUser(userId: string, roleId: string): Promise<{ success: boolean }>;
  removeRoleFromUser(userId: string, roleId: string): Promise<{ success: boolean }>;
}
