import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'offer', 'system'],
      default: 'text',
    },
    messageText: {
      type: String,
      required: true,
      trim: true,
    },
    attachment: {
      storageKey: String,
      originalFileName: String,
      mimeType: String,
      fileSizeBytes: Number,
    },
    offerDetails: {
      amountPaise: Number,
      currency: { type: String, default: 'INR' },
      pricePeriod: String,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
export default Message;
