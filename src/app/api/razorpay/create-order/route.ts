import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    // Create order via Razorpay REST API (no SDK needed)
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay uses paise (1 INR = 100 paise)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Razorpay order creation failed:', error);
      return NextResponse.json({ error: error.error?.description || 'Order creation failed' }, { status: 500 });
    }

    const order = await response.json();
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });

  } catch (err) {
    console.error('Razorpay API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
