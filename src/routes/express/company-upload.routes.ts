import express, { Request, Response } from 'express';
import {
  uploadCompanyLogo,
  uploadGeneralDocuments,
  uploadIdentityDocuments,
} from '../../config/multer.config';
import { uploadFileByCompanyDisk } from '../../utils/file';
import { DOCUMENT_TYPES } from '../../utils/file-organization';

const router = express.Router();

// ==========================================
// ROUTES POUR LES LOGOS DE COMPAGNIE
// ==========================================

/**
 * Upload du logo d'une compagnie
 * POST /company/:companyId/logo
 */
router.post(
  '/company/:companyId/logo',
  uploadCompanyLogo.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'company',
      DOCUMENT_TYPES.COMPANY.LOGO
    );
  }
);

// ==========================================
// ROUTES POUR LES DOCUMENTS DE STAFF
// ==========================================

/**
 * Upload de documents d'identité pour un membre du staff
 * POST /company/:companyId/staff/:staffId/documents/identity
 */
router.post(
  '/company/:companyId/staff/:staffId/documents/identity',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(req, res, 'staff', DOCUMENT_TYPES.STAFF.CNI);
  }
);

/**
 * Upload de documents CMU pour un membre du staff
 * POST /company/:companyId/staff/:staffId/documents/cmu
 */
router.post(
  '/company/:companyId/staff/:staffId/documents/cmu',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(req, res, 'staff', DOCUMENT_TYPES.STAFF.CMU);
  }
);

/**
 * Upload de carte de séjour pour un membre du staff
 * POST /company/:companyId/staff/:staffId/documents/carte-sejour
 */
router.post(
  '/company/:companyId/staff/:staffId/documents/carte-sejour',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'staff',
      DOCUMENT_TYPES.STAFF.CARTE_SEJOUR
    );
  }
);

/**
 * Upload de contrat pour un membre du staff
 * POST /company/:companyId/staff/:staffId/documents/contrat
 */
router.post(
  '/company/:companyId/staff/:staffId/documents/contrat',
  uploadGeneralDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'staff',
      DOCUMENT_TYPES.STAFF.CONTRAT
    );
  }
);

/**
 * Upload de photo pour un membre du staff
 * POST /company/:companyId/staff/:staffId/documents/photo
 */
router.post(
  '/company/:companyId/staff/:staffId/documents/photo',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'staff',
      DOCUMENT_TYPES.STAFF.PHOTO
    );
  }
);

/**
 * Upload d'autres documents pour un membre du staff
 * POST /company/:companyId/staff/:staffId/documents/autre
 */
router.post(
  '/company/:companyId/staff/:staffId/documents/autre',
  uploadGeneralDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'staff',
      DOCUMENT_TYPES.STAFF.AUTRE
    );
  }
);

// ==========================================
// ROUTES POUR LES DOCUMENTS DE CONDUCTEUR
// ==========================================

/**
 * Upload de permis de conduire pour un conducteur
 * POST /company/:companyId/driver/:driverId/documents/permis-conduite
 */
router.post(
  '/company/:companyId/driver/:driverId/documents/permis-conduite',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'driver',
      DOCUMENT_TYPES.DRIVER.PERMIS_CONDUITE
    );
  }
);

/**
 * Upload de CNI pour un conducteur
 * POST /company/:companyId/driver/:driverId/documents/cni
 */
router.post(
  '/company/:companyId/driver/:driverId/documents/cni',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'driver',
      DOCUMENT_TYPES.DRIVER.CNI
    );
  }
);

/**
 * Upload de CMU pour un conducteur
 * POST /company/:companyId/driver/:driverId/documents/cmu
 */
router.post(
  '/company/:companyId/driver/:driverId/documents/cmu',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'driver',
      DOCUMENT_TYPES.DRIVER.CMU
    );
  }
);

/**
 * Upload de carte de séjour pour un conducteur
 * POST /company/:companyId/driver/:driverId/documents/carte-sejour
 */
router.post(
  '/company/:companyId/driver/:driverId/documents/carte-sejour',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'driver',
      DOCUMENT_TYPES.DRIVER.CARTE_SEJOUR
    );
  }
);

/**
 * Upload de certificat médical pour un conducteur
 * POST /company/:companyId/driver/:driverId/documents/certificat-medical
 */
router.post(
  '/company/:companyId/driver/:driverId/documents/certificat-medical',
  uploadGeneralDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'driver',
      DOCUMENT_TYPES.DRIVER.CERTIFICAT_MEDICAL
    );
  }
);

/**
 * Upload de photo pour un conducteur
 * POST /company/:companyId/driver/:entityId/documents/photo
 */
router.post(
  '/company/:companyId/driver/:entityId/documents/photo',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'driver',
      DOCUMENT_TYPES.DRIVER.PHOTO
    );
  }
);

/**
 * Upload d'autres documents pour un conducteur
 * POST /company/:companyId/driver/:entityId/documents/autre
 */
router.post(
  '/company/:companyId/driver/:entityId/documents/autre',
  uploadGeneralDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'driver',
      DOCUMENT_TYPES.DRIVER.AUTRE
    );
  }
);

// ==========================================
// ROUTES POUR LES DOCUMENTS DE PASSAGER
// ==========================================

/**
 * Upload de CNI pour un passager
 * POST /company/:companyId/passenger/:passengerId/documents/cni
 */
router.post(
  '/company/:companyId/passenger/:passengerId/documents/cni',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'passenger',
      DOCUMENT_TYPES.PASSENGER.CNI
    );
  }
);

/**
 * Upload de passeport pour un passager
 * POST /company/:companyId/passenger/:passengerId/documents/passeport
 */
router.post(
  '/company/:companyId/passenger/:passengerId/documents/passeport',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'passenger',
      DOCUMENT_TYPES.PASSENGER.PASSEPORT
    );
  }
);

/**
 * Upload de billet pour un passager
 * POST /company/:companyId/passenger/:passengerId/documents/billet
 */
router.post(
  '/company/:companyId/passenger/:passengerId/documents/billet',
  uploadGeneralDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'passenger',
      DOCUMENT_TYPES.PASSENGER.BILLET
    );
  }
);

/**
 * Upload de photo pour un passager
 * POST /company/:companyId/passenger/:passengerId/documents/photo
 */
router.post(
  '/company/:companyId/passenger/:passengerId/documents/photo',
  uploadIdentityDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'passenger',
      DOCUMENT_TYPES.PASSENGER.PHOTO
    );
  }
);

/**
 * Upload d'autres documents pour un passager
 * POST /company/:companyId/passenger/:passengerId/documents/autre
 */
router.post(
  '/company/:companyId/passenger/:passengerId/documents/autre',
  uploadGeneralDocuments.any(),
  async (req: Request, res: Response) => {
    await uploadFileByCompanyDisk(
      req,
      res,
      'passenger',
      DOCUMENT_TYPES.PASSENGER.AUTRE
    );
  }
);

// ==========================================
// ROUTE GÉNÉRIQUE POUR UPLOAD MULTIPLE
// ==========================================

/**
 * Upload générique de documents avec type spécifié
 * POST /company/:companyId/:entityType/:entityId/documents/:documentType
 */
router.post(
  '/company/:companyId/:entityType/:entityId/documents/:documentType',
  uploadGeneralDocuments.any(),
  async (req: Request, res: Response) => {
    const { entityType, documentType } = req.params;

    // Validation du type d'entité
    const validEntityTypes = ['staff', 'driver', 'passenger'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        error: `Type d'entité non valide. Types acceptés: ${validEntityTypes.join(
          ', '
        )}`,
      });
    }

    await uploadFileByCompanyDisk(req, res, entityType as any, documentType);
  }
);

export default router;
