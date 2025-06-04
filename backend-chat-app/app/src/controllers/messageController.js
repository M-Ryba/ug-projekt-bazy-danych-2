import Message from '../../mongoose/models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error while sending a message', error: error.message });
  }
};
