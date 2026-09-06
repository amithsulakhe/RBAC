import { NextResponse } from 'next/server';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function POST(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });
  return NextResponse.json({ message: 'Logged out successfully' });
}
