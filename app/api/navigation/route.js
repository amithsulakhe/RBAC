import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, jsonUser, requireAuth } from '@/lib/auth';
import { getNavigationForUser } from '@/lib/navigation';

export async function GET(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });

  const { searchParams } = new URL(request.url);
  const hospitalId = searchParams.get('hospitalId');

  await connectDB();
  const navigation = await getNavigationForUser(user, hospitalId);
  return NextResponse.json(navigation);
}
