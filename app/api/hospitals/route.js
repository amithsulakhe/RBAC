import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/lib/models/Hospital';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });

  await connectDB();
  const hospitals = await Hospital.find({ isActive: true }).sort({ name: 1 });
  return NextResponse.json(hospitals);
}
