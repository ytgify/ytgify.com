import Link from 'next/link';
import type { FAQItem } from '@/lib/schema';
import { VideoToGifExample } from './VideoToGifExample';

type HelpItem = FAQItem & { link?: { href: string; label: string } };

const helpItems: HelpItem[] = [
  {
    question: 'Why won’t my video open?',
    answer: 'Browser codec support varies. Try an H.264 MP4 or WebM file.',
  },
  {
    question: 'How can I make the GIF smaller?',
    answer:
      'Trim the clip, lower the frame rate or resolution, or choose a 5, 10, or 25 MB size target. The target is an estimate. YTgify blocks exports that would use too much browser memory.',
    link: { href: '/gif-compressor', label: 'Compress an existing GIF' },
  },
  {
    question: 'Does YTgify upload my video?',
    answer:
      'Your video and captions stay in your browser. Analytics excludes filenames, caption text, object URLs, and media bytes.',
  },
  {
    question: 'Can I paste a YouTube URL?',
    answer: 'This converter takes video files from your device. To clip directly inside YouTube,',
    link: { href: '/#install', label: 'use the desktop Chrome extension' },
  },
];

export const videoToGifFAQs: FAQItem[] = helpItems.map(({ question, answer, link }) => ({
  question,
  answer: link ? `${answer} ${link.label}.` : answer,
}));

export function VideoToGifGuide() {
  return (
    <article className="border-t border-gray-800 bg-[#0d1117]/92 text-gray-300">
      <div className="mx-auto max-w-[920px] space-y-8 px-5 py-10 sm:space-y-10 sm:px-8 sm:py-14">
        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-bold text-white sm:text-3xl">
            How to make a GIF
          </h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-gray-300 marker:text-gray-400">
            <li>Choose a video from your device.</li>
            <li>Trim the moment you want. Add a caption if you like.</li>
            <li>
              Select <strong className="font-semibold text-white">Create GIF</strong>, then preview and download.
            </li>
          </ol>
          <nav
            aria-label="Converter guide"
            className="mt-2 flex flex-wrap gap-x-5 text-sm font-semibold text-[#4fd1c5]"
          >
            <a href="#mp4-to-gif-example" className="inline-flex min-h-11 items-center underline hover:text-white">
              Example
            </a>
            <a href="#formats-and-limits" className="inline-flex min-h-11 items-center underline hover:text-white">
              Formats &amp; limits
            </a>
            <a href="#video-gif-faq" className="inline-flex min-h-11 items-center underline hover:text-white">
              Help
            </a>
          </nav>
        </section>

        <VideoToGifExample />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <section aria-labelledby="formats-and-limits">
            <h2 id="formats-and-limits" className="text-xl font-bold text-white sm:text-2xl">
              Formats &amp; limits
            </h2>
            <dl className="mt-3 divide-y divide-gray-800 border-y border-gray-800 text-sm leading-6">
              <div className="grid grid-cols-[3rem_1fr] gap-2 py-2">
                <dt className="font-semibold text-white">Video</dt>
                <dd>MP4, MOV, or WebM. Up to 250 MB and 30 minutes.</dd>
              </div>
              <div className="grid grid-cols-[3rem_1fr] gap-2 py-2">
                <dt className="font-semibold text-white">GIF</dt>
                <dd>Up to 10 seconds. 5, 10, or 15 FPS at 240p, 360p, or 480p.</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="video-gif-faq">
            <h2 id="video-gif-faq" className="text-xl font-bold text-white sm:text-2xl">
              Help
            </h2>
            <div className="mt-3 divide-y divide-gray-800 border-y border-gray-800">
              {helpItems.map(({ question, answer, link }) => (
                <details key={question}>
                  <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold leading-5 text-gray-200 marker:text-[#4fd1c5] focus-visible:outline-2 focus-visible:outline-[#4fd1c5]">
                    {question}
                  </summary>
                  <p className="pb-3 pl-4 text-sm leading-6 text-gray-400">
                    {answer}
                    {link ? (
                      <>
                        {' '}
                        <Link href={link.href} className="text-[#4fd1c5] underline hover:text-white">
                          {link.label}
                        </Link>
                        .
                      </>
                    ) : null}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
