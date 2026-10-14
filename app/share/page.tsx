import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video to GIF Converter - YTgify',
  description: 'Create GIFs locally in your browser with the YTgify video-to-GIF converter.',
  alternates: { canonical: '/video-to-gif' },
  robots: { index: false, follow: true },
};

export default function SharePage() {
  return (
    <>
      {/* GitHub Pages serves static HTML, so this redirect also works without JavaScript. */}
      <meta httpEquiv="refresh" content="0;url=/video-to-gif" />
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 text-white">
        <p>
          Taking you to the{' '}
          <a href="/video-to-gif" className="underline">
            video-to-GIF converter
          </a>
          .
        </p>
      </main>
    </>
  );
}
