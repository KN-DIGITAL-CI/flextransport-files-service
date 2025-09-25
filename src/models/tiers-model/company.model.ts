import mongoose, { Schema } from 'mongoose';

const companySchema = new Schema(
  {
    reference: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'suspended'],
      default: 'active',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    logo: {
      fileId: {
        type: String,
        required: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
    },
    email: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    rccm: {
      type: String,
      required: false,
    },
    fleetSize: { type: Number, default: 0 },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    cares: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Care',
      },
    ],
    stations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Station',
      },
    ],
  },
  { timestamps: true, collection: 'Company' }
);

export default mongoose.model('Company', companySchema);
