import { Types } from 'mongoose';

function fileSchema() {
  return {
    fileUrl: { type: String },
    fileId: { type: String },
  };
}

function refSchema(ref: string) {
  return {
    type: Types.ObjectId,
    ref: ref,
  };
}

function refArraySchema(ref: string) {
  return {
    type: [
      {
        type: Types.ObjectId,
        ref: ref,
      },
    ],
    default: [],
  };
}

export { fileSchema, refArraySchema, refSchema };
