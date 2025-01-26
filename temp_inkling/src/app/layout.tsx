import { Inter } from "next/font/google";
import "./globals.css";
import Header from '../components/Header';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Inkling",
  description: "Your AI assistant for YouTube videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
} 