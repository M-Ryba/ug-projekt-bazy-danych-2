export const blockUser = async (req, res) => {
  res.json({ message: 'User blocked' });
};

export const unblockUser = async (req, res) => {
  res.json({ message: 'User unblocked' });
};
