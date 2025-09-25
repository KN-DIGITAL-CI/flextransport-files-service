import backblaze from 'backblaze-b2';
import { NextFunction, Request, Response } from 'express';
import fssync from 'fs';
import fs from 'fs/promises';
import Jimp from 'jimp';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { FileService } from '../services/file.service';
import {
  ensureFolderExists,
  generateFileMetadata,
  getFolderPath,
  getPublicFileUrl,
  validateDocumentType,
} from './file-organization';
import { handleError } from './functions';

import dotenv from 'dotenv';
dotenv.config();

const folders = ['company', 'drivers', 'vehicles', 'other'];

const b2 = new backblaze({
  applicationKey: process.env.APP_KEY as string,
  applicationKeyId: process.env.KEY_ID as string,
});

// Function to delete a file
async function deleteFile(filePath: string) {
  try {
    if (filePath) {
      await fs.unlink(filePath);
      console.log('Fichier supprimé avec succès:', filePath);
    } else {
      console.warn(
        'Le chemin du fichier est indéfini, aucune suppression effectuée'
      );
    }
  } catch (err) {
    console.error('Erreur lors de la suppression du fichier :', err);
  }
}

// Middleware to handle file uploads using Multer (legacy - memory storage)
const storage = multer.memoryStorage();
export const uploadMulter = multer({
  storage,
}).any();

// Nouvelle fonction d'upload qui fonctionne avec le stockage sur disque
export const uploadFileByCompanyDisk = async (
  req: Request,
  res: Response,
  entityType: string,
  documentType: string
) => {
  try {
    const { companyId, entityId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'ID de compagnie requis' });
    }

    // Valider le type de document
    if (!validateDocumentType(entityType as any, documentType)) {
      return res.status(400).json({
        error: `Type de document non valide pour ${entityType}: ${documentType}`,
      });
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier à uploader' });
    }

    let filesData: any[] = [];

    const uploadPromises = files.map(async (file) => {
      try {
        // Générer les métadonnées du fichier
        const fileMetadata = generateFileMetadata(
          companyId,
          entityType as any,
          entityId,
          documentType || 'autre',
          file.originalname,
          file.mimetype,
          file.size
        );

        // Le fichier est stocké temporairement, on doit le déplacer vers le bon emplacement
        const tempFilePath = (file as any).path;
        const isImage = file.mimetype.startsWith('image/');

        // Obtenir le chemin du dossier final
        const folderPath = getFolderPath(
          entityType as any,
          companyId,
          entityId,
          documentType
        );

        // Créer le dossier final s'il n'existe pas
        await ensureFolderExists(folderPath);

        // Chemin final du fichier
        const finalFilePath = path.join(
          process.cwd(),
          'public',
          folderPath,
          'original',
          fileMetadata.filename
        );

        // Créer le dossier original s'il n'existe pas
        const originalDir = path.dirname(finalFilePath);
        if (!fssync.existsSync(originalDir)) {
          fssync.mkdirSync(originalDir, { recursive: true });
        }

        // Déplacer le fichier du dossier temporaire vers le dossier final
        await fs.rename(tempFilePath, finalFilePath);

        // Générer l'URL publique
        const publicUrl = getPublicFileUrl(folderPath, fileMetadata.filename);

        // Créer une miniature pour les images
        let thumbnailUrl: string | undefined;
        if (isImage) {
          try {
            const image = await Jimp.read(finalFilePath);
            image.resize(200, Jimp.AUTO).quality(70);

            // Chemin pour la miniature
            const thumbPath = path.join(
              process.cwd(),
              'public',
              folderPath,
              'thumb',
              fileMetadata.filename
            );
            const thumbDir = path.dirname(thumbPath);

            // Créer le dossier thumb s'il n'existe pas
            if (!fssync.existsSync(thumbDir)) {
              fssync.mkdirSync(thumbDir, { recursive: true });
            }

            await image.writeAsync(thumbPath);
            thumbnailUrl = getPublicFileUrl(
              folderPath,
              fileMetadata.filename
            ).replace('/original/', '/thumb/');
          } catch (thumbError) {
            console.error(
              'Erreur lors de la création de la miniature:',
              thumbError
            );
          }
        }

        // Préparer les données pour la base de données
        const dbFileData = FileService.convertFileMetadataToDBData(
          fileMetadata,
          publicUrl,
          thumbnailUrl,
          undefined, // Pas d'ID B2 pour le stockage local
          {
            folderPath,
            isImage,
            uploadedAt: new Date().toISOString(),
            localPath: finalFilePath,
          }
        );

        // Sauvegarder en base de données
        try {
          const savedFile = await FileService.createFile(dbFileData);

          filesData.push({
            ...fileMetadata,
            fileUrl: publicUrl,
            fileId: undefined, // Pas d'ID B2 pour le stockage local
            thumbnailUrl,
            dbId: (savedFile._id as any).toString(),
            savedToDB: true,
            localPath: finalFilePath,
          });
        } catch (dbError) {
          console.error('Erreur lors de la sauvegarde en base:', dbError);

          // Ajouter quand même le fichier même si la DB a échoué
          filesData.push({
            ...fileMetadata,
            fileUrl: publicUrl,
            fileId: undefined,
            thumbnailUrl,
            savedToDB: false,
            dbError: 'Impossible de sauvegarder en base de données',
            localPath: finalFilePath,
          });
        }
      } catch (err) {
        console.error("Erreur lors de l'upload du fichier :", err);
        throw err;
      }
    });

    await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      filesData,
      message: 'Fichiers sauvegardés avec succès',
      organization: {
        companyId,
        entityType,
        entityId,
        documentType,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * Fonction d'upload spécialisée pour l'organisation par compagnie
 */
export const uploadFileByCompany = async (
  req: Request,
  res: Response,
  entityType: 'company' | 'staff' | 'driver' | 'passenger',
  documentType?: string
) => {
  try {
    const { companyId, entityId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: 'ID de compagnie requis' });
    }

    // Validation du type de document
    if (documentType && !validateDocumentType(entityType, documentType)) {
      return res.status(400).json({
        error: `Type de document non valide pour ${entityType}: ${documentType}`,
      });
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier à uploader' });
    }

    const useLocal = (process.env.FILE_STORAGE || '').toLowerCase() === 'local';
    let downloadUrl = '';

    if (!useLocal) {
      if (!process.env.BUCKET_ID || !process.env.BUCKET_NAME) {
        return res.status(500).json({
          error: 'Configuration Backblaze manquante (BUCKET_ID/BUCKET_NAME)',
        });
      }
      const authorizeRes = await b2.authorize();
      downloadUrl = authorizeRes.data.downloadUrl;
    }

    let filesData: any[] = [];

    const uploadPromises = files.map(async (file) => {
      try {
        // Générer les métadonnées du fichier
        const fileMetadata = generateFileMetadata(
          companyId,
          entityType as any,
          entityId,
          documentType || 'autre',
          file.originalname,
          file.mimetype,
          file.size
        );

        // Obtenir le chemin du dossier
        const folderPath = getFolderPath(
          entityType as any,
          companyId,
          entityId,
          documentType
        );

        // Créer le dossier s'il n'existe pas
        await ensureFolderExists(folderPath);

        const isImage = file.mimetype.startsWith('image/');
        let authorizationToken = '';
        let uploadUrl = '';

        if (!useLocal) {
          const response = await b2.getUploadUrl({
            bucketId: process.env.BUCKET_ID as string,
          });
          authorizationToken = response.data.authorizationToken;
          uploadUrl = response.data.uploadUrl;
        }

        // Upload du fichier original
        let uploadedFileId = '';
        let uploadedFileName = `${folderPath}/original/${fileMetadata.filename}`;

        if (useLocal) {
          const localOriginalDir = path.join('public', folderPath, 'original');
          if (!fssync.existsSync(localOriginalDir)) {
            fssync.mkdirSync(localOriginalDir, { recursive: true });
          }
          const localOriginalPath = path.join(
            localOriginalDir,
            fileMetadata.filename
          );
          await fs.writeFile(localOriginalPath, file.buffer);
        } else {
          const uploadRes = await b2.uploadFile({
            uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: uploadedFileName,
            data: file.buffer,
          });
          uploadedFileId = uploadRes.data.fileId;
          uploadedFileName = uploadRes.data.fileName;
        }

        // Créer une miniature pour les images
        if (isImage) {
          const image = await Jimp.read(file.buffer);
          image.resize(200, Jimp.AUTO).quality(70);

          const tempThumbnailPath = path.join(
            os.tmpdir(),
            `${Date.now()}_thumb.png`
          );
          await image.writeAsync(tempThumbnailPath);
          const thumbnailBuffer = await fs.readFile(tempThumbnailPath);

          const thumbnailPath = `${folderPath}/thumb/${fileMetadata.filename}`;

          if (useLocal) {
            const localThumbDir = path.join('public', folderPath, 'thumb');
            if (!fssync.existsSync(localThumbDir)) {
              fssync.mkdirSync(localThumbDir, { recursive: true });
            }
            const localThumbPath = path.join(
              localThumbDir,
              fileMetadata.filename
            );
            await fs.writeFile(localThumbPath, thumbnailBuffer);
          } else {
            await b2.uploadFile({
              uploadUrl,
              uploadAuthToken: authorizationToken,
              fileName: thumbnailPath,
              data: thumbnailBuffer,
            });
          }

          await deleteFile(tempThumbnailPath);
        }

        const publicUrl = useLocal
          ? getPublicFileUrl(folderPath, fileMetadata.filename)
          : `${downloadUrl}/file/${process.env.BUCKET_NAME}/${uploadedFileName}`;

        const thumbnailUrl = isImage
          ? publicUrl.replace('/original/', '/thumb/')
          : undefined;

        // Préparer les données pour la base de données
        const dbFileData = FileService.convertFileMetadataToDBData(
          fileMetadata,
          publicUrl,
          thumbnailUrl,
          useLocal ? undefined : uploadedFileId,
          {
            folderPath,
            isImage,
            uploadedAt: new Date().toISOString(),
          }
        );

        // Sauvegarder en base de données
        try {
          const savedFile = await FileService.createFile(dbFileData);

          filesData.push({
            ...fileMetadata,
            fileUrl: publicUrl,
            fileId: useLocal ? undefined : uploadedFileId,
            thumbnailUrl,
            dbId: (savedFile._id as any).toString(),
            savedToDB: true,
          });
        } catch (dbError) {
          console.error('Erreur lors de la sauvegarde en base:', dbError);

          // Ajouter quand même le fichier même si la DB a échoué
          filesData.push({
            ...fileMetadata,
            fileUrl: publicUrl,
            fileId: useLocal ? undefined : uploadedFileId,
            thumbnailUrl,
            savedToDB: false,
            dbError: 'Impossible de sauvegarder en base de données',
          });
        }
      } catch (err) {
        console.error("Erreur lors de l'upload du fichier :", err);
        throw err;
      }
    });

    await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      filesData,
      message: 'Fichiers sauvegardés avec succès',
      organization: {
        companyId,
        entityType,
        entityId,
        documentType,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Function to upload files to Backblaze B2
export const uploadBackblaze = async (req: Request, res: Response) => {
  try {
    const { folder } = req.params;
    console.log('🚀 ~ exports.uploadBackblaze= ~ folder:', folder);

    // Autoriser soit les anciens dossiers connus, soit tout chemin commençant par "company/"
    if (
      !folder ||
      (!folders.includes(folder) && !folder.startsWith('company/'))
    )
      return res.status(400).json({ error: 'Folder not found' });
    const files = req.files as Express.Multer.File[] | undefined;
    console.log('Files:=> ', files?.length);
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files to upload' });
    }

    if (!process.env.BUCKET_ID || !process.env.BUCKET_NAME) {
      return res.status(500).json({
        error: 'Backblaze configuration is missing (BUCKET_ID/BUCKET_NAME)',
      });
    }

    const useLocal = (process.env.FILE_STORAGE || '').toLowerCase() === 'local';
    let downloadUrl = '';
    if (!useLocal) {
      const authorizeRes = await b2.authorize();
      downloadUrl = authorizeRes.data.downloadUrl;
    }

    let filesData: any = [];

    const uploadPromises = files.map(async (file) => {
      try {
        const isImage = file.mimetype.startsWith('image/');
        console.log('🚀 ~ uploadPromises ~ isImage:', isImage);

        let authorizationToken = '';
        let uploadUrl = '';
        if (!useLocal) {
          const response = await b2.getUploadUrl({
            bucketId: process.env.BUCKET_ID as string,
          });
          authorizationToken = response.data.authorizationToken;
          uploadUrl = response.data.uploadUrl;
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

        const filename = `${uniqueSuffix}_${file.originalname}`
          .toLowerCase()
          .replace(/[^\w._]/g, '_');

        let uploadedFileId = '';
        let uploadedFileName = `${folder}/original/${filename}`;
        if (useLocal) {
          const localOriginalDir = path.join('public', folder, 'original');
          if (!fssync.existsSync(localOriginalDir)) {
            fssync.mkdirSync(localOriginalDir, { recursive: true });
          }
          const localOriginalPath = path.join(localOriginalDir, filename);
          await fs.writeFile(localOriginalPath, file.buffer);
        } else {
          const uploadRes = await b2.uploadFile({
            uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: uploadedFileName,
            data: file.buffer,
          });
          uploadedFileId = uploadRes.data.fileId;
          uploadedFileName = uploadRes.data.fileName;
        }

        if (isImage) {
          const image = await Jimp.read(file.buffer);
          image.resize(200, Jimp.AUTO).quality(70);

          const tempThumbnailPath = path.join(
            os.tmpdir(),
            `${uniqueSuffix}_thumb.png`
          );
          await image.writeAsync(tempThumbnailPath);
          const thumbnailBuffer = await fs.readFile(tempThumbnailPath);
          console.log(
            '🚀 ~ uploadPromises ~ thumbnailBuffer:',
            thumbnailBuffer
          );

          const thumbnailPath = `${folder}/thumb/${filename}`;
          console.log('🚀 ~ uploadPromises ~ thumbnailPath:', thumbnailPath);
          if (useLocal) {
            const localThumbDir = path.join('public', folder, 'thumb');
            if (!fssync.existsSync(localThumbDir)) {
              fssync.mkdirSync(localThumbDir, { recursive: true });
            }
            const localThumbPath = path.join(localThumbDir, filename);
            await fs.writeFile(localThumbPath, thumbnailBuffer);
          } else {
            await b2.uploadFile({
              uploadUrl,
              uploadAuthToken: authorizationToken,
              fileName: thumbnailPath,
              data: thumbnailBuffer,
            });
          }

          await deleteFile(tempThumbnailPath);
        }

        const publicUrl = useLocal
          ? `/public/${uploadedFileName}`
          : `${downloadUrl}/file/${process.env.BUCKET_NAME}/${uploadedFileName}`;
        filesData.push({
          fileUrl: publicUrl,
          fileId: useLocal ? undefined : uploadedFileId,
        });
      } catch (err) {
        console.error(
          "Erreur lors de l'upload du fichier ou de la miniature :",
          err
        );
      }
    });

    await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      filesData,
      message: 'Fichiers sauvegardés avec succès',
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteFileBackblaze = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { fileId } = req.params;
    await b2.authorize();
    const fileInfo = await b2.getFileInfo({ fileId: fileId as string } as any);

    if (!fileInfo.data)
      return res
        .status(200)
        .json({ success: false, message: 'File not found' });

    const resFile = await b2.deleteFileVersion({
      fileId: fileInfo.data.fileId,
      fileName: fileInfo.data.fileName,
    });
    if (!resFile.data)
      return res
        .status(200)
        .json({ success: false, message: 'File not found' });
    return res
      .status(200)
      .send({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    handleError(error, res);
  }
};

export const downloadFileBackblaze = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const fileId = req.params.fileId;
  const responseType = 'stream';
  await b2.authorize();

  try {
    const fileInfo = await b2.getFileInfo({ fileId: fileId as string } as any);
    const file = await b2.downloadFileById({
      fileId: fileId as string,
      responseType: responseType as any,
    } as any);

    res.setHeader(
      'Content-disposition',
      `attachment; filename=${fileInfo.data.fileName?.split('/').pop()}`
    );
    const contentType =
      (file as any)?.headers?.['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    file.data.pipe(res);
  } catch (error) {
    handleError(error, res);
  }
};
