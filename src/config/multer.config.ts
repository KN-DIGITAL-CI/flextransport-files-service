import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Types de fichiers autorisés (comme dans votre configuration)
const MIME_TYPES: Record<string, string> = {
  // Images
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',

  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',

  // Textes
  'text/plain': 'txt',
  'text/csv': 'csv',
};

// Fonction pour générer le nom de fichier (comme dans votre configuration)
const generateFilename = (file: Express.Multer.File): string => {
  const name = file.originalname.split(' ').join('_'); // Élimine les espaces
  const extension = MIME_TYPES[file.mimetype] || 'bin';
  return `${name}_${Date.now()}.${extension}`;
};

// Filtre de fichiers
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
  }
};

// Filtre pour les images uniquement (logos)
const imageFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées pour les logos'));
  }
};

// Configuration de stockage sur disque pour les documents d'identité
const identityStorage = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb: Function) => {
    // Utiliser un dossier temporaire, la structure sera créée dans la fonction d'upload
    const tempPath = path.join(process.cwd(), 'public', 'temp');

    // Créer le dossier temporaire s'il n'existe pas
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    cb(null, tempPath);
  },
  filename: (req: any, file: Express.Multer.File, cb: Function) => {
    cb(null, generateFilename(file));
  },
});

// Configuration de stockage sur disque pour les logos de compagnie
const companyLogoStorage = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb: Function) => {
    // Utiliser un dossier temporaire, la structure sera créée dans la fonction d'upload
    const tempPath = path.join(process.cwd(), 'public', 'temp');

    // Créer le dossier temporaire s'il n'existe pas
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    cb(null, tempPath);
  },
  filename: (req: any, file: Express.Multer.File, cb: Function) => {
    cb(null, generateFilename(file));
  },
});

// Configuration de stockage sur disque pour les documents généraux
const generalStorage = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb: Function) => {
    // Utiliser un dossier temporaire, la structure sera créée dans la fonction d'upload
    const tempPath = path.join(process.cwd(), 'public', 'temp');

    // Créer le dossier temporaire s'il n'existe pas
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    cb(null, tempPath);
  },
  filename: (req: any, file: Express.Multer.File, cb: Function) => {
    cb(null, generateFilename(file));
  },
});

// Configuration Multer pour les documents d'identité
export const uploadIdentityDocuments = multer({
  storage: identityStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3, // Maximum 3 fichiers
  },
  fileFilter,
});

// Configuration Multer pour les logos de compagnie
export const uploadCompanyLogo = multer({
  storage: companyLogoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1, // Un seul fichier
  },
  fileFilter: imageFilter,
});

// Configuration Multer pour les documents généraux
export const uploadGeneralDocuments = multer({
  storage: generalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Maximum 5 fichiers
  },
  fileFilter,
});

// Configuration Multer générique pour stockage sur disque
export const uploadMulter = multer({
  storage: multer.diskStorage({
    destination: (req: any, file: Express.Multer.File, cb: Function) => {
      const uploadPath = path.join(process.cwd(), 'public', 'uploads');
      console.log('🚀 ~ uploadPath:', uploadPath);

      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req: any, file: Express.Multer.File, cb: Function) => {
      cb(null, generateFilename(file));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB par défaut
    files: 10,
  },
  fileFilter,
});

// Export des types MIME pour utilisation ailleurs
export { MIME_TYPES };
