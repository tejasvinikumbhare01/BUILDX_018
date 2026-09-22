import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/resqgrid?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'resqgrid_super_secret_jwt_key_2026_disaster_resilience',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  WATER_LEVEL_API_KEY: process.env.WATER_LEVEL_API_KEY || '',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
