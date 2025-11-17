import {v2 as cloudinary, UploadApiOptions, UploadApiResponse} from 'cloudinary';
import { ICloudinaryConfig, cloudinaryConfig } from '../config/Cloudinary';
import UnauthorizedError from '../errors/Unauthorized';

export interface ICloudinaryService {
  uploadFile(filePath: string, options?: UploadApiOptions): Promise<UploadApiResponse>;
  deleteFile(publicId: string): Promise<UploadApiResponse>;
}

export class CloudinaryService implements ICloudinaryService {
  constructor(private readonly config: ICloudinaryConfig) {
    this.config.configure();
  }

  async uploadFile(filePath: string, options: UploadApiOptions = {}): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, options, (error, result) => {
        if (error) {
          // return reject(error);
          console.error('Cloudinary upload error:', error);
          throw new UnauthorizedError('Cloudinary upload failed');
        }
        resolve(result as UploadApiResponse);
      });
    });
  }

  async deleteFile(publicId: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          // return reject(error);
          console.error('Cloudinary delete error:', error);
          throw new UnauthorizedError('Cloudinary delete failed');
        }
        resolve(result as UploadApiResponse);
      });
    });
  }

}

export const cloudinaryService = new CloudinaryService(cloudinaryConfig);