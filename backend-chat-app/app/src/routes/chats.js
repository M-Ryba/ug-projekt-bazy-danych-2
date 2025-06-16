import express from 'express';
import { getChats, getChatById, createChat, updateChat, deleteChat, addMembers, removeMember, leaveChat } from '../controllers/chatsController.js';
import { requireChatMembership, requireChatAdminOrOwner } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', getChats);
router.post('/', createChat);

router.get('/:id', requireChatMembership, getChatById);
router.post('/:id/leave', requireChatMembership, leaveChat);

router.put('/:id', requireChatAdminOrOwner, updateChat);
router.delete('/:id', requireChatAdminOrOwner, deleteChat);
router.post('/:id/members', requireChatAdminOrOwner, addMembers);
router.delete('/:id/members/:memberId', requireChatAdminOrOwner, removeMember);

export default router;
