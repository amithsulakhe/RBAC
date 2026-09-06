import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/lib/models/Hospital';
import Service from '@/lib/models/Service';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return NextResponse.json({ message: authError.error }, { status: authError.status });

  await connectDB();
  const hospital = await Hospital.findById(params.id);
  if (!hospital) return NextResponse.json({ message: 'Hospital not found' }, { status: 404 });

  const services = await Service.find({ hospital: params.id, isActive: true }).sort({ order: 1 });
  return NextResponse.json(services);
}
