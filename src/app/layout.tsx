import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import SocialLinks from '@/components/SocialLinks';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cameron Baughn",
  description: "Cameron Baughn's personal site",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✌️</text></svg>",
        sizes: "any",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <header>
          <nav>
            <Link href="/" className="site-title">
              Cameron Baughn
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <div className="footer-content">
            <p>
              © {new Date().getFullYear()} Cameron Baughn{' '}
              <span className="footer-links">
                • <Link href="/inkling/legal">Terms & Conditions</Link>
              </span>
            </p>
            <SocialLinks />
          </div>
        </footer>
      </body>
    </html>
  );
}
