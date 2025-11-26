import { Router } from 'express';
import { mediaPositionsService } from './media-positions.service';
import { asyncHandler } from '../common/errorHandlers';

const router = Router();

router.get("/public/position", asyncHandler(async (req, res) => {
  const positions = await mediaPositionsService.getActiveMediaPositions();
  res.json(positions);
}));

router.get("/public/position/:key", asyncHandler(async (req, res) => {
  const { key } = req.params;
  console.log("Fetching media position for key:", key);
  const position = await mediaPositionsService.getMediaPositionByKey(key);
  res.json(position);
}));

export default router;
