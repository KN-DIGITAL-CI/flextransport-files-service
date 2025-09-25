import mongoose, { Document, Schema } from 'mongoose';

// Interface pour les informations de fichier
export interface IFile extends Document {
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
  fileId?: string; // ID du fichier dans Backblaze B2 (si utilisé)
  uploadDate: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  toPublicJSON(): IFile;
}

// Schéma MongoDB pour les fichiers
const FileSchema = new Schema<IFile>(
  {
    companyId: {
      type: String,
      required: true,
      index: true, // Index pour les requêtes rapides par compagnie
    },
    entityType: {
      type: String,
      required: true,
      enum: ['company', 'staff', 'driver', 'passenger'],
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
      unique: true, // Nom de fichier unique
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    fileId: {
      type: String, // ID Backblaze B2
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index composés pour des requêtes optimisées
FileSchema.index({ companyId: 1, entityType: 1, entityId: 1 });
FileSchema.index({ companyId: 1, documentType: 1 });
FileSchema.index({ entityType: 1, entityId: 1, documentType: 1 });
FileSchema.index({ uploadDate: -1 }); // Tri par date de plus récent

// Méthodes virtuelles
FileSchema.virtual('isImage').get(function () {
  return this.mimeType.startsWith('image/');
});

FileSchema.virtual('extension').get(function () {
  return this.filename.split('.').pop()?.toLowerCase();
});

// Méthodes d'instance
FileSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id,
    companyId: obj.companyId,
    entityType: obj.entityType,
    entityId: obj.entityId,
    documentType: obj.documentType,
    originalName: obj.originalName,
    filename: obj.filename,
    mimeType: obj.mimeType,
    size: obj.size,
    fileUrl: obj.fileUrl,
    thumbnailUrl: obj.thumbnailUrl,
    uploadDate: obj.uploadDate,
    isImage: obj.mimeType.startsWith('image/'),
    extension: obj.filename.split('.').pop()?.toLowerCase(),
    metadata: obj.metadata,
  };
};

// Méthodes statiques
FileSchema.statics.findByCompany = function (companyId: string) {
  return this.find({ companyId, isActive: true }).sort({ uploadDate: -1 });
};

FileSchema.statics.findByEntity = function (
  companyId: string,
  entityType: string,
  entityId: string
) {
  return this.find({
    companyId,
    entityType,
    entityId,
    isActive: true,
  }).sort({ uploadDate: -1 });
};

FileSchema.statics.findByDocumentType = function (
  companyId: string,
  documentType: string
) {
  return this.find({
    companyId,
    documentType,
    isActive: true,
  }).sort({ uploadDate: -1 });
};

FileSchema.statics.findCompanyLogos = function (companyId: string) {
  return this.find({
    companyId,
    entityType: 'company',
    documentType: 'logo',
    isActive: true,
  }).sort({ uploadDate: -1 });
};

// Export du modèle
export const FileModel = mongoose.model<IFile>('File', FileSchema);
