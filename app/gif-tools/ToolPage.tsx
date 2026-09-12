import Link from 'next/link';
import type { Metadata } from 'next';
import SiteFooter from '@/app/components/SiteFooter';
import { SITE_URL } from '@/lib/constants';
import GifToolApp from './GifToolApp';
import { gifTools, type GifTool } from './catalog';

export function toolMetadata(tool: GifTool): Metadata {
  const content = gifTools[tool];
  return {
    title: `${content.title} | YTgify`,
    description: content.description,
    alternates: { canonical: `${SITE_URL}/${tool}` },
    robots: { index: true, follow: true },
    openGraph: { title: content.title, description: content.description, url: `${SITE_URL}/${tool}`, type: 'website' },
  };
}

export default function ToolPage({ tool }: { tool: GifTool }) {
  const content = gifTools[tool];
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white grid-pattern">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <Link href="/" className="text-xl font-bold">
            YTgify
          </Link>
          <Link href="/video-to-gif" className="text-sm text-[#9ff3ea]">
            Video to GIF
          </Link>
        </header>
        <main data-ph-no-capture className="py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9ff3ea]">
            Free · Local processing · Experimental
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-gray-300">{content.description}</p>
          <GifToolApp tool={tool} />
        </main>
        <section className="border-t border-gray-800 py-8" aria-label="How it works">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-4 list-inside list-decimal space-y-3 text-gray-300">
            {content.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h2 className="mt-8 text-xl font-bold">Private, with clear limits</h2>
          <p className="mt-3 leading-7 text-gray-400">
            Your GIF stays on your device. No account or installation is required. Choose a GIF up to 25 MB, 600 frames,
            and a 60-second cycle. Detailed or large animations may reach the memory limit sooner. Mobile support is
            still being validated.
          </p>
          <p className="mt-3 leading-7 text-gray-400">
            Very short or missing frame delays are normalized to 100 milliseconds and reported before export.
            Compression never guarantees a target size; you will see the actual result.
          </p>
        </section>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: content.title,
            url: `${SITE_URL}/${tool}`,
            description: content.description,
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web browser',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <SiteFooter />
    </div>
  );
}
