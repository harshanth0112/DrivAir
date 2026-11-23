import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['company', 'driver', 'vehicleOwner', 'admin'],
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    contextType: {
      type: String,
      enum: ['direct', 'contractPost', 'bid', 'directHire', 'contract'],
      default: 'direct',
    },
    contextId: mongoose.Schema.Types.ObjectId,
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });
conversationSchema.index({ contextType: 1, contextId: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
