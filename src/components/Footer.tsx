'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SocialLinks from './SocialLinks';

export default function Footer() {
  const pathname = usePathname();
  const showTerms = pathname?.startsWith('/inkling');

  return (
    <footer>
      <div className="footer-content">
        <p>
          © {new Date().getFullYear()} Cameron Baughn{' '}
          {showTerms && (
            <span className="footer-links">
              • <Link href="/inkling/legal">Terms & Conditions</Link>
            </span>
          )}
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
} 