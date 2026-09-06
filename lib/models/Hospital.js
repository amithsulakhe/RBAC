import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
