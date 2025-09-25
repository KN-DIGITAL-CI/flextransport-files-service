import { Request, Response, NextFunction } from 'express';
import {
  DOCUMENT_TYPES,
  validateDocumentType,
} from '../utils/file-organization';

/**
 * Middleware pour valider les paramètres de route
 */
export const validateRouteParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { companyId, entityType, entityId, documentType } = req.params;

  // Validation de l'ID de compagnie
  if (!companyId || companyId.trim() === '') {
    return res.status(400).json({
      error: 'ID de compagnie requis et ne peut pas être vide',
    });
  }

  // Validation du type d'entité
  const validEntityTypes = ['staff', 'driver', 'passenger'];
  if (entityType && !validEntityTypes.includes(entityType)) {
    return res.status(400).json({
      error: `Type d'entité non valide. Types acceptés: ${validEntityTypes.join(
        ', '
      )}`,
    });
  }

  // Validation de l'ID d'entité pour les types qui en ont besoin
  if (
    (entityType === 'staff' ||
      entityType === 'driver' ||
      entityType === 'passenger') &&
    (!entityId || entityId.trim() === '')
  ) {
    return res.status(400).json({
      error: `ID d'entité requis pour le type: ${entityType}`,
    });
  }

  // Validation du type de document
  if (documentType && entityType) {
    if (!validateDocumentType(entityType as any, documentType)) {
      return res.status(400).json({
        error: `Type de document non valide pour ${entityType}: ${documentType}`,
      });
    }
  }

  next();
};

/**
 * Middleware pour valider la présence de fichiers
 */
export const validateFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return res.status(400).json({
      error: "Aucun fichier fourni pour l'upload",
    });
  }

  // Validation de la taille des fichiers
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  for (const file of files) {
    if (file.size > maxFileSize) {
      return res.status(400).json({
        error: `Le fichier ${file.originalname} dépasse la taille maximale autorisée (10MB)`,
      });
    }
  }

  next();
};

/**
 * Middleware pour valider les types de fichiers
 */
export const validateFileTypes = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files) {
      return next();
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: `Type de fichier non autorisé pour ${
            file.originalname
          }. Types acceptés: ${allowedTypes.join(', ')}`,
        });
      }
    }

    next();
  };
};

/**
 * Middleware pour limiter le nombre de fichiers
 */
export const validateFileCount = (maxFiles: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (files && files.length > maxFiles) {
      return res.status(400).json({
        error: `Trop de fichiers. Maximum autorisé: ${maxFiles}`,
      });
    }

    next();
  };
};

/**
 * Middleware pour valider les métadonnées de fichier
 */
export const validateFileMetadata = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { companyId, entityType, entityId, documentType } = req.params;

  // Validation des métadonnées requises
  if (!companyId) {
    return res.status(400).json({
      error: 'Métadonnées de compagnie requises',
    });
  }

  if (entityType && !entityId) {
    return res.status(400).json({
      error: "ID d'entité requis quand le type d'entité est spécifié",
    });
  }

  next();
};
