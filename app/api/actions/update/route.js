import { NextResponse } from 'next/server';
import { getAuthUser, requireAuth, requireScreenPrivilege } from '@/lib/auth';

export async function PUT(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });

  const { screenKey } = await request.json();
  const privError = requireScreenPrivilege(user, screenKey, 'write');
  if (privError) return NextResponse.json({ message: privError.error }, { status: privError.status });

  return NextResponse.json({
    success: true,
    message: `Record updated on '${screenKey}' screen`,
    action: 'update',
    screenKey,
    performedBy: user.name,
  });
}
