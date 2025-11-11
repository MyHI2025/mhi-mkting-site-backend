import { Router } from "express";
import { z } from "zod";
import { teamService } from "./team.service";
import { authenticateToken, requirePermission } from "../common";
import { insertTeamMemberSchema } from "@myhi2025/shared";

const router = Router();

// Public route - get visible team members
router.get("/public/team", async (req, res) => {
  try {
    const members = await teamService.getVisibleTeamMembers();
    res.json(members);
  } catch (error) {
    console.error("Get public team members error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes - require authentication and permissions
router.get(
  "/",
  authenticateToken,
  requirePermission("content", "read"),
  async (req, res) => {
    try {
      const members = await teamService.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/:id",
  authenticateToken,
  requirePermission("content", "read"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const member = await teamService.getTeamMember(id);
      res.json(member);
    } catch (error: any) {
      console.error("Get team member error:", error);
      const status = error.status || 500;
      const message = error.message || "Internal server error";
      res.status(status).json({ error: message });
    }
  }
);

router.post(
  "/",
  authenticateToken,
  requirePermission("content", "create"),
  async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const currentUser = (req as any).user;

      const newMember = await teamService.createTeamMember(
        validatedData,
        currentUser.id,
        req
      );
      res.status(201).json(newMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      const err = error as any;
      const status = err.status || 500;
      const message = err.message || "Internal server error";
      console.error("Create team member error:", error);
      res.status(status).json({ error: message });
    }
  }
);

router.put(
  "/:id",
  authenticateToken,
  requirePermission("content", "update"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Validate and whitelist only allowed fields for update
      const updateSchema = insertTeamMemberSchema.partial();
      const validatedData = updateSchema.parse(req.body);

      const updatedMember = await teamService.updateTeamMember(
        id,
        validatedData,
        currentUser.id,
        req
      );
      res.json(updatedMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      const err = error as any;
      const status = err.status || 500;
      const message = err.message || "Internal server error";
      console.error("Update team member error:", error);
      res.status(status).json({ error: message });
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("content", "delete"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const result = await teamService.deleteTeamMember(
        id,
        currentUser.id,
        req
      );
      res.json(result);
    } catch (error: any) {
      console.error("Delete team member error:", error);
      const status = error.status || 500;
      const message = error.message || "Internal server error";
      res.status(status).json({ error: message });
    }
  }
);

export default router;
