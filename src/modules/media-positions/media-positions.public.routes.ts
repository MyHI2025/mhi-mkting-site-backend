import { Router } from 'express';
import { mediaPositionsService } from './media-positions.service';
import { asyncHandler } from '../common/errorHandlers';

const router = Router();

router.get("/public/media-positions", asyncHandler(async (req, res) => {
  const positions = await mediaPositionsService.getActiveMediaPositions();
  res.json(positions);
}));

router.get("/public/media-positions/:key", asyncHandler(async (req, res) => {
  const { key } = req.params;
  const position = await mediaPositionsService.getMediaPositionByKey(key);
  res.json(position);
}));

export default router;
