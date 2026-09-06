import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    allowedNavKeys: [{ type: String }],
    screenPrivileges: {
      type: Map,
      of: [String],
      default: {},
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
