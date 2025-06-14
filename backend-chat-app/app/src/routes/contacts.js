import express from 'express';
import { getContacts, addContact, updateContact, deleteContact } from '../controllers/contactsController.js';
import { requireAuth, requireResourceOwnership } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// User can see and manage only their own contacts
router.get('/', getContacts); // Controller already filters by user
router.post('/', addContact); // Controller already checks ownership

// Routes that require resource ownership
router.put('/:id', requireResourceOwnership('contact'), updateContact);
router.delete('/:id', requireResourceOwnership('contact'), deleteContact);

export default router;
