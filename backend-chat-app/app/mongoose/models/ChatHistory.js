import mongoose, { Schema } from 'mongoose';

const ChatHistorySchema = new Schema({
  chatId: { type: Number, required: true }, // from Prisma
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

const ChatHistoryModel = mongoose.model('ChatHistory', ChatHistorySchema);

export default ChatHistoryModel;
