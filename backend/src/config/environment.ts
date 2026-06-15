export const Config = {
  app: {
    name: process.env.APP_NAME || 'College ERP',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5001'),
    url: process.env.APP_URL || 'http://localhost:5001',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    name: process.env.DB_NAME || 'eiilm_college',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'cloudinary', // 'cloudinary' | 's3'
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      s3Bucket: process.env.AWS_S3_BUCKET || '',
    },
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@collegeerp.com',
  },
  frontend: {
    url: (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim(),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};
