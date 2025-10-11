import { Router } from 'express';
import { videosService } from './videos.service';
import { asyncHandler } from '../common/errorHandlers';

const router = Router();

router.get("/public/videos", asyncHandler(async (req, res) => {
  const videos = await videosService.getPublishedVideos();
  res.json(videos);
}));

router.post("/public/videos/:id/view", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedVideo = await videosService.incrementVideoViews(id);
  res.json({ views: updatedVideo.views });
}));

export default router;
