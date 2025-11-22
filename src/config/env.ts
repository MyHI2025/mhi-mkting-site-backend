import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 5050,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',

  // Zoho CRM configuration
  zohoClientId: process.env.ZOHO_CLIENT_ID || '',
  zohoClientSecret: process.env.ZOHO_CLIENT_SECRET || '',
  zohoDataCenter: process.env.ZOHO_DATA_CENTER || '',
  zohoAuthorizationCode: process.env.ZOHO_AUTHORIZATION_CODE || '',

  // Cloudinary configuration
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};