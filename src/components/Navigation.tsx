'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isQuizPage = pathname?.startsWith('/forge/quizzes');

  if (isQuizPage) {
    return null;
  }

  return (
    <header>
      <nav>
        <Link href="/" className="site-title">
          Cameron Baughn
        </Link>
      </nav>
    </header>
  );
} 