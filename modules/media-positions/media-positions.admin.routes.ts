import { Router } from 'express';
import { mediaPositionsService } from './media-positions.service';
import { authenticateToken, requirePermission } from '../common';
import { insertMediaPositionSchema } from '@myhealthintegral/shared';
import { asyncHandler } from '../common/errorHandlers';

const router = Router();

router.get("/", authenticateToken, requirePermission("content", "read"), asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  if (category && typeof category === "string") {
    const positions = await mediaPositionsService.getMediaPositionsByCategory(category);
    res.json(positions);
  } else {
    const positions = await mediaPositionsService.getAllMediaPositions();
    res.json(positions);
  }
}));

router.get("/:id", authenticateToken, requirePermission("content", "read"), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const position = await mediaPositionsService.getMediaPosition(id);
  res.json(position);
}));

router.post("/", authenticateToken, requirePermission("content", "create"), asyncHandler(async (req, res) => {
  const validatedData = insertMediaPositionSchema.parse(req.body);
  const currentUser = (req as any).user;
  
  const newPosition = await mediaPositionsService.createMediaPosition(validatedData, currentUser.id, req);
  res.status(201).json(newPosition);
}));

router.put("/:id", authenticateToken, requirePermission("content", "update"), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = (req as any).user;
  
  const updateSchema = insertMediaPositionSchema.partial();
  const validatedData = updateSchema.parse(req.body);
  
  const updatedPosition = await mediaPositionsService.updateMediaPosition(id, validatedData, currentUser.id, req);
  res.json(updatedPosition);
}));

router.delete("/:id", authenticateToken, requirePermission("content", "delete"), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = (req as any).user;
  
  const result = await mediaPositionsService.deleteMediaPosition(id, currentUser.id, req);
  res.json(result);
}));

export default router;
