// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';  // Import NextRequest and NextResponse for typing
import User from '@/backend/models/User';
import mongodbConnect from '@/backend/lib/mongodb';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/backend/services/sendemail';

export async function POST(req: NextRequest) {
  try {
    await mongodbConnect();

    // แปลค่า email ที่แนบมากับ body ใน client
    const { email } = await req.json();

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      );
    }

    // สร้าง verification token อันใหม่
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // อัพเดทค่า verification token และเวลาหมดอายุอันใหม่ใน database
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email to the user
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { message: 'Error sending verification email' },
      { status: 500 }
    );
  }
}
