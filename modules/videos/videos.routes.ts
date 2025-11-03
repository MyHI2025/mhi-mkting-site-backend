import { Router } from "express";
import { z } from "zod";
import { videosService } from "./videos.service";
import { authenticateToken, requirePermission } from "../common";
import { insertVideoContentSchema } from "@myhi2025/shared";

const router = Router();

router.get("/public/videos", async (req, res) => {
  try {
    const videos = await videosService.getPublishedVideos();
    res.json(videos);
  } catch (error) {
    console.error("Get public videos error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/public/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVideo = await videosService.incrementVideoViews(id);
    res.json({ views: updatedVideo.views });
  } catch (error: any) {
    console.error("Increment video views error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.get(
  "/",
  authenticateToken,
  requirePermission("content", "read"),
  async (req, res) => {
    try {
      const videos = await videosService.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
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
      const video = await videosService.getVideo(id);
      res.json(video);
    } catch (error: any) {
      console.error("Get video error:", error);
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
      const validatedData = insertVideoContentSchema.parse(req.body);
      const currentUser = (req as any).user;

      const newVideo = await videosService.createVideo(
        validatedData,
        currentUser.id,
        req
      );
      res.status(201).json(newVideo);
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
      console.error("Create video error:", error);
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

      const updateSchema = insertVideoContentSchema.partial();
      const validatedData = updateSchema.parse(req.body);

      const updatedVideo = await videosService.updateVideo(
        id,
        validatedData,
        currentUser.id,
        req
      );
      res.json(updatedVideo);
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
      console.error("Update video error:", error);
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

      const result = await videosService.deleteVideo(id, currentUser.id, req);
      res.json(result);
    } catch (error: any) {
      console.error("Delete video error:", error);
      const status = error.status || 500;
      const message = error.message || "Internal server error";
      res.status(status).json({ error: message });
    }
  }
);

export default router;
