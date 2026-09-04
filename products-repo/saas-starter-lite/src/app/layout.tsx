import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'SaaS Starter Lite — Next.js 14 & Supabase Boilerplate',
    template: '%s | SaaS Starter Lite',
  },
  description: 'Production-ready SaaS starter kit with Next.js 14 App Router, Supabase Auth, Tailwind CSS, and protected metrics dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
