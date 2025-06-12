export const getContacts = async (req, res) => {
  res.json({ contacts: [] });
};

export const addContact = async (req, res) => {
  res.json({ message: 'Contact added' });
};

export const deleteContact = async (req, res) => {
  res.json({ message: 'Contact deleted' });
};

export const searchContacts = async (req, res) => {
  res.json({ results: [] });
};
