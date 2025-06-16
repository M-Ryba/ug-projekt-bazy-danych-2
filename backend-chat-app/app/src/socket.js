import { Server } from 'socket.io';
import MessageModel from '../mongoose/models/Message.js';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Fetch message history after joining a chat
    socket.on('join_chat', async (chatId) => {
      socket.join(chatId);
      let queryChatId = chatId;
      // If chatId is not a number, do not fetch history (or set to null)
      if (isNaN(Number(chatId))) {
        queryChatId = null;
      }
      let history = [];
      if (queryChatId !== null) {
        history = await MessageModel.find({ chatId: Number(queryChatId) })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      }
      socket.emit('chat_history', history.reverse());
    });

    // Sending a new message (text, media, emoji, gif)
    socket.on('send_message', async (data) => {
      // data: { chatId, username, content, type, media }
      let chatId = data.chatId;
      if (isNaN(Number(chatId))) {
        chatId = null;
      }
      const msg = new MessageModel({
        chatId: chatId !== null ? Number(chatId) : undefined,
        senderUsername: data.username,
        content: data.content,
        type: data.type || 'text',
        media: data.media || undefined
      });
      await msg.save();
      io.to(data.chatId).emit('receive_message', msg.toObject());
    });

    // Editing a message
    socket.on('edit_message', async ({ messageId, username, content }) => {
      const msg = await MessageModel.findOneAndUpdate(
        { _id: messageId, senderUsername: username, isDeleted: false },
        { content, isEdited: true },
        { new: true }
      );
      if (msg) io.to(msg.chatId).emit('message_edited', msg.toObject());
    });

    // Deleting a message
    socket.on('delete_message', async ({ messageId, username }) => {
      const msg = await MessageModel.findOneAndUpdate(
        { _id: messageId, senderUsername: username, isDeleted: false },
        { isDeleted: true, content: '' },
        { new: true }
      );
      if (msg) io.to(msg.chatId).emit('message_deleted', { messageId });
    });

    // User status update
    socket.on('update_status', (statusData) => {
      // statusData: { userId, status }
      io.emit('status_update', statusData);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
