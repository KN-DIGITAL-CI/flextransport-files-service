import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { companyDocuments } from '../constantes';
import Document from '../models/document.model';
import documentService from '../services/document.service';
import { handleError } from '../utils/functions';

export default class DocumentController {
  /**
   * Creates all documents for a company only once, and ensures all required document types are present.
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
   */
  static async createCompanyDocuments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { companyId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid company ID' });
      }

      // Check if documents for the company already exist
      const existingDocuments = await Document.find({ owner: companyId });
      if (existingDocuments.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Documents for this company already exist',
        });
      }

      // Define the required document types for a company
      const requiredDocumentTypes = companyDocuments.map(
        (doc) => doc.documentType
      );

      // Create all required documents for the company
      const documentStore = requiredDocumentTypes.map((type) => ({
        documentType: type,
        owner: companyId,
      }));

      const createdDocuments = await Document.insertMany(documentStore);
      if (createdDocuments.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: 'No documents created' });
      }

      res.status(201).json({
        success: true,
        message: 'Documents created successfully',
        documents: createdDocuments,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
  static async createDriverDocuments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { driverId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid company ID' });
      }

      const documents = await documentService.createDriverDocument(driverId);

      res.status(201).json({
        success: documents.success,
        message: documents.message,
        documents: documents.documents,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  static async createCustomerDocuments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { customerId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid company ID' });
      }

      const documents = await documentService.createCustomerDocument(
        customerId
      );

      res.status(201).json({
        success: documents.success,
        message: documents.message,
        documents: documents.documents,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
  static async createMemberDocuments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { memberId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid company ID' });
      }

      const documents = await documentService.createMemberDocument(memberId);

      res.status(201).json({
        success: documents.success,
        message: documents.message,
        documents: documents.documents,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
  /*********************/
  //      READ
  /*********************/

  static async getDocumentsByOwer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { owner } = req.params;
      if (!owner) return handleError('Owner is required', res);
      const documents = await Document.find({ owner });
      res.status(200).json({ documents, success: true });
    } catch (error) {
      handleError(error, res);
    }
  }

  /*********************/
  //      UPDATE
  /*********************/

  static async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await Document.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            files: req.body.files,
            status: 'in progress',
            updatedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );
      if (document?.isModified)
        res
          .status(200)
          .json({ message: 'Document modifié avec succès', success: true });
      else
        res.status(200).json({
          message: 'Une erreur lors que la modification',
          success: false,
        });
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Update the status of a document
   * @description Update the status of a document
   * @api {patch} /document/:id/status Update the status of a document
   * @apiDescription Update the status of a document
   * @apiParam {String} id The id of document
   * @apiParam {String} body.status The new status of document
   * @apiSuccess {Boolean} success The success of the request
   * @apiSuccess {String} message The message of the request
   */
  static async updateOneStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const document = await Document.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            ...req.body,
            status: req?.body?.status,
            motif: req?.body?.motif,
            updatedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );
      if (document?.isModified)
        res.status(200).json({
          message: 'Statut du document mis à jour avec succès',
          success: true,
          document,
        });
      else
        res.status(200).json({
          message: 'Une erreur lors que la mise à jour du statut',
          success: false,
        });
    } catch (error) {
      handleError(error, res);
    }
  }

  /*********************/
  //      DELETE
  /*********************/

  static async deleteOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await Document.findByIdAndDelete(id);
      if (!document) return handleError('Document not found', res);
      res
        .status(200)
        .json({ message: 'Document supprimé avec succès', success: true });
    } catch (error) {
      handleError(error, res);
    }
  }
}
