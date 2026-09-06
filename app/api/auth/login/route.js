import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser, jsonUser, requireAuth, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email, isActive: true })
      .select('+password')
      .populate('role')
      .populate('hospital');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken(user._id);
    return NextResponse.json({ token, user: jsonUser(user) });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
