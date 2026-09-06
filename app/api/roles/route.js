import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Role from '@/lib/models/Role';
import NavigationItem from '@/lib/models/NavigationItem';
import { getAuthUser, requireAuth, requireSuperAdmin } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });

  const { pathname } = new URL(request.url);
  if (pathname.endsWith('/navigation-items/all')) {
    const adminError = requireSuperAdmin(user);
    if (adminError) return NextResponse.json({ message: adminError.error }, { status: adminError.status });
    await connectDB();
    const items = await NavigationItem.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(items);
  }

  const adminError = requireSuperAdmin(user);
  if (adminError) return NextResponse.json({ message: adminError.error }, { status: adminError.status });

  await connectDB();
  const roles = await Role.find({ isActive: true }).sort({ name: 1 });
  return NextResponse.json(roles);
}
