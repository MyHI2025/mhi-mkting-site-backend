import { storage } from '../../storage';
import { logUserAction } from '../../auth';
import { Request } from 'express';

export class MediaService {
  async getAllMedia(search?: string) {
    if (search && typeof search === 'string') {
      return await storage.searchMediaAssets(search);
    }
    return await storage.getAllMediaAssets();
  }

  async getMediaAsset(id: string) {
    const asset = await storage.getMediaAsset(id);
    if (!asset) {
      throw { status: 404, message: "Media asset not found" };
    }
    return asset;
  }

  async createMediaAsset(file: Express.Multer.File, altText: string | null, caption: string | null, currentUserId: string, req: Request) {
    const fileUrl = `/uploads/${file.filename}`;
    
    const mediaAssetData = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
      altText: altText || null,
      caption: caption || null,
    };
    
    const newAsset = await storage.createMediaAsset(mediaAssetData);
    
    await storage.updateMediaAsset(newAsset.id, {
      uploadedBy: currentUserId,
    });
    
    await logUserAction(currentUserId, "create", "media", newAsset.id, { 
      filename: newAsset.filename,
      file_type: newAsset.mimeType,
      file_size: newAsset.size 
    }, req);
    
    return newAsset;
  }

  async updateMediaAsset(id: string, data: any, currentUserId: string, req: Request) {
    const updatedAsset = await storage.updateMediaAsset(id, data);
    
    if (!updatedAsset) {
      throw { status: 404, message: "Media asset not found" };
    }
    
    await logUserAction(currentUserId, "update", "media", id, { 
      filename: updatedAsset.filename 
    }, req);
    
    return updatedAsset;
  }

  async deleteMediaAsset(id: string, currentUserId: string, req: Request) {
    const asset = await storage.getMediaAsset(id);
    if (!asset) {
      throw { status: 404, message: "Media asset not found" };
    }
    
    const deleted = await storage.deleteMediaAsset(id);
    
    if (!deleted) {
      throw { status: 404, message: "Media asset not found" };
    }
    
    await logUserAction(currentUserId, "delete", "media", id, { 
      filename: asset.filename 
    }, req);
    
    return { message: "Media asset deleted successfully" };
  }
}

export const mediaService = new MediaService();
