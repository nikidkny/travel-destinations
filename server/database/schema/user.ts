import mongoose from 'mongoose';

export type UserType = {
  name: string;
  username: string;
  password: string;
};

const userSchema = new mongoose.Schema<UserType>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const User = mongoose.model<UserType>('User', userSchema);
