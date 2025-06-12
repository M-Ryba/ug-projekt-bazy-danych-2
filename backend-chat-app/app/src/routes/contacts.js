import express from 'express';
import { getContacts, addContact, deleteContact, searchContacts } from '../controllers/contactsController.js';
const router = express.Router();

// GET /api/contacts
router.get('/', getContacts);
// POST /api/contacts
router.post('/', addContact);
// DELETE /api/contacts/:contactId
router.delete('/:contactId', deleteContact);
// GET /api/contacts/search
router.get('/search', searchContacts);

export default router;
