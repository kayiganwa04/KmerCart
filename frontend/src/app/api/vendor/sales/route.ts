import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const cookies = req.cookies;
    const userCookie = cookies.get('user')?.value;
    if (!userCookie) return NextResponse.json({ totalSales: 0 });

    const user = JSON.parse(decodeURIComponent(userCookie));
    const vendorName = user?.vendorProfile?.businessName || user?.firstName || '';

    const ordersPath = path.join(process.cwd(), 'src', 'data', 'orders.json');
    const raw = fs.readFileSync(ordersPath, 'utf8');
    const orders = JSON.parse(raw);

    const vendorOrders = orders.filter((o: any) => o.vendorName === vendorName);
    const totalSales = vendorOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    return NextResponse.json({ totalSales, ordersCount: vendorOrders.length });
  } catch (err) {
    return NextResponse.json({ totalSales: 0 });
  }
}
