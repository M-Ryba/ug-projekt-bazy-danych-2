import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, auto: true },
    chatId: { type: Number, required: true }, // Chat: id [Prisma]
    senderId: { type: Number, required: true }, // User: id [Prisma]
    content: { type: String },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    readBy: [{ type: Number }] // Array of userIds who have read the message
  },
  {
    timestamps: true
  }
);

// Indexing for performance
MessageSchema.index({ chatId: 1, createdAt: -1 });

// Unread messages count for a user in a chat
MessageSchema.statics.countUnreadMessages = function (senderId, chatId) {
  return this.aggregate([
    {
      $match: {
        chatId: chatId,
        senderId: { $ne: senderId },
        readBy: { $nin: [senderId] },
        isDeleted: false
      }
    },
    { $count: 'unreadCount' }
  ]);
};

const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
