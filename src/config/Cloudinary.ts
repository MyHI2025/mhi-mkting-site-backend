// src/config/CloudinaryConfig.ts
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

export interface ICloudinaryConfig {
  configure(): void;
}

class CloudinaryConfig implements ICloudinaryConfig {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.cloudName = env.cloudinaryCloudName;
    this.apiKey = env.cloudinaryApiKey;
    this.apiSecret = env.cloudinaryApiSecret;

    this.validate();
  }

  private validate(): void {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error("Cloudinary configuration is missing");
    }
  }

  public configure(): void {
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
  }
}
export const cloudinaryConfig = new CloudinaryConfig();