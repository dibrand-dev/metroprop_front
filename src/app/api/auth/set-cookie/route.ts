import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log("Received request to set cookie");
  try {
    const { token } = await request.json();
    console.log("Token received:", token);

    if (!token) {
      console.log(" if (!token) {");
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    console.log("const response = NextResponse.json(");
    // Create response with Set-Cookie header
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Set the authentication cookie
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
console.log("response", response);
    return response;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set authentication cookie' },
      { status: 500 }
    );
  }
}
