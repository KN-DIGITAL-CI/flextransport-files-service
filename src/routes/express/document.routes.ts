import express, { Router } from 'express';
import DocumentController from '../../controllers/document.controller';

const router: Router = express.Router();

router.post(
  `/document/create/company/:companyId`,
  DocumentController.createCompanyDocuments
);
router.post(
  `/document/create/driver/:driverId`,
  DocumentController.createDriverDocuments
);
router.post(
  `/document/create/customer/:customerId`,
  DocumentController.createCustomerDocuments
);
router.post(
  `/document/create/member/:memberId`,
  DocumentController.createMemberDocuments
);
router.get(`/document/:owner`, DocumentController.getDocumentsByOwer);
router.put(`/document/update/:id`, DocumentController.updateOne);
router.delete(`/document/:id`, DocumentController.deleteOne);

export default router;
