import jwt from 'jsonwebtoken';
import connectDB from './db';
import User from './models/User';
import './models';
import { hasScreenPrivilege } from './privileges';

const JWT_SECRET = process.env.JWT_SECRET || 'nav-secret-key';

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

export async function getAuthUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.userId).populate('role').populate('hospital');
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

export function requireAuth(user) {
  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }
  return null;
}

export function requireSuperAdmin(user) {
  if (user?.userType !== 'super_admin') {
    return { error: 'Super Admin access required', status: 403 };
  }
  return null;
}

export function requireScreenPrivilege(user, screenKey, privilege) {
  if (!screenKey) {
    return { error: 'screenKey is required', status: 400 };
  }
  if (!hasScreenPrivilege(user, screenKey, privilege)) {
    return {
      error: `You don't have '${privilege}' privilege on '${screenKey}' screen`,
      status: 403,
    };
  }
  return null;
}

export function jsonUser(user) {
  const obj = user.toObject();
  delete obj.password;
  if (obj.role?.screenPrivileges instanceof Map) {
    obj.role.screenPrivileges = Object.fromEntries(obj.role.screenPrivileges);
  }
  return obj;
}
