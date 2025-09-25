import { Schema, model } from 'mongoose';
import { IDocument } from '../types/document';
import { fileSchema } from '../utils/schemaFactory';

const currentDate = new Date();

const DocumentSchema = new Schema<IDocument>(
  {
    owner: {
      type: Schema.Types.Mixed,
      required: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: [
        'PASSPORT',
        'DRIVING_LICENCE',
        'ID_CARD',
        'RESIDENCE_CARD',
        'CNI',
        'RCCM',
        'DFE',
        'CAD',
        'DH',
        'RUB',
      ],
    },
    files: {
      type: [fileSchema()],
      required: true,
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'valided', 'rejected', 'in progress'],
      default: 'pending',
    },
    expirationDate: {
      type: Date,
      default: currentDate,
    },
    validityDate: {
      type: Date,
      default: currentDate,
    },
    motif: String,
    createdAt: {
      type: Date,
      default: currentDate,
    },
    updatedAt: {
      type: Date,
      default: currentDate,
    },
  },
  { timestamps: true, collection: 'documents' }
);

export default model<IDocument>('Document', DocumentSchema);
