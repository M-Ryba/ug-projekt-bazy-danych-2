import mongoose, { Schema } from 'mongoose';

const UserStatusSchema = new Schema({
  userId: { type: Number, required: true, unique: true }, // from Prisma
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'BUSY'], default: 'OFFLINE' },
  lastActive: { type: Date, default: Date.now }
});

const UserStatusModel = mongoose.model('UserStatus', UserStatusSchema);

export default UserStatusModel;
