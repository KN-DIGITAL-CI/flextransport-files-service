import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import process from 'process';
import env from './env';

dotenv.config();

const corsOptions = {
  origin: (
    origin: string,
    callback: (error: Error | null, origin?: boolean) => void
  ) => {
    const allowedOrigins = [
      env[process.env.NODE_ENV as keyof typeof env].FLEXMO_PAY_ADMIN_URL,
      env[process.env.NODE_ENV as keyof typeof env].FLEXMO_ADMIN_URL,
      env[process.env.NODE_ENV as keyof typeof env].FLEXMO_PAY_PAYMENT_URL,
      env[process.env.NODE_ENV as keyof typeof env].FLEXMO_LANDING_URL,
      'POSTMAN',
      'TIERS-SERVICE',
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'MerchantId',
    'ApiKey',
    'Env',
    'Origin',
    'deviceid',
    'token',
    'provider',
    'PermissionType',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposedHeaders: ['Authorization'],
  maxAge: 31536000, // 1 year
  secure: true,
  useProxyHeaders: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various old versions of Android) choke on 204
};

export const useServerConfig = (app: express.Application) => {
  app.use(express.json());
  app.use(cors(corsOptions as CorsOptions));
  app.use(helmet());
  // Servir les fichiers statiques depuis le dossier public
  app.use('/public', express.static('public'));
};
