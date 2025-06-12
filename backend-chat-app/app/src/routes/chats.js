import express from 'express';
import {
  getChats,
  createChat,
  getChat,
  updateChat,
  deleteChat,
  joinChat,
  leaveChat,
  getChatHistory,
  searchChatMessages
} from '../controllers/chatsController.js';
const router = express.Router();

// GET /api/chats
router.get('/', getChats);
// POST /api/chats
router.post('/', createChat);
// GET /api/chats/:chatId
router.get('/:chatId', getChat);
// PATCH /api/chats/:chatId
router.patch('/:chatId', updateChat);
// DELETE /api/chats/:chatId
router.delete('/:chatId', deleteChat);
// POST /api/chats/:chatId/join
router.post('/:chatId/join', joinChat);
// POST /api/chats/:chatId/leave
router.post('/:chatId/leave', leaveChat);
// GET /api/chats/:chatId/history
router.get('/:chatId/history', getChatHistory);
// GET /api/chats/:chatId/search
router.get('/:chatId/search', searchChatMessages);

export default router;
