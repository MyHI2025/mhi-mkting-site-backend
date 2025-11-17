import { storage } from '../../storage';
import { logUserAction } from '../../auth';
import { Request } from 'express';
import { cloudinaryService, ICloudinaryService } from '../../services/Cloudinary.service';
import NotFoundError from '../../errors/NotFound';
import InternalServerError from '../../errors/InternalServer';

export class MediaService {
  constructor(private readonly cloudinaryService?: ICloudinaryService) {}
  async getAllMedia(search?: string) {
    if (search && typeof search === 'string') {
      return await storage.searchMediaAssets(search);
    }
    return await storage.getAllMediaAssets();
  }

  async getMediaAsset(id: string) {
    const asset = await storage.getMediaAsset(id);
    if (!asset) {
      throw new NotFoundError("Media asset not found");
    }
    return asset;
  }

  async createMediaAsset(file: Express.Multer.File, altText: string | null, caption: string | null, currentUserId: string, req: Request) {
    // const fileUrl = `/uploads/${file.filename}`;
    const cloudinaryResult =  await this.cloudinaryService?.uploadFile(file.path, {
      folder: 'media_assets',
      use_filename: true,
    })
    console.log('Cloudinary upload result:', cloudinaryResult);
    
    const mediaAssetData = {
      filename: cloudinaryResult?.public_id || file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: cloudinaryResult?.bytes || file.size,
      url: cloudinaryResult?.secure_url || `/uploads/${file.filename}`,
      altText: altText || null,
      caption: caption || null,
      uploadedBy: currentUserId,
      cloudinaryPublicId: cloudinaryResult?.public_id || null,
    };
    
    const newAsset = await storage.createMediaAsset(mediaAssetData);
    
    // await storage.updateMediaAsset(newAsset.id, {
    //   uploadedBy: currentUserId,
    // });
    
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
      throw new NotFoundError("Media asset not found");
    }
    
    await logUserAction(currentUserId, "update", "media", id, { 
      filename: updatedAsset.filename 
    }, req);
    
    return updatedAsset;
  }

  async deleteMediaAsset(id: string, currentUserId: string, req: Request) {
    console.log('Deleting media asset:', id);
    const asset = await storage.getMediaAsset(id);
    if (!asset) {
      throw new NotFoundError("Media asset not found");
    }

    await this.cloudinaryService?.deleteFile(asset?.filename || '');
    
    const deleted = await storage.deleteMediaAsset(id);
    
    if (!deleted) {
      throw new InternalServerError("Failed to delete media asset");
    }
    
    await logUserAction(currentUserId, "delete", "media", id, { 
      filename: asset.filename 
    }, req);
    
    return { message: "Media asset deleted successfully" };
  }
}

export const mediaService = new MediaService(cloudinaryService);
