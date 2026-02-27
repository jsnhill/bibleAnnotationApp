import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bible Study Group',
  description: 'Collaborative Bible reading and commentary',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
