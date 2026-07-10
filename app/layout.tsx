import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: "video to gif, mp4 to gif, gif maker no watermark, private video to gif, youtube to gif, youtube to gif converter, ytgify, Jeremy Watt, neonwatty",
  authors: [{ name: "Jeremy Watt" }],
  creator: "Jeremy Watt",
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_TITLE,
    description: "Install the YTgify Chrome extension manually and create no-watermark GIFs from YouTube videos right inside the player.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "YTgify - Free YouTube to GIF Converter - No Watermark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YTgify - Free YouTube to GIF Chrome Extension",
    description: "Install YTgify manually in Chrome and create no-watermark GIFs from YouTube videos.",
    images: [`${SITE_URL}/twitter-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": SITE_NAME,
    "url": SITE_URL,
    "description": SITE_DESCRIPTION,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Chrome, Firefox",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Convert local videos to GIF",
      "Browser-only media processing",
      "No-watermark GIF export",
      "Manual Chrome extension install",
      "Convert YouTube videos to GIF",
      "Custom text overlay",
      "FPS control",
      "Multiple resolutions",
      "MP4 to GIF conversion"
    ],
    "screenshot": `${SITE_URL}/og-image.png`,
    "creator": {
      "@type": "Person",
      "name": "Jeremy Watt"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
