import Link from 'next/link';

export default function Navigation() {
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
