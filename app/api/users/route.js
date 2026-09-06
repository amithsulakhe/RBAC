import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, jsonUser, requireAuth, requireSuperAdmin } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });
  const adminError = requireSuperAdmin(user);
  if (adminError) return NextResponse.json({ message: adminError.error }, { status: adminError.status });

  await connectDB();
  const users = await User.find({ isActive: true }).populate('role').populate('hospital').sort({ name: 1 });
  return NextResponse.json(users.map(jsonUser));
}
