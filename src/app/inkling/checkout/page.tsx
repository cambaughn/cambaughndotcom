'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import styles from './checkout.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!userId || !email) return;

    const createCheckoutSession = async () => {
      try {
        const response = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            email,
          }),
        });

        const { sessionId } = await response.json();
        const stripe = await stripePromise;
        
        if (!stripe) return;

        const result = await stripe.redirectToCheckout({
          sessionId,
        });

        if (result.error) {
          console.error('Stripe error:', result.error);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    createCheckoutSession();
  }, [userId, email]);

  return (
    <div className={styles.content}>
      <h1>Redirecting to checkout...</h1>
      <p>Please wait while we prepare your checkout session.</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div className={styles.content}>
          <h1>Loading...</h1>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}