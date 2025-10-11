import { Router } from 'express';
import multer from 'multer';
import { mediaService } from './media.service';
import { authenticateToken, requirePermission } from '../common';
import { upload } from './media.config';

const router = Router();

router.get("/", authenticateToken, requirePermission("media", "read"), async (req, res) => {
  try {
    const { search } = req.query;
    const mediaAssets = await mediaService.getAllMedia(search as string);
    res.json(mediaAssets);
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticateToken, requirePermission("media", "read"), async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await mediaService.getMediaAsset(id);
    res.json(asset);
  } catch (error: any) {
    console.error("Get media asset error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.post("/", authenticateToken, requirePermission("media", "create"), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const currentUser = (req as any).user;
    const file = req.file;
    const altText = req.body.altText || null;
    const caption = req.body.caption || null;
    
    const newAsset = await mediaService.createMediaAsset(file, altText, caption, currentUser.id, req);
    res.status(201).json(newAsset);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "File size too large. Maximum size is 10MB." });
      }
      return res.status(400).json({ error: error.message });
    }
    
    console.error("Create media asset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", authenticateToken, requirePermission("media", "update"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const updatedAsset = await mediaService.updateMediaAsset(id, req.body, currentUser.id, req);
    res.json(updatedAsset);
  } catch (error: any) {
    console.error("Update media asset error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

router.delete("/:id", authenticateToken, requirePermission("media", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const result = await mediaService.deleteMediaAsset(id, currentUser.id, req);
    res.json(result);
  } catch (error: any) {
    console.error("Delete media asset error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
});

export default router;
