import { NextResponse } from 'next/server';
import { getAuthUser, requireAuth, requireScreenPrivilege } from '@/lib/auth';

export async function DELETE(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });

  const { searchParams } = new URL(request.url);
  const screenKey = searchParams.get('screenKey');
  const privError = requireScreenPrivilege(user, screenKey, 'delete');
  if (privError) return NextResponse.json({ message: privError.error }, { status: privError.status });

  return NextResponse.json({
    success: true,
    message: `Record deleted on '${screenKey}' screen`,
    action: 'delete',
    screenKey,
    performedBy: user.name,
  });
}
