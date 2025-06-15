import express from 'express';
import { getChats, getChatById, createChat, updateChat, deleteChat, addMembers, removeMember, leaveChat } from '../controllers/chatsController.js';
import { requireChatMembership, requireChatAdminOrOwner } from '../middleware/permissions.js';

const router = express.Router();

// Public chat routes (user must be authenticated)
router.get('/', getChats); // Shows only chats where user is member
router.post('/', createChat); // Create new chat

// Routes that require chat membership
router.get('/:id', requireChatMembership, getChatById);
router.post('/:id/leave', requireChatMembership, leaveChat);

// Routes that require admin/owner permissions
router.put('/:id', requireChatAdminOrOwner, updateChat);
router.delete('/:id', requireChatAdminOrOwner, deleteChat);
router.post('/:id/members', requireChatAdminOrOwner, addMembers);
router.delete('/:id/members/:memberId', requireChatAdminOrOwner, removeMember);

export default router;
