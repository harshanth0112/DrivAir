import Conversation from './chat.model.js';
import Message from './message.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, recipientRole, contextType = 'direct', contextId } = req.body;

    if (recipientId === req.user._id.toString()) {
      return next(new AppError('Cannot create conversation with yourself', 400));
    }

    // Check if conversation already exists between these 2 users
    let conv = await Conversation.findOne({
      'participants.userId': { $all: [req.user._id, recipientId] },
      ...(contextId ? { contextId } : {}),
    }).populate('participants.userId', 'fullName role email profileImage');

    if (!conv) {
      conv = await Conversation.create({
        participants: [
          { userId: req.user._id, role: req.user.role },
          { userId: recipientId, role: recipientRole },
        ],
        contextType,
        contextId: contextId || undefined,
        lastMessageAt: new Date(),
      });

      conv = await Conversation.findById(conv._id).populate('participants.userId', 'fullName role email profileImage');
    }

    res.status(200).json({ status: 'success', data: { conversation: conv } });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user._id,
    })
      .populate('participants.userId', 'fullName role email profileImage')
      .populate('lastMessageId')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ status: 'success', results: conversations.length, data: { conversations } });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) {
      return next(new AppError('Conversation not found', 404));
    }

    const isMember = conv.participants.some((p) => p.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return next(new AppError('Unauthorized: You are not a member of this conversation', 403));
    }

    const messages = await Message.find({ conversationId: conv._id })
      .populate('senderId', 'fullName role profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
  } catch (error) {
    next(error);
  }
};

export const postMessage = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) {
      return next(new AppError('Conversation not found', 404));
    }

    const isMember = conv.participants.some((p) => p.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return next(new AppError('Unauthorized to post in this conversation', 403));
    }

    const message = await Message.create({
      conversationId: conv._id,
      senderId: req.user._id,
      messageText: req.body.messageText,
      messageType: req.body.messageType || 'text',
      readBy: [{ userId: req.user._id, readAt: new Date() }],
    });

    conv.lastMessageId = message._id;
    conv.lastMessageAt = new Date();
    await conv.save();

    const populatedMsg = await Message.findById(message._id).populate('senderId', 'fullName role profileImage');

    res.status(201).json({ status: 'success', data: { message: populatedMsg } });
  } catch (error) {
    next(error);
  }
};
