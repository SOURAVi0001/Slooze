import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  country: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.MEMBER },
  country: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
