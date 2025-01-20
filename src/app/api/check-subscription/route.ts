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
    
    // Rest of your code...
    
    return NextResponse.json(
      { /* your response data */ },
      { headers: corsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}