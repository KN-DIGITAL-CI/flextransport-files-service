import express, { Request, Response } from 'express';
import { FileService } from '../../services/file.service';
import { handleError } from '../../utils/functions';

const router = express.Router();

// ==========================================
// ROUTES DE RÉCUPÉRATION DE FICHIERS
// ==========================================

/**
 * Récupère tous les fichiers d'une compagnie
 * GET /company/:companyId/files
 */
router.get('/company/:companyId/files', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!companyId) {
      return res.status(400).json({ error: 'ID de compagnie requis' });
    }

    const files = await FileService.getFilesByCompany(companyId, limit, offset);
    const filesWithPublicData = files.map((file) => file.toPublicJSON());

    res.status(200).json({
      success: true,
      data: filesWithPublicData,
      pagination: {
        limit,
        offset,
        total: files.length,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Récupère les fichiers d'une entité spécifique
 * GET /company/:companyId/:entityType/:entityId/files
 */
router.get(
  '/company/:companyId/:entityType/:entityId/files',
  async (req: Request, res: Response) => {
    try {
      const { companyId, entityType, entityId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const validEntityTypes = ['staff', 'driver', 'passenger'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({
          error: `Type d'entité non valide. Types acceptés: ${validEntityTypes.join(
            ', '
          )}`,
        });
      }

      const files = await FileService.getFilesByEntity(
        companyId,
        entityType,
        entityId,
        limit,
        offset
      );
      const filesWithPublicData = files.map((file) => file.toPublicJSON());

      res.status(200).json({
        success: true,
        data: filesWithPublicData,
        pagination: {
          limit,
          offset,
          total: files.length,
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * Récupère les fichiers par type de document
 * GET /company/:companyId/files/type/:documentType
 */
router.get(
  '/company/:companyId/files/type/:documentType',
  async (req: Request, res: Response) => {
    try {
      const { companyId, documentType } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const files = await FileService.getFilesByDocumentType(
        companyId,
        documentType,
        limit,
        offset
      );
      const filesWithPublicData = files.map((file) => file.toPublicJSON());

      res.status(200).json({
        success: true,
        data: filesWithPublicData,
        pagination: {
          limit,
          offset,
          total: files.length,
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * Récupère les logos d'une compagnie
 * GET /company/:companyId/logos
 */
router.get('/company/:companyId/logos', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const logos = await FileService.getCompanyLogos(companyId);
    const logosWithPublicData = logos.map((file) => file.toPublicJSON());

    res.status(200).json({
      success: true,
      data: logosWithPublicData,
      total: logos.length,
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Récupère un fichier par son ID
 * GET /files/:fileId
 */
router.get('/files/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await FileService.getFileById(fileId);
    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: file.toPublicJSON(),
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Recherche de fichiers avec filtres
 * GET /files/search
 */
router.get('/files/search', async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      entityType,
      entityId,
      documentType,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
    } = req.query;

    const filters: any = {};
    if (companyId) filters.companyId = companyId as string;
    if (entityType) filters.entityType = entityType as string;
    if (entityId) filters.entityId = entityId as string;
    if (documentType) filters.documentType = documentType as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const files = await FileService.searchFiles(
      filters,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    const filesWithPublicData = files.map((file) => file.toPublicJSON());

    res.status(200).json({
      success: true,
      data: filesWithPublicData,
      filters,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: files.length,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ==========================================
// ROUTES DE STATISTIQUES
// ==========================================

/**
 * Récupère les statistiques des fichiers d'une compagnie
 * GET /company/:companyId/stats
 */
router.get('/company/:companyId/stats', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const stats = await FileService.getFileStats(companyId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ==========================================
// ROUTES DE GESTION DES FICHIERS
// ==========================================

/**
 * Met à jour les métadonnées d'un fichier
 * PUT /files/:fileId/metadata
 */
router.put('/files/:fileId/metadata', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { metadata } = req.body;

    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({
        error: 'Métadonnées requises et doivent être un objet',
      });
    }

    const updatedFile = await FileService.updateFileMetadata(fileId, metadata);
    if (!updatedFile) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedFile.toPublicJSON(),
      message: 'Métadonnées mises à jour avec succès',
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Supprime un fichier (soft delete)
 * DELETE /files/:fileId
 */
router.delete('/files/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const deleted = await FileService.deleteFile(fileId);
    if (!deleted) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé avec succès',
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Supprime définitivement un fichier
 * DELETE /files/:fileId/hard
 */
router.delete('/files/:fileId/hard', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const deleted = await FileService.hardDeleteFile(fileId);
    if (!deleted) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé définitivement',
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
