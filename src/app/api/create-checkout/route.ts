import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PRICE_ID = process.env.STRIPE_PRICE_ID;

// Helper function to handle CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'chrome-extension://ammjkhemekijlnmfbamlnmfdcobegiea',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();
    
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://cambaughn.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: PRICE_ID,
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId,
        },
      },
      customer_email: email,
      success_url: `${baseUrl}/inkling/result?status=success`,
      cancel_url: `${baseUrl}/inkling/result?status=cancel`,
    });

    return NextResponse.json(
      { sessionId: session.id },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}