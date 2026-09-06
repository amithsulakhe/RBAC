import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    userType: {
      type: String,
      enum: ['super_admin', 'admin', 'user'],
      required: true,
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
