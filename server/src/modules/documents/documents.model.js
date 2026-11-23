import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerType: {
      type: String,
      enum: ['company', 'driver', 'vehicleOwner', 'vehicle'],
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      index: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    documentNumber: {
      type: String,
      trim: true,
    },
    storageProvider: {
      type: String,
      enum: ['cloudinary', 's3', 'local', 'other'],
      default: 'local',
    },
    storageKey: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    originalFileName: String,
    mimeType: String,
    fileSizeBytes: Number,
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired', 'resubmissionRequired'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    replacedDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
  },
  { timestamps: true }
);

documentSchema.index({ ownerId: 1, documentType: 1 });
documentSchema.index({ verificationStatus: 1, expiryDate: 1 });

export const Document = mongoose.model('Document', documentSchema);
export default Document;
