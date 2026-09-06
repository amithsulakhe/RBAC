import mongoose from 'mongoose';

const navigationItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    icon: { type: String, default: 'default' },
    route: { type: String, default: '' },
    parentKey: { type: String, default: null },
    order: { type: Number, default: 0 },
    badgeCount: { type: Number, default: null },
    isDynamic: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.NavigationItem || mongoose.model('NavigationItem', navigationItemSchema);
