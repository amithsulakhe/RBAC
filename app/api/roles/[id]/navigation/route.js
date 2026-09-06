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

  const { pathname } = new URL(request.url);
  const body = await request.json();

  await connectDB();

  if (pathname.endsWith('/navigation')) {
    const role = await Role.findByIdAndUpdate(params.id, { allowedNavKeys: body.allowedNavKeys }, { new: true });
    if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    return NextResponse.json(role);
  }

  if (pathname.endsWith('/screen-privileges')) {
    const role = await Role.findByIdAndUpdate(params.id, { screenPrivileges: body.screenPrivileges }, { new: true });
    if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    return NextResponse.json(role);
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 });
}
