import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, jsonUser, requireAuth, requireSuperAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });
  const adminError = requireSuperAdmin(user);
  if (adminError) return NextResponse.json({ message: adminError.error }, { status: adminError.status });

  const body = await request.json();
  await connectDB();

  const update = {};
  if (body.role !== undefined) update.role = body.role;
  if (body.isCustomized !== undefined) update.isCustomized = body.isCustomized;
  if (body.customAllowedNavKeys !== undefined) update.customAllowedNavKeys = body.customAllowedNavKeys;
  if (body.customScreenPrivileges !== undefined) {
    update.customScreenPrivileges = body.customScreenPrivileges;
  }
  if (body.isActive !== undefined) update.isActive = body.isActive;

  const updated = await User.findByIdAndUpdate(params.id, update, { new: true })
    .populate('role')
    .populate('hospital');
  if (!updated) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  return NextResponse.json(jsonUser(updated));
}
