import { Document as MongooseDocument, Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  documentType: string;
  files: any[];
  status: string;
  expirationDate: Date;
  validityDate: Date;
  motif: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDocumentsResult = {
  success: boolean;
  message: string;
  documents?: IDocument[];
};

export interface IDocumentService {
  createDriverDocument(driverId: string): Promise<CreateDocumentsResult>;
  createCustomerDocument(customerId: string): Promise<CreateDocumentsResult>;
  createMemberDocument(memberId: string): Promise<CreateDocumentsResult>;
  createCompanyDocument(companyId: string): Promise<CreateDocumentsResult>;
}
