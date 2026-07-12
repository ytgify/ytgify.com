import type { Metadata } from 'next';
import SiteFooter from '@/app/components/SiteFooter';
import StudioApp from '@/app/studio/StudioApp';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { generateFAQSchema, generateVideoToGifSchema } from '@/lib/schema';
import { VideoToGifGuide, videoToGifFAQs } from './VideoToGifGuide';

const title = `Free Video to GIF Converter - Private, No Watermark | ${SITE_NAME}`;
const description =
  'Convert your own MP4, MOV, or WebM video to an animated GIF for free. Trim, caption, preview, and download locally in your browser with no watermark.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'video to GIF converter',
    'MP4 to GIF converter',
    'MOV to GIF',
    'WebM to GIF',
    'GIF maker no watermark',
    'private video to GIF',
  ],
  alternates: { canonical: `${SITE_URL}/video-to-gif` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title,
    description,
    url: `${SITE_URL}/video-to-gif`,
    siteName: SITE_NAME,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'YTgify video to GIF converter' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/twitter-image.png`] },
};

export default function VideoToGifPage() {
  const applicationSchema = generateVideoToGifSchema();
  const faqSchema = generateFAQSchema(videoToGifFAQs);

  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-pattern">
      <script
        type="application/ld+json"
        data-schema="video-to-gif-application"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
      />
      <script
        type="application/ld+json"
        data-schema="video-to-gif-faq"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <StudioApp />
      <VideoToGifGuide />
      <SiteFooter />
    </div>
  );
}
