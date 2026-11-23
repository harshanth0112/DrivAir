import mongoose from 'mongoose';

const documentRequirementSchema = new mongoose.Schema(
  {
    category: {
      type: String, // driver, car, taxi, bus, truck, etc.
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    applicableFor: {
      type: String,
      enum: ['driver', 'vehicle', 'company', 'both'],
      required: true,
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    applicableState: {
      type: String,
      default: 'ALL',
    },
    validityRequired: {
      type: Boolean,
      default: true,
    },
    reminderDays: {
      type: [Number],
      default: [30, 15, 7],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const DocumentRequirement = mongoose.model('DocumentRequirement', documentRequirementSchema);
export default DocumentRequirement;
