import { Router } from "express";
import { videosService } from "./videos.service";
import { authenticateToken, requirePermission } from "../common";
import { insertVideoContentSchema } from "@myhi2025/shared";
import { asyncHandler } from "../common/errorHandlers";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const videos = await videosService.getAllVideos();
    res.json(videos);
  })
);

router.get(
  "/:id",
  authenticateToken,
  requirePermission("content", "read"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await videosService.getVideo(id);
    res.json(video);
  })
);

router.post(
  "/",
  authenticateToken,
  requirePermission("content", "create"),
  asyncHandler(async (req, res) => {
    const validatedData = insertVideoContentSchema.parse(req.body);
    const currentUser = (req as any).user;

    const newVideo = await videosService.createVideo(
      validatedData,
      currentUser.id,
      req
    );
    res.status(201).json(newVideo);
  })
);

router.put(
  "/:id",
  authenticateToken,
  requirePermission("content", "update"),
  asyncHandler(async (req, res) => {
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
  })
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("content", "delete"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const result = await videosService.deleteVideo(id, currentUser.id, req);
    res.json(result);
  })
);

export default router;
