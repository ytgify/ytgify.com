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
    <div className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_12%_12%,rgba(233,30,140,0.2),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(79,209,197,0.16),transparent_28%),linear-gradient(180deg,rgba(118,75,162,0.12),transparent_70%)]"
      />
      <div aria-hidden="true" className="grid-pattern pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur sm:px-5">
          <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff0066] to-[#764ba2] shadow-[0_0_24px_rgba(233,30,140,0.35)]">
              Y
            </span>
            YTgify
          </Link>
          <Link
            href="/video-to-gif"
            className="rounded-full border border-[#9ff3ea]/30 bg-[#9ff3ea]/10 px-4 py-2 text-sm font-semibold text-[#9ff3ea] transition-colors hover:border-[#9ff3ea]/70 hover:bg-[#9ff3ea]/15"
          >
            Convert a video instead →
          </Link>
        </header>
        <main data-ph-no-capture className="pb-10 pt-14 sm:pt-20">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#9ff3ea]/25 bg-[#9ff3ea]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#9ff3ea]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9ff3ea] shadow-[0_0_10px_#9ff3ea]" />
              Free · Private · Browser based
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.05em] sm:text-7xl">
              Make your GIF{' '}
              <span className="bg-gradient-to-r from-[#ff4f9a] via-[#d66cff] to-[#9ff3ea] bg-clip-text text-transparent">
                lighter.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl">{content.description}</p>
            <ul className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-gray-200" aria-label="Tool benefits">
              {['No uploads', 'Measured results', 'No watermark'].map((benefit) => (
                <li key={benefit} className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
                  <span className="mr-2 text-[#9ff3ea]">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <GifToolApp tool={tool} />
        </main>
        <section className="border-t border-white/10 py-12" aria-label="How it works">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff4f9a]">Three simple steps</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">From oversized to shareable</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {content.steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-gray-300">
                <span className="mb-8 grid h-9 w-9 place-items-center rounded-full border border-[#ff4f9a]/40 bg-[#ff4f9a]/10 text-sm font-black text-[#ff8abe]">
                  {index + 1}
                </span>
                <span className="leading-7">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-6 rounded-3xl border border-[#9ff3ea]/15 bg-[#9ff3ea]/[0.045] p-6 lg:grid-cols-[0.7fr_1.3fr] lg:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9ff3ea]">Local by design</p>
              <h2 className="mt-3 text-2xl font-black">Private, with clear limits</h2>
            </div>
            <div className="space-y-3 leading-7 text-gray-300">
              <p>
                Your GIF stays on your device. No account or installation is required. Files up to 10 MB are fully
                supported. Larger GIFs are attempted on a best-effort basis, with a stronger warning above 25 MB.
              </p>
              <p>
                YTgify stops when dimensions, frame count, estimated working memory, or processing time could put your
                browser at risk. Mobile browsers may reach those limits sooner.
              </p>
              <p>
                Very short or missing frame delays are normalized to 100 milliseconds and reported before export. The
                measured result always takes priority over a promised target.
              </p>
            </div>
          </div>
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
