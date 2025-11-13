import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PWA Training Management System',
  description: 'نظام متابعة برنامج التدريب - سلطة المياه الفلسطينية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
