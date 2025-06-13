import express from 'express';
import { getChats, getChatById, createChat, updateChat, deleteChat, addMembers, removeMember, leaveChat } from '../controllers/chatsController.js';

const router = express.Router();

router.get('/', getChats);
router.get('/:id', getChatById);
router.post('/', createChat);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);
router.post('/:id/members', addMembers);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/leave', leaveChat);

export default router;
