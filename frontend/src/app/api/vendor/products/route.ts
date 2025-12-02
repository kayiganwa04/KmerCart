import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const cookies = req.cookies;
    const userCookie = cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ products: [] });

    const user = JSON.parse(decodeURIComponent(userCookie));
    const vendorName = user?.vendorProfile?.businessName || user?.firstName || '';

    const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(raw);

    const vendorProducts = products.filter((p: any) => p.seller?.name === vendorName);

    return NextResponse.json({ products: vendorProducts });
  } catch (err) {
    return NextResponse.json({ products: [] });
  }
}
