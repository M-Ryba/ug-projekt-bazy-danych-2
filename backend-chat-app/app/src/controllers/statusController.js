export const getStatus = async (req, res) => {
  res.json({ status: 'ONLINE' });
};

export const updateStatus = async (req, res) => {
  res.json({ message: 'Status updated' });
};
