import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const cookies = req.cookies;
    const userCookie = cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ orders: [] });

    const user = JSON.parse(decodeURIComponent(userCookie));
    const vendorName = user?.vendorProfile?.businessName || user?.firstName || '';

    const filePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const orders = JSON.parse(raw);

    const vendorOrders = orders.filter((o: any) => o.vendorName === vendorName);

    return NextResponse.json({ orders: vendorOrders });
  } catch (err) {
    return NextResponse.json({ orders: [] });
  }
}
