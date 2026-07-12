import { Metadata } from 'next';
import WelcomeContent from '../components/WelcomeContent';
import Script from 'next/script';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Welcome to ${SITE_NAME} - You're All Set!`,
  description: 'YTgify is now installed. Learn how to create your first GIF from any YouTube video in seconds.',
  robots: 'noindex, nofollow', // Don't index the welcome page
};

export default function WelcomePage() {
  return (
    <>
      {/* Google Ads Conversion Tracking */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-17812979843" strategy="afterInteractive" />
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17812979843');
        `}
      </Script>

      <WelcomeContent />
    </>
  );
}
