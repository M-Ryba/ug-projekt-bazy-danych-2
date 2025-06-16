import express from 'express';
import { getContacts, addContact, updateContact, deleteContact } from '../controllers/contactsController.js';
import { requireResourceOwnership, canReceiveInvites } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', getContacts);
router.post('/', canReceiveInvites, addContact);

router.put('/:id', requireResourceOwnership('contact'), updateContact);
router.delete('/:id', requireResourceOwnership('contact'), deleteContact);

export default router;
