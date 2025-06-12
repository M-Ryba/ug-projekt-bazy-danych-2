import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, auto: true },
    chatId: { type: Number, required: true }, // from Prisma
    senderId: { type: Number, required: true }, // from Prisma
    content: { type: String },
    type: { type: String, enum: ['text', 'image', 'video', 'gif', 'emoji', 'file'], default: 'text' },
    media: {
      data: Buffer, // Binary data
      contentType: String, // MIME type (e.g. "image/jpeg", "video/mp4")
      filename: String, // Original filename
      size: Number // File size in bytes
    },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    readBy: [{ type: Number }] // userId from Prisma
  },
  {
    bufferCommands: false,
    timestamps: true
  }
);

// Indexing for performance
MessageSchema.index({ chatId: 1, createdAt: -1 });

// Unread messages count for a user in a chat
MessageSchema.statics.countUnreadMessages = function (userId, chatId) {
  return this.aggregate([
    {
      $match: {
        chatId: chatId,
        senderId: { $ne: userId },
        readBy: { $nin: [userId] },
        isDeleted: false
      }
    },
    { $count: 'unreadCount' }
  ]);
};

const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
