import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavigationItem from '@/lib/models/NavigationItem';
import { getAuthUser, requireAuth, requireSuperAdmin } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });
  const adminError = requireSuperAdmin(user);
  if (adminError) return NextResponse.json({ message: adminError.error }, { status: adminError.status });

  await connectDB();
  const items = await NavigationItem.find({ isActive: true }).sort({ order: 1 });
  return NextResponse.json(items);
}
