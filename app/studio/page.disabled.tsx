import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';
import StudioApp from './StudioApp';

// Temporarily disabled for launch. Rename this file back to page.tsx when Studio is ready.
export const metadata: Metadata = {
  title: 'Video to GIF Studio - No Upload, No Watermark | YTgify',
  description:
    'Turn your own local videos into clean GIFs. Upload a clip, trim the moment, add captions, and export a no-watermark GIF directly in your browser.',
  keywords:
    'video to GIF converter, MP4 to GIF converter, GIF maker no watermark, private video to GIF, add captions to GIF',
  alternates: {
    canonical: `${SITE_URL}/studio`,
  },
  openGraph: {
    title: 'Video to GIF Studio - No Upload, No Watermark',
    description:
      'Upload your own local video, trim a short moment, add captions, and export a GIF directly in your browser.',
    url: `${SITE_URL}/studio`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video to GIF Studio - No Upload, No Watermark',
    description: 'Create no-watermark GIFs from your own local clips directly in the browser.',
  },
};

export default function StudioPage() {
  return <StudioApp />;
}
