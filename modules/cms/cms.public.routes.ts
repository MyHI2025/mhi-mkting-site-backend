import { Router } from 'express';
import { cmsService } from './cms.service';
import { asyncHandler, sendErrorResponse } from '../common/errorHandlers';

const router = Router();

router.get("/public/pages", asyncHandler(async (req, res) => {
  const pages = await cmsService.getAllPublicPages();
  res.json(pages);
}));

router.get("/public/pages/:pageId/nodes", asyncHandler(async (req, res) => {
  const { pageId } = req.params;
  // Disable HTTP caching for CMS content to ensure real-time updates
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const nodes = await cmsService.getPublicPageNodes(pageId);
  res.json(nodes);
}));

export default router;
