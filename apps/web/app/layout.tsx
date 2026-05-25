import type { Metadata } from 'next';

import { Providers } from '../components/providers';
import './globals.css';

export const metadata: Metadata = {
  description: 'Self-service Minecraft server hosting dashboard.',
  title: 'SpawnCtl',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
