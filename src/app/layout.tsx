import type { Metadata } from "next";
import { Permanent_Marker, DM_Sans } from "next/font/google";
import { Suspense } from "react";
import CheckoutSyncClient from "./components/CheckoutSyncClient";
import "./globals.css";

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-marker",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Frathouse Picasso",
  description: "Frathouse Picasso",
  icons: {
    icon: [
      { url: '/Favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/Favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/Favicons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/Favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/Favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', rel: 'icon' },
      { url: '/Favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', rel: 'icon' },
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
      <body
        className={`${permanentMarker.variable} ${dmSans.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <CheckoutSyncClient />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
