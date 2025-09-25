import express, { Router } from 'express';
import {
  deleteFileBackblaze,
  downloadFileBackblaze,
  uploadBackblaze,
  uploadMulter,
} from '../../utils/file';

const router: Router = express.Router();

//CREATE
router.post(`/upload/:folder`, uploadMulter, uploadBackblaze);

// Helpers pour injecter dynamiquement le sous-dossier basé sur les params
const withFolderPath =
  (builder: (params: Record<string, string>) => string) =>
  (req: any, _res: any, next: any) => {
    req.params.folder = builder(req.params);
    next();
  };

// Upload logo de compagnie
router.post(
  `/upload/company/:companyId/logo`,
  withFolderPath((p) => `company/${p.companyId}/logo`),
  uploadMulter,
  uploadBackblaze
);

// Upload documents d'un membre du staff
router.post(
  `/upload/company/:companyId/staff/:staffId/documents`,
  withFolderPath((p) => `company/${p.companyId}/staff/${p.staffId}`),
  uploadMulter,
  uploadBackblaze
);

// Upload documents d'un conducteur
router.post(
  `/upload/company/:companyId/driver/:driverId/documents`,
  withFolderPath((p) => `company/${p.companyId}/drivers/${p.driverId}`),
  uploadMulter,
  uploadBackblaze
);

// Upload documents d'un passager
router.post(
  `/upload/company/:companyId/passenger/:passengerId/documents`,
  withFolderPath((p) => `company/${p.companyId}/passengers/${p.passengerId}`),
  uploadMulter,
  uploadBackblaze
);

//READ
router.get(`/download/:fileId`, downloadFileBackblaze);

//DELETE
router.delete(`/delete/:fileId`, deleteFileBackblaze);

export default router;
