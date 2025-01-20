'use client';

import { useSearchParams } from 'next/navigation';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  return (
    <div className="container">
      <div className="card">
        <div className="content">
          <h1>
            {isSuccess ? 'Welcome to Inkling!' : 'Payment Cancelled'}
          </h1>
          <p className="message">
            {isSuccess 
              ? 'Your subscription has been activated successfully. You can now close this tab and return to YouTube to start using Inkling.'
              : 'Your payment was cancelled. You can try again by returning to YouTube and clicking the Inkling button.'}
          </p>
          <div className="support-text">
            Having issues? Contact support at{' '}
            <a href="mailto:cameron@forge.co" className="support-link">
              cameron@forge.co
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}