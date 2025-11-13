import { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This layout is required by Next.js but next-intl
  // uses [locale]/layout.tsx for actual rendering
  return children;
}
