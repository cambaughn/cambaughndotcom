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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      expand: ['data.customer'],
      status: 'all'
    });

    const subscription = subscriptions.data.find(sub => 
      sub.metadata.userId === userId && 
      (sub.status === 'active' || sub.status === 'trialing')
    );

    console.log('Checking subscription for userId:', userId);
    console.log('Found subscription:', subscription ? {
      id: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end
    } : 'None');

    return NextResponse.json(
      { 
        hasSubscription: !!subscription,
        status: subscription?.status,
        trialEnd: subscription?.trial_end,
        isTrialing: subscription?.status === 'trialing',
        subscriptionId: subscription?.id,
        currentPeriodEnd: subscription?.current_period_end,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}