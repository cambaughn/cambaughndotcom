import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'chrome-extension://ammjkhemekijlnmfbamlnmfdcobegiea',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Find subscription by metadata
    const subscriptions = await stripe.subscriptions.list({
      limit: 1,
      expand: ['data.customer'],
      status: 'all'
    });

    const subscription = subscriptions.data.find(sub => 
      sub.metadata.userId === userId
    );

    if (!subscription?.customer) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer.id,
      return_url: 'https://www.youtube.com'  // Return to YouTube homepage
    });

    return NextResponse.json(
      { url: session.url },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}