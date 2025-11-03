import { Router } from "express";
import { z } from "zod";
import { mediaPositionsService } from "./media-positions.service";
import { authenticateToken, requirePermission } from "../common";
import { insertMediaPositionSchema } from "@myhi2025/shared";

const router = Router();

// Public route - get active media positions
router.get("/public/positions", async (req, res) => {
  try {
    const positions = await mediaPositionsService.getActiveMediaPositions();
    res.json(positions);
  } catch (error) {
    console.error("Get public media positions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Public route - get media position by key
router.get("/public/position/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const position = await mediaPositionsService.getMediaPositionByKey(key);
    res.json(position);
  } catch (error) {
    console.error("Get public media position by key error:", error);
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
      const { category } = req.query;

      if (category && typeof category === "string") {
        const positions =
          await mediaPositionsService.getMediaPositionsByCategory(category);
        res.json(positions);
      } else {
        const positions = await mediaPositionsService.getAllMediaPositions();
        res.json(positions);
      }
    } catch (error) {
      console.error("Get media positions error:", error);
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
      const position = await mediaPositionsService.getMediaPosition(id);
      res.json(position);
    } catch (error: any) {
      console.error("Get media position error:", error);
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
      const validatedData = insertMediaPositionSchema.parse(req.body);
      const currentUser = (req as any).user;

      const newPosition = await mediaPositionsService.createMediaPosition(
        validatedData,
        currentUser.id,
        req
      );
      res.status(201).json(newPosition);
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
      console.error("Create media position error:", error);
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
      const updateSchema = insertMediaPositionSchema.partial();
      const validatedData = updateSchema.parse(req.body);

      const updatedPosition = await mediaPositionsService.updateMediaPosition(
        id,
        validatedData,
        currentUser.id,
        req
      );
      res.json(updatedPosition);
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
      console.error("Update media position error:", error);
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

      await mediaPositionsService.deleteMediaPosition(id, currentUser.id, req);
      res.status(204).send();
    } catch (error: any) {
      console.error("Delete media position error:", error);
      const status = error.status || 500;
      const message = error.message || "Internal server error";
      res.status(status).json({ error: message });
    }
  }
);

export default router;
