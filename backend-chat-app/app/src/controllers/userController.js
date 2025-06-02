import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching users', error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Missing required fields: name and email are required' });
    }

    const result = await prisma.user.create({
      data: {
        name,
        email
      }
    });
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    res.status(500).json({ message: 'Error while creating user', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error: ', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ message: 'At least one field to update is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: name !== undefined ? name : user.name,
        email: email !== undefined ? email : user.email
      }
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Error while updating user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    await prisma.user.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error while deleting user', error: error.message });
  }
};
