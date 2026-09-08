import type { Metadata } from 'next';
import ScreenRecorder from './ScreenRecorder';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'Screen to GIF Recorder — Free, Local, No Watermark | YTgify',
  description:
    'Record a tab, window, or screen and turn it into an animated GIF in your browser. Trim your clip and download locally without an account.',
  alternates: { canonical: 'https://ytgify.com/screen-to-gif' },
};
export default function Page() {
  return (
    <>
      <ScreenRecorder />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Record Your Screen to GIF',
            url: 'https://ytgify.com/screen-to-gif',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Desktop web browser',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <SiteFooter />
    </>
  );
}
