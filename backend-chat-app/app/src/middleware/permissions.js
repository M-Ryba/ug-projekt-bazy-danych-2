import prisma from '../../prisma/client.js';

// Middleware to check if user is an admin
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin permissions', error: error.message });
  }
};

// Middleware to check if user is member of a chat
export const requireChatMembership = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const chatId = req.params.id;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    const membership = await prisma.chatMember.findFirst({
      where: {
        chatId: parseInt(chatId),
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this chat' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking chat membership', error: error.message });
  }
};

// Middleware to check if user is admin or owner of a chat
export const requireChatAdminOrOwner = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const chatId = req.params.id;

    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(chatId),
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] }
              }
            }
          }
        ]
      }
    });

    if (!chat) {
      return res.status(403).json({ message: 'Access denied: Admin or owner access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking chat permissions', error: error.message });
  }
};

// Middleware to check if user owns a resource (user profile, contact, notification)
export const requireResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;

      // For user resources, check if the user is accessing their own data
      if (resourceType === 'user') {
        if (parseInt(resourceId) !== userId) {
          return res.status(403).json({ message: 'Access denied: You can only access your own user data' });
        }
      }

      // For status resources, check if the user is only modifying their own status
      if (resourceType === 'status') {
        if (parseInt(resourceId) !== userId) {
          return res.status(403).json({ message: 'Access denied: You can only modify your own status' });
        }
      }

      // For contact resources, check if the user owns the contact
      if (resourceType === 'contact') {
        const contact = await prisma.contact.findFirst({
          where: {
            id: parseInt(resourceId),
            ownerId: userId
          }
        });

        if (!contact) {
          return res.status(403).json({ message: 'Access denied: Contact not found or not owned by you' });
        }
      }

      // For notification resources, check if the user owns the notification
      if (resourceType === 'notification') {
        const notification = await prisma.notification.findFirst({
          where: {
            id: parseInt(resourceId),
            userId: userId
          }
        });

        if (!notification) {
          return res.status(403).json({ message: 'Access denied: Notification not found or not owned by you' });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking resource ownership', error: error.message });
    }
  };
};

// Middleware to check if user can access another user's data (for viewing profiles, etc.)
export const canViewUserProfile = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = parseInt(req.params.id || req.params.userId);

    // Users can always view their own profile
    if (currentUserId === targetUserId) {
      return next();
    }

    // Check if target user allows being searched
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { searchable: true }
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if users are contacts or in same chat
    const areConnected = await prisma.contact.findFirst({
      where: {
        OR: [
          { ownerId: currentUserId, contactId: targetUserId },
          { ownerId: targetUserId, contactId: currentUserId }
        ]
      }
    });

    const sharedChat = await prisma.chat.findFirst({
      where: {
        members: {
          every: {
            userId: { in: [currentUserId, targetUserId] }
          }
        }
      }
    });

    // If not in contacts or not in same chat and target user is not searchable, deny access
    if (!areConnected && !sharedChat && !targetUser.searchable) {
      return res.status(403).json({ message: "Access denied: You cannot view this user's profile" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking profile access', error: error.message });
  }
};

// Middleware to check if user can view another user's status (showStatus)
export const canViewUserStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = parseInt(req.params.userId);

    // User can always view their own status
    if (currentUserId === targetUserId) {
      return next();
    }
    // Check if target user allows their status to be viewed
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { showStatus: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.showStatus) {
      return res.status(403).json({ message: 'This user does not allow their status to be viewed' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking status permissions', error: error.message });
  }
};

export const canReceiveInvites = async (req, res, next) => {
  try {
    const { contactId } = req.body;
    if (!contactId) {
      return res.status(400).json({ message: 'Contact ID is required' });
    }
    const user = await prisma.user.findUnique({
      where: { id: contactId },
      select: { allowInvites: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'Contact user not found' });
    }
    if (!user.allowInvites) {
      return res.status(403).json({ message: 'This user does not allow invites' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking invite permissions', error: error.message });
  }
};
