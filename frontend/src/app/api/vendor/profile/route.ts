import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userCookie = req.cookies.get('user')?.value;
  if (!userCookie) return NextResponse.json({ profile: null });
  const user = JSON.parse(decodeURIComponent(userCookie));
  return NextResponse.json({ profile: user.vendorProfile || null });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    // This is a mock API — persist changes in a cookie by returning updated profile;
    // client should update localStorage as well.
    return NextResponse.json({ profile: body });
  } catch (err) {
    return NextResponse.json({ profile: null });
  }
}
