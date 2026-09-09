'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-VSY2S87253';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const privateTool = ['/gif-compressor'].includes(pathname.replace(/\/+$/, ''));
  useLayoutEffect(() => {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = privateTool;
  }, [privateTool]);
  if (privateTool) return null;
  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}
