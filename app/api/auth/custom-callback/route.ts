import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');

  if (error === 'access_denied') {
    // User canceled the Google authentication
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Default behavior: redirect to the default callback URL
  return NextResponse.redirect(new URL('/api/auth/callback/google', request.url));
}