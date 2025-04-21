import dotenv from 'dotenv';

dotenv.config(); // Load variables from .env

import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err: any) => console.log("❌ MongoDB Connection Error:", err));

// Define schema with types and validation
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email : {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  }
});

const User = mongoose.model('User', userSchema);

export default User;
