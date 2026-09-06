import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Role from '@/lib/models/Role';
import { getAuthUser, requireAuth, requireSuperAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });
  const adminError = requireSuperAdmin(user);
  if (adminError) return NextResponse.json({ message: adminError.error }, { status: adminError.status });

  const { screenPrivileges } = await request.json();
  await connectDB();
  const role = await Role.findByIdAndUpdate(params.id, { screenPrivileges }, { new: true });
  if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
  return NextResponse.json(role);
}
