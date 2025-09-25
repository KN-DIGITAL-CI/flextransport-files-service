import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Interface pour les informations de fichier
export interface FileInfo {
  companyId: string;
  entityType: 'company' | 'staff' | 'driver' | 'passenger';
  entityId?: string;
  documentType: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
}

// Types de documents supportés
export const DOCUMENT_TYPES = {
  // Documents de compagnie
  COMPANY: {
    LOGO: 'logo',
  },
  // Documents de staff
  STAFF: {
    CNI: 'cni',
    CMU: 'cmu',
    CARTE_SEJOUR: 'carte_sejour',
    CONTRAT: 'contrat',
    PHOTO: 'photo',
    AUTRE: 'autre',
  },
  // Documents de conducteur
  DRIVER: {
    PERMIS_CONDUITE: 'permis_conduite',
    CNI: 'cni',
    CMU: 'cmu',
    CARTE_SEJOUR: 'carte_sejour',
    CERTIFICAT_MEDICAL: 'certificat_medical',
    PHOTO: 'photo',
    AUTRE: 'autre',
  },
  // Documents de passager
  PASSENGER: {
    CNI: 'cni',
    PASSEPORT: 'passeport',
    BILLET: 'billet',
    PHOTO: 'photo',
    AUTRE: 'autre',
  },
};

// Structure des dossiers par compagnie
export const FOLDER_STRUCTURE = {
  company: (companyId: string) => `company/${companyId}`,
  companyLogo: (companyId: string) => `company/${companyId}/logo`,
  staffDocuments: (companyId: string, staffId: string) =>
    `company/${companyId}/staff/${staffId}/documents`,
  driverDocuments: (companyId: string, driverId: string) =>
    `company/${companyId}/drivers/${driverId}/documents`,
  passengerDocuments: (companyId: string, passengerId: string) =>
    `company/${companyId}/passengers/${passengerId}/documents`,
};

/**
 * Génère un nom de fichier unique
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomId = uuidv4().substring(0, 8);
  const extension = path.extname(originalName);
  const baseName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^\w]/g, '_')
    .substring(0, 20); // Limiter la longueur

  return `${timestamp}_${randomId}_${baseName}${extension}`;
};

/**
 * Obtient le chemin du dossier pour un type d'entité
 */
export const getFolderPath = (
  entityType: 'company' | 'staff' | 'driver' | 'passenger',
  companyId: string,
  entityId?: string,
  documentType?: string
): string => {
  switch (entityType) {
    case 'company':
      return documentType === 'logo'
        ? FOLDER_STRUCTURE.companyLogo(companyId)
        : FOLDER_STRUCTURE.company(companyId);

    case 'staff':
      if (!entityId)
        throw new Error('entityId est requis pour les membres du staff');
      return FOLDER_STRUCTURE.staffDocuments(companyId, entityId);

    case 'driver':
      if (!entityId)
        throw new Error('entityId est requis pour les conducteurs');
      return FOLDER_STRUCTURE.driverDocuments(companyId, entityId);

    case 'passenger':
      if (!entityId) throw new Error('entityId est requis pour les passagers');
      return FOLDER_STRUCTURE.passengerDocuments(companyId, entityId);

    default:
      throw new Error(`Type d'entité non supporté: ${entityType}`);
  }
};

/**
 * Crée la structure de dossiers si elle n'existe pas
 */
export const ensureFolderExists = async (folderPath: string): Promise<void> => {
  const fullPath = path.join('public', folderPath);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Dossier créé: ${fullPath}`);
  }
};

/**
 * Valide le type de document selon l'entité
 */
export const validateDocumentType = (
  entityType: 'company' | 'staff' | 'driver' | 'passenger',
  documentType: string
): boolean => {
  switch (entityType) {
    case 'company':
      return Object.values(DOCUMENT_TYPES.COMPANY).includes(documentType);
    case 'staff':
      return Object.values(DOCUMENT_TYPES.STAFF).includes(documentType);
    case 'driver':
      return Object.values(DOCUMENT_TYPES.DRIVER).includes(documentType);
    case 'passenger':
      return Object.values(DOCUMENT_TYPES.PASSENGER).includes(documentType);
    default:
      return false;
  }
};

/**
 * Génère les métadonnées d'un fichier
 */
export const generateFileMetadata = (
  companyId: string,
  entityType: 'company' | 'staff' | 'driver' | 'passenger',
  entityId: string | undefined,
  documentType: string,
  originalName: string,
  mimeType: string,
  size: number
): FileInfo => {
  return {
    companyId,
    entityType,
    entityId,
    documentType,
    originalName,
    filename: generateUniqueFilename(originalName),
    mimeType,
    size,
    uploadDate: new Date(),
  };
};

/**
 * Obtient l'URL publique d'un fichier
 */
export const getPublicFileUrl = (
  folderPath: string,
  filename: string
): string => {
  return `/public/${folderPath}/${filename}`;
};
