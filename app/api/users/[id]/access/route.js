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

  const { allowedNavKeys, screenPrivileges, isCustomized } = await request.json();
  if (!Array.isArray(allowedNavKeys) || !screenPrivileges) {
    return NextResponse.json({ message: 'allowedNavKeys and screenPrivileges are required' }, { status: 400 });
  }

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    params.id,
    {
      isCustomized: isCustomized !== false,
      customAllowedNavKeys: allowedNavKeys,
      customScreenPrivileges: screenPrivileges,
    },
    { new: true }
  )
    .populate('role')
    .populate('hospital');

  if (!updated) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  return NextResponse.json(jsonUser(updated));
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });
  const adminError = requireSuperAdmin(user);
  if (adminError) return NextResponse.json({ message: adminError.error }, { status: adminError.status });

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    params.id,
    {
      isCustomized: false,
      customAllowedNavKeys: [],
      customScreenPrivileges: {},
    },
    { new: true }
  )
    .populate('role')
    .populate('hospital');

  if (!updated) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  return NextResponse.json(jsonUser(updated));
}
