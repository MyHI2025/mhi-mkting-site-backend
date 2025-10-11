import { Router } from 'express';
import { usersService } from './users.service';
import { authenticateToken, requirePermission } from '../common';
import { insertUserSchema, insertRoleSchema, updateUserPasswordSchema } from '@myhealthintegral/shared';
import { z } from 'zod';

const router = Router();

router.get("/", authenticateToken, requirePermission("users", "read"), async (req, res) => {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticateToken, requirePermission("users", "create"), async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    const currentUser = (req as any).user;
    
    const newUser = await usersService.createUser(validatedData, currentUser.id, req);
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }
    const err = error as any;
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("Create user error:", error);
    res.status(status).json({ error: message, details: err.details });
  }
});

router.get("/roles", authenticateToken, requirePermission("users", "read"), async (req, res) => {
  try {
    const roles = await usersService.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/roles", authenticateToken, requirePermission("users", "create"), async (req, res) => {
  try {
    const validatedData = insertRoleSchema.parse(req.body);
    const currentUser = (req as any).user;
    
    const newRole = await usersService.createRole(validatedData, currentUser.id, req);
    res.status(201).json(newRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }
    const err = error as any;
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("Create role error:", error);
    res.status(status).json({ error: message });
  }
});

router.post("/:userId/roles", authenticateToken, requirePermission("users", "update"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    
    if (!roleId) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    const currentUser = (req as any).user;
    const userRole = await usersService.assignUserRole(userId, roleId, currentUser.id, req);
    res.status(201).json(userRole);
  } catch (error) {
    const err = error as any;
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("Assign role error:", error);
    res.status(status).json({ error: message });
  }
});

router.patch("/:userId/password", authenticateToken, requirePermission("users", "update"), async (req, res) => {
  try {
    const { userId } = req.params;
    const validatedData = updateUserPasswordSchema.parse(req.body);
    const currentUser = (req as any).user;
    
    const result = await usersService.updateUserPassword(userId, validatedData, currentUser.id, req);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }
    const err = error as any;
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("Update password error:", error);
    res.status(status).json({ error: message, details: err.details });
  }
});

export default router;
