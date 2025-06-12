export const getNotifications = async (req, res) => {
  res.json({ notifications: [] });
};

export const markNotificationRead = async (req, res) => {
  res.json({ message: 'Notification marked as read' });
};

export const markAllNotificationsRead = async (req, res) => {
  res.json({ message: 'All notifications marked as read' });
};
