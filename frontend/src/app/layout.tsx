import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FarmerProvider } from '@/context/FarmerContext';
import { MobileFrame } from '@/components/layout/MobileFrame';

export const metadata: Metadata = {
  title: 'KshetraOne (क्षेत्रवन) — One Ecosystem. Every Farm. Every Day.',
  description: 'AI-powered AgriTech + DairyTech + Rural Livelihood Platform for Indian Farmers',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0F3822',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F7FAF8] sm:bg-stone-900 text-stone-900">
        <FarmerProvider>
          <MobileFrame>
            {children}
          </MobileFrame>
        </FarmerProvider>
      </body>
    </html>
  );
}
