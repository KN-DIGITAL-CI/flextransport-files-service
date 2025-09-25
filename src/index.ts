import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import process from 'process';

import { connectDB } from './config/db.config';
import { logDB } from './config/log';
import { useServerConfig } from './config/server.config';
import { errorHandler } from './middlewares/errorHandler';
import companyUploadRouter from './routes/express/company-upload.routes';
import documentRouter from './routes/express/document.routes';
import fileManagementRouter from './routes/express/file-management.routes';
import fileRouter from './routes/express/file.routes';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app: express.Application = express();
const server: http.Server = http.createServer(app);

const { NODE_ENV } = process.env;
//VARIABLES

//MIDDLEWARE
app.use(helmet()); // Sécurité HTTP headers
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(errorHandler);
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

//APP USE
useServerConfig(app);
//DB CONNECT
connectDB();

//ROUTES
// Servir les fichiers statiques depuis le dossier public
app.use('/public', express.static(path.resolve(process.cwd(), 'public')));

// Serveur de l'API
app.get('/', (req: Request, res: Response) => {
  res.send('Hello to FlexMo Files Service');
});

// Routes pour l'upload organisé par compagnie
app.use('/api/upload', companyUploadRouter);

// Routes de gestion des fichiers
app.use('/api', fileManagementRouter);

// Routes legacy pour compatibilité
app.use('/file', fileRouter);

// Routes pour l'upload organisé par compagnie
app.use('/documents', documentRouter);

// Middleware pour "nettoyer" l'URL avant d'aller chercher le fichier
app.use(
  '/public/company/:companyId/drivers/:driverId/documents/:file',
  (req, res, next) => {
    const { companyId, driverId, file } = req.params;

    // Ton vrai chemin disque correspond à ..._drivers/..._documents
    const filePath = path.resolve(
      process.cwd(),
      'public',
      'company',
      `${companyId}`,
      'drivers',
      `${driverId}`,
      'documents',
      'original',
      file
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        next(err);
      }
    });
  }
);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

server.listen(PORT, () => {
  logDB();
});

process.on('SIGINT', async () => {
  console.log('👋 Stopping server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
