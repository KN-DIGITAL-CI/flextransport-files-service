import { Schema, model } from 'mongoose';

const driverSchema = new Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: '',
    },
    personnalInfo: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      gender: {
        type: String,
        required: true,
        enum: ['WOMAN', 'MAN'],
      },
      maritalStatus: {
        type: String,
        required: true,
        enum: ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'],
      },
      numberOfChildren: {
        type: Number,
        required: true,
      },
      yearOfExperience: {
        type: Number,
        required: true,
      },
      images: {
        avatar: {
          type: String,
          required: false,
        },
        cover: {
          type: String,
          required: false,
        },
      },
      driverLicense: {
        fileUrl: {
          type: String,
          required: false,
        },
        fileId: {
          type: String,
          required: false,
        },
      },
      address: {
        country: String,
        city: String,
        street: String,
        postalCode: String,
      },
    },
    documents: [
      {
        fileUrl: {
          type: String,
          required: false,
        },
        fileId: {
          type: String,
          required: false,
        },
      },
    ],
    contactParent: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      relationship: {
        type: String,
        required: true,
        enum: [
          'BROTHER',
          'SISTER',
          'FATHER',
          'MOTHER',
          'AUNT',
          'UNCLE',
          'TUTOR',
        ],
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['AVAILABLE', 'BUSY', 'UNAVAILABLE'],
      default: 'AVAILABLE',
    },
    pinCode: {
      type: String,
      required: false,
      default: '',
    },
    pinCodeExpires: {
      type: Date,
      required: false,
      default: new Date(),
    },
    pinCodeResetToken: {
      type: String,
      required: false,
      default: '',
    },
    pinCodeResetExpires: {
      type: Date,
      required: false,
      default: new Date(),
    },
    pinCodeResetTokenExpires: {
      type: Date,
      required: false,
      default: new Date(),
    },
    companyId: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
    authTokens: [
      {
        authToken: {
          type: String,
          required: false,
        },
      },
    ],
    mfaEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    mfaSecret: {
      type: String,
      required: false,
      default: '',
    },
  },
  { timestamps: true }
);

const Driver = model('Driver', driverSchema);

export default Driver;
