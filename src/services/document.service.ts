import mongoose from 'mongoose';
import { companyDocuments, driverDocuments } from '../constantes';
import Document from '../models/document.model';
import { CreateDocumentsResult, IDocumentService } from '../types/document';

class DocumentService implements IDocumentService {
  async createDriverDocument(driverId: any): Promise<CreateDocumentsResult> {
    try {
      // Check if documents for the company already exist
      const existingDocuments = await Document.find({ owner: driverId });
      if (existingDocuments.length > 0) {
        return {
          success: false,
          message: 'Des documents existent déjà pour ce propriétaire',
        };
      }

      // Define the required document types for a company
      const requiredDocumentTypes = driverDocuments.map(
        (doc) => doc.documentType
      );

      // Create all required documents for the company
      const documentStore = requiredDocumentTypes.map((type) => ({
        documentType: type,
        owner: driverId as mongoose.Types.ObjectId,
      }));

      const createdDocuments = await Document.insertMany(documentStore);
      if (createdDocuments.length === 0) {
        return { success: false, message: 'No documents created' };
      }
      return {
        success: true,
        message: 'Documents created successfully',
        documents: createdDocuments,
      };
    } catch (error) {
      throw new Error('Error creating document');
    }
  }

  async createCustomerDocument(
    customerId: any
  ): Promise<CreateDocumentsResult> {
    try {
      const existingDocuments = await Document.find({ owner: customerId });
      if (existingDocuments.length > 0) {
        return {
          success: false,
          message: 'Des documents existent déjà pour ce propriétaire',
        };
      }
      // Define the required document types for a company
      const requiredDocumentTypes = driverDocuments.map(
        (doc) => doc.documentType
      );

      // Create all required documents for the company
      const documentStore = requiredDocumentTypes.map((type) => ({
        documentType: type,
        owner: customerId,
      }));

      const createdDocuments = await Document.insertMany(documentStore);
      if (createdDocuments.length === 0) {
        return { success: false, message: 'No documents created' };
      }
      return {
        success: true,
        message: 'Documents created successfully',
        documents: createdDocuments,
      };
    } catch (error) {
      throw new Error('Error creating document');
    }
  }

  async createMemberDocument(memberId: any): Promise<CreateDocumentsResult> {
    try {
      const existingDocuments = await Document.find({ owner: memberId });
      if (existingDocuments.length > 0) {
        return {
          success: false,
          message: 'Des documents existent déjà pour ce propriétaire',
        };
      }
      // Define the required document types for a company
      const requiredDocumentTypes = driverDocuments.map(
        (doc) => doc.documentType
      );

      // Create all required documents for the company
      const documentStore = requiredDocumentTypes.map((type) => ({
        documentType: type,
        owner: memberId,
      }));

      const createdDocuments = await Document.insertMany(documentStore);
      if (createdDocuments.length === 0) {
        return { success: false, message: 'No documents created' };
      }
      return {
        success: true,
        message: 'Documents created successfully',
        documents: createdDocuments,
      };
    } catch (error) {
      throw new Error('Error creating document');
    }
  }

  async createCompanyDocument(companyId: any): Promise<CreateDocumentsResult> {
    try {
      const existingDocuments = await Document.find({ owner: companyId });
      if (existingDocuments.length > 0) {
        return {
          success: false,
          message: 'Des documents existent déjà pour ce propriétaire',
        };
      }

      const requiredDocumentTypes = companyDocuments.map(
        (doc) => doc.documentType
      );

      const documentStore = requiredDocumentTypes.map((type) => ({
        documentType: type,
        owner: companyId,
      }));

      const createdDocuments = await Document.insertMany(documentStore);
      if (createdDocuments.length === 0) {
        return { success: false, message: 'No documents created' };
      }
      return {
        success: true,
        message: 'Documents created successfully',
        documents: createdDocuments,
      };
    } catch (error) {
      throw new Error('Error creating document');
    }
  }
}

const documentService = new DocumentService();

export default documentService;
