import { FileModel, IFile } from '../models/file.model';
import { 
  FileInfo, 
  generateFileMetadata 
} from '../utils/file-organization';

export interface CreateFileData {
  companyId: string;
  entityType: 'company' | 'staff' | 'driver' | 'passenger';
  entityId?: string;
  documentType: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  fileUrl: string;
  thumbnailUrl?: string;
  fileId?: string;
  metadata?: Record<string, any>;
}

export interface FileFilters {
  companyId?: string;
  entityType?: 'company' | 'staff' | 'driver' | 'passenger';
  entityId?: string;
  documentType?: string;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  filesByEntity: Record<string, number>;
  recentUploads: number;
}

export class FileService {
  /**
   * Crée un nouveau fichier en base de données
   */
  static async createFile(fileData: CreateFileData): Promise<IFile> {
    try {
      const file = new FileModel(fileData);
      return await file.save();
    } catch (error) {
      console.error('Erreur lors de la création du fichier:', error);
      throw new Error('Impossible de sauvegarder le fichier en base de données');
    }
  }

  /**
   * Crée plusieurs fichiers en une seule opération
   */
  static async createFiles(filesData: CreateFileData[]): Promise<IFile[]> {
    try {
      return await FileModel.insertMany(filesData);
    } catch (error) {
      console.error('Erreur lors de la création des fichiers:', error);
      throw new Error('Impossible de sauvegarder les fichiers en base de données');
    }
  }

  /**
   * Récupère un fichier par son ID
   */
  static async getFileById(fileId: string): Promise<IFile | null> {
    try {
      return await FileModel.findOne({ _id: fileId, isActive: true });
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier:', error);
      throw new Error('Impossible de récupérer le fichier');
    }
  }

  /**
   * Récupère un fichier par son nom de fichier
   */
  static async getFileByFilename(filename: string): Promise<IFile | null> {
    try {
      return await FileModel.findOne({ filename, isActive: true });
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier:', error);
      throw new Error('Impossible de récupérer le fichier');
    }
  }

  /**
   * Récupère tous les fichiers d'une compagnie
   */
  static async getFilesByCompany(
    companyId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<IFile[]> {
    try {
      return await FileModel.find({ companyId, isActive: true })
        .sort({ uploadDate: -1 })
        .limit(limit)
        .skip(offset);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      throw new Error('Impossible de récupérer les fichiers de la compagnie');
    }
  }

  /**
   * Récupère les fichiers d'une entité spécifique
   */
  static async getFilesByEntity(
    companyId: string,
    entityType: string,
    entityId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<IFile[]> {
    try {
      return await FileModel.find({
        companyId,
        entityType,
        entityId,
        isActive: true,
      })
        .sort({ uploadDate: -1 })
        .limit(limit)
        .skip(offset);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      throw new Error('Impossible de récupérer les fichiers de l\'entité');
    }
  }

  /**
   * Récupère les fichiers par type de document
   */
  static async getFilesByDocumentType(
    companyId: string,
    documentType: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<IFile[]> {
    try {
      return await FileModel.find({
        companyId,
        documentType,
        isActive: true,
      })
        .sort({ uploadDate: -1 })
        .limit(limit)
        .skip(offset);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      throw new Error('Impossible de récupérer les fichiers par type');
    }
  }

  /**
   * Récupère les logos d'une compagnie
   */
  static async getCompanyLogos(companyId: string): Promise<IFile[]> {
    try {
      return await FileModel.find({
        companyId,
        entityType: 'company',
        documentType: 'logo',
        isActive: true,
      }).sort({ uploadDate: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des logos:', error);
      throw new Error('Impossible de récupérer les logos de la compagnie');
    }
  }

  /**
   * Recherche des fichiers avec filtres
   */
  static async searchFiles(
    filters: FileFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<IFile[]> {
    try {
      const query: any = { isActive: true };

      if (filters.companyId) query.companyId = filters.companyId;
      if (filters.entityType) query.entityType = filters.entityType;
      if (filters.entityId) query.entityId = filters.entityId;
      if (filters.documentType) query.documentType = filters.documentType;
      if (filters.dateFrom || filters.dateTo) {
        query.uploadDate = {};
        if (filters.dateFrom) query.uploadDate.$gte = filters.dateFrom;
        if (filters.dateTo) query.uploadDate.$lte = filters.dateTo;
      }

      return await FileModel.find(query)
        .sort({ uploadDate: -1 })
        .limit(limit)
        .skip(offset);
    } catch (error) {
      console.error('Erreur lors de la recherche des fichiers:', error);
      throw new Error('Impossible de rechercher les fichiers');
    }
  }

  /**
   * Met à jour les métadonnées d'un fichier
   */
  static async updateFileMetadata(
    fileId: string,
    metadata: Record<string, any>
  ): Promise<IFile | null> {
    try {
      return await FileModel.findByIdAndUpdate(
        fileId,
        { metadata, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier:', error);
      throw new Error('Impossible de mettre à jour le fichier');
    }
  }

  /**
   * Supprime un fichier (soft delete)
   */
  static async deleteFile(fileId: string): Promise<boolean> {
    try {
      const result = await FileModel.findByIdAndUpdate(
        fileId,
        { isActive: false, updatedAt: new Date() }
      );
      return !!result;
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw new Error('Impossible de supprimer le fichier');
    }
  }

  /**
   * Supprime définitivement un fichier
   */
  static async hardDeleteFile(fileId: string): Promise<boolean> {
    try {
      const result = await FileModel.findByIdAndDelete(fileId);
      return !!result;
    } catch (error) {
      console.error('Erreur lors de la suppression définitive:', error);
      throw new Error('Impossible de supprimer définitivement le fichier');
    }
  }

  /**
   * Récupère les statistiques des fichiers
   */
  static async getFileStats(companyId: string): Promise<FileStats> {
    try {
      const pipeline = [
        { $match: { companyId, isActive: true } },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' },
            filesByType: {
              $push: '$documentType'
            },
            filesByEntity: {
              $push: '$entityType'
            }
          }
        }
      ];

      const result = await FileModel.aggregate(pipeline);
      const stats = result[0] || { totalFiles: 0, totalSize: 0, filesByType: [], filesByEntity: [] };

      // Compter les fichiers par type
      const typeCount: Record<string, number> = {};
      stats.filesByType.forEach((type: string) => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      // Compter les fichiers par entité
      const entityCount: Record<string, number> = {};
      stats.filesByEntity.forEach((entity: string) => {
        entityCount[entity] = (entityCount[entity] || 0) + 1;
      });

      // Fichiers uploadés récemment (dernières 24h)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 1);
      const recentUploads = await FileModel.countDocuments({
        companyId,
        isActive: true,
        uploadDate: { $gte: recentDate }
      });

      return {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        filesByType: typeCount,
        filesByEntity: entityCount,
        recentUploads
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  /**
   * Convertit les métadonnées de fichier en données pour la base
   */
  static convertFileMetadataToDBData(
    fileMetadata: FileInfo,
    fileUrl: string,
    thumbnailUrl?: string,
    fileId?: string,
    additionalMetadata?: Record<string, any>
  ): CreateFileData {
    return {
      companyId: fileMetadata.companyId,
      entityType: fileMetadata.entityType,
      entityId: fileMetadata.entityId,
      documentType: fileMetadata.documentType,
      originalName: fileMetadata.originalName,
      filename: fileMetadata.filename,
      mimeType: fileMetadata.mimeType,
      size: fileMetadata.size,
      fileUrl,
      thumbnailUrl,
      fileId,
      metadata: additionalMetadata,
    };
  }
}
