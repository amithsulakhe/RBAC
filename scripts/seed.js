require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const hospitalSeed = [
  { hospital: { name: 'City General Hospital', code: 'CGH' }, services: [
    { name: 'Radiology', slug: 'radiology', route: '/services/radiology', order: 1 },
    { name: 'Laboratory', slug: 'laboratory', route: '/services/laboratory', order: 2 },
  ]},
  { hospital: { name: 'Metro Health Clinic', code: 'MHC' }, services: [
    { name: 'Pharmacy', slug: 'pharmacy', route: '/services/pharmacy', order: 1 },
  ]},
  { hospital: { name: 'Sunrise Medical Center', code: 'SMC' }, services: [
    { name: 'Radiology', slug: 'radiology', route: '/services/radiology', order: 1 },
    { name: 'Emergency', slug: 'emergency', route: '/services/emergency', order: 2 },
    { name: 'Pharmacy', slug: 'pharmacy', route: '/services/pharmacy', order: 3 },
  ]},
];

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard', parentKey: null, order: 1 },
  { key: 'masters-setup', label: 'Masters & Setup', icon: 'settings', route: '', parentKey: null, order: 2 },
  { key: 'hospital-branch', label: 'Hospital & Branch', icon: 'building', route: '/masters/hospital-branch', parentKey: 'masters-setup', order: 1, badgeCount: 329 },
  { key: 'provider', label: 'Provider', icon: 'provider', route: '/masters/provider', parentKey: 'masters-setup', order: 2, badgeCount: 967 },
  { key: 'dummy-provider', label: 'Dummy Provider Creation', icon: 'user-plus', route: '/masters/dummy-provider', parentKey: 'masters-setup', order: 3 },
  { key: 'master', label: 'Master', icon: 'database', route: '/masters/master', parentKey: 'masters-setup', order: 4 },
  { key: 'automated-email', label: 'Automated Email Config', icon: 'mail', route: '/masters/automated-email', parentKey: 'masters-setup', order: 5 },
  { key: 'scheduling', label: 'Scheduling & Preferences', icon: 'calendar', route: '/scheduling', parentKey: null, order: 3 },
  { key: 'scribe-management', label: 'Scribe Management', icon: 'scribe', route: '/scribe-management', parentKey: null, order: 4 },
  { key: 'revenue-billing', label: 'Revenue & Billing', icon: 'billing', route: '/revenue-billing', parentKey: null, order: 5 },
  { key: 'reports', label: 'Reports', icon: 'reports', route: '/reports', parentKey: null, order: 6 },
  { key: 'role-config', label: 'Role Configuration', icon: 'shield', route: '/role-config', parentKey: null, order: 7 },
  { key: 'services', label: 'Services', icon: 'services', route: '', parentKey: null, order: 8, isDynamic: true },
];

const roles = [
  { name: 'Admin', code: 'admin', allowedNavKeys: ['dashboard','masters-setup','hospital-branch','provider','dummy-provider','master','automated-email','scheduling','scribe-management','revenue-billing','reports','services'],
    screenPrivileges: { dashboard:['read','write'], 'hospital-branch':['read','write','delete'], provider:['read','write','delete'], 'dummy-provider':['read','write'], master:['read','write','delete'], 'automated-email':['read','write'], scheduling:['read','write','delete'], 'scribe-management':['read','write'], 'revenue-billing':['read','write','delete'], reports:['read','write','delete'], services:['read','write','delete'] }},
  { name: 'User', code: 'user', allowedNavKeys: ['dashboard','scheduling','reports','services'],
    screenPrivileges: { dashboard:['read'], scheduling:['read','write'], reports:['read'], services:['read'] }},
];

const adminNavKeys = roles.find((r) => r.code === 'admin').allowedNavKeys;
const adminPrivileges = roles.find((r) => r.code === 'admin').screenPrivileges;
const userNavKeys = roles.find((r) => r.code === 'user').allowedNavKeys;
const userPrivileges = roles.find((r) => r.code === 'user').screenPrivileges;

function withoutKeys(keys, remove) {
  return keys.filter((key) => !remove.includes(key));
}

function withoutScreens(privileges, remove) {
  const copy = { ...privileges };
  for (const key of remove) delete copy[key];
  return copy;
}

const users = [
  { name: 'Super Admin', email: 'superadmin@nav.com', password: 'SuperAdmin@123', userType: 'super_admin', hospitalCode: 'CGH' },
  { name: 'Admin User', email: 'admin@nav.com', password: 'Admin@123', userType: 'admin', roleCode: 'admin', hospitalCode: 'CGH' },
  { name: 'Admin No Dashboard', email: 'admin2@nav.com', password: 'Admin@123', userType: 'admin', roleCode: 'admin', hospitalCode: 'CGH',
    isCustomized: true,
    customAllowedNavKeys: withoutKeys(adminNavKeys, ['dashboard']),
    customScreenPrivileges: withoutScreens(adminPrivileges, ['dashboard']) },
  { name: 'Sarah Johnson', email: 'sarah.admin@nav.com', password: 'Admin@123', userType: 'admin', roleCode: 'admin', hospitalCode: 'MHC' },
  { name: 'Mike Chen', email: 'mike.admin@nav.com', password: 'Admin@123', userType: 'admin', roleCode: 'admin', hospitalCode: 'SMC',
    isCustomized: true,
    customAllowedNavKeys: withoutKeys(adminNavKeys, ['reports', 'revenue-billing']),
    customScreenPrivileges: withoutScreens(adminPrivileges, ['reports', 'revenue-billing']) },
  { name: 'Regular User', email: 'user@nav.com', password: 'User@123', userType: 'user', roleCode: 'user', hospitalCode: 'CGH' },
  { name: 'User No Dashboard', email: 'user2@nav.com', password: 'User@123', userType: 'user', roleCode: 'user', hospitalCode: 'CGH',
    isCustomized: true,
    customAllowedNavKeys: withoutKeys(userNavKeys, ['dashboard']),
    customScreenPrivileges: withoutScreens(userPrivileges, ['dashboard']) },
  { name: 'Jane Doe', email: 'jane.user@nav.com', password: 'User@123', userType: 'user', roleCode: 'user', hospitalCode: 'MHC' },
  { name: 'Tom Wilson', email: 'tom.user@nav.com', password: 'User@123', userType: 'user', roleCode: 'user', hospitalCode: 'SMC' },
  { name: 'Lisa Park', email: 'lisa.user@nav.com', password: 'User@123', userType: 'user', roleCode: 'user', hospitalCode: 'CGH',
    isCustomized: true,
    customAllowedNavKeys: userNavKeys,
    customScreenPrivileges: { ...userPrivileges, reports: ['read', 'write'] } },
  { name: 'Raj Patel', email: 'raj.user@nav.com', password: 'User@123', userType: 'user', roleCode: 'user', hospitalCode: 'MHC' },
];

const hospitalSchema = new mongoose.Schema({ name: String, code: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const serviceSchema = new mongoose.Schema({ name: String, slug: String, hospital: mongoose.Schema.Types.ObjectId, route: String, order: Number, isActive: { type: Boolean, default: true } }, { timestamps: true });
const roleSchema = new mongoose.Schema({ name: String, code: String, allowedNavKeys: [String], screenPrivileges: { type: Map, of: [String] }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  userType: String,
  role: mongoose.Schema.Types.ObjectId,
  hospital: mongoose.Schema.Types.ObjectId,
  isCustomized: { type: Boolean, default: false },
  customAllowedNavKeys: [String],
  customScreenPrivileges: { type: Map, of: [String] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
const navSchema = new mongoose.Schema({ key: String, label: String, icon: String, route: String, parentKey: String, order: Number, badgeCount: Number, isDynamic: Boolean, isActive: { type: Boolean, default: true } }, { timestamps: true });

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const NavigationItem = mongoose.models.NavigationItem || mongoose.model('NavigationItem', navSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Role.deleteMany({});
  await NavigationItem.deleteMany({});
  await Service.deleteMany({});
  await Hospital.deleteMany({});
  await NavigationItem.insertMany(navigationItems);

  const createdRoles = {};
  for (const role of roles) createdRoles[role.code] = await Role.create(role);

  const hospitals = {};
  for (const item of hospitalSeed) {
    const hospital = await Hospital.create(item.hospital);
    hospitals[item.hospital.code] = hospital;
    for (const s of item.services) await Service.create({ ...s, hospital: hospital._id });
  }

  for (const u of users) {
    await User.create({
      name: u.name,
      email: u.email,
      password: await bcrypt.hash(u.password, 10),
      userType: u.userType,
      role: u.roleCode ? createdRoles[u.roleCode]._id : undefined,
      hospital: hospitals[u.hospitalCode]._id,
      isCustomized: u.isCustomized || false,
      customAllowedNavKeys: u.customAllowedNavKeys || [],
      customScreenPrivileges: u.customScreenPrivileges || {},
    });
  }

  console.log(`Seed completed: ${users.length} users (${users.length - 1} in user management)`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
