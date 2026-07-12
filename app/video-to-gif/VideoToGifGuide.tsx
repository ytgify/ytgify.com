import Link from 'next/link';
import { CheckCircle2, FileVideo2, LockKeyhole, SlidersHorizontal } from 'lucide-react';
import type { FAQItem } from '@/lib/schema';

export const videoToGifFAQs: FAQItem[] = [
  {
    question: 'How do I convert a video to a GIF?',
    answer:
      'Choose a local video, select a clip up to 10 seconds, pick the resolution and frame rate, add optional top or bottom text, then create and download the GIF.',
  },
  {
    question: 'Does YTgify upload my video?',
    answer:
      'No. The converter reads and processes the source video locally in your browser. YTgify analytics use coarse workflow details and do not include the video file name, caption text, object URL, or media bytes.',
  },
  {
    question: 'Which video formats can I turn into a GIF?',
    answer:
      'YTgify accepts MP4, MOV, and WebM files that your browser can decode. Codec support differs by browser, so an H.264 MP4 or WebM export is the most practical fallback if a file will not open.',
  },
  {
    question: 'What are the free converter limits?',
    answer:
      'Source files can be up to 250 MB and 5 minutes long. Each GIF can use up to 10 seconds at 5, 10, or 15 FPS and a maximum output height of 240p, 360p, or 480p.',
  },
  {
    question: 'Why are some large GIF settings unavailable?',
    answer:
      'Video frames require substantial browser memory. YTgify estimates the raw frame working set and asks you to reduce duration, frame rate, or resolution when a combination exceeds its reliability budget.',
  },
  {
    question: 'Can I paste a YouTube URL into this converter?',
    answer:
      'No. This tool is for video files you own or have permission to edit. To create GIFs inside YouTube, use the YTgify browser extension instead.',
  },
];

const steps = [
  { icon: FileVideo2, title: '1. Choose your video', detail: 'Select a browser-decodable MP4, MOV, or WebM file.' },
  {
    icon: SlidersHorizontal,
    title: '2. Edit the moment',
    detail: 'Trim up to 10 seconds, tune FPS and size, and add text.',
  },
  {
    icon: CheckCircle2,
    title: '3. Export the GIF',
    detail: 'Preview the animated result and download it with no watermark.',
  },
];

export function VideoToGifGuide() {
  return (
    <article className="border-t border-gray-800 bg-[#0d1117]/92 text-gray-300">
      <div className="mx-auto max-w-[920px] space-y-16 px-5 py-16 sm:px-8 sm:py-20">
        <section aria-labelledby="how-it-works">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#E91E8C]">How it works</p>
          <h2 id="how-it-works" className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Convert video to GIF in three steps
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-gray-400">
            YTgify is a focused, free converter for short reactions, product demos, tutorials, and clips you are allowed
            to edit. The source stays in the browser from selection through download.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="rounded-xl border border-gray-800 bg-gray-950/55 p-5">
                <Icon className="h-6 w-6 text-[#4fd1c5]" />
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="privacy-and-support" className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#4fd1c5]/25 bg-[#4fd1c5]/5 p-6 sm:p-8">
            <LockKeyhole className="h-7 w-7 text-[#4fd1c5]" />
            <h2 id="privacy-and-support" className="mt-4 text-2xl font-bold text-white">
              Private by design
            </h2>
            <p className="mt-3 leading-7 text-gray-400">
              The browser creates a local object URL, reads frames into canvas, encodes the GIF, and gives you a local
              download. YTgify does not send your source media, filename, or captions to a media-processing server.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950/55 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Formats and practical limits</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
              <li>MP4, MOV, or WebM that the current browser can decode</li>
              <li>250 MB and 5 minute source limits</li>
              <li>10 second GIFs at 5, 10, or 15 FPS</li>
              <li>240p, 360p, or 480p maximum output height</li>
              <li>Automatic memory guard for large combinations</li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="video-gif-faq">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#E91E8C]">Video to GIF FAQ</p>
          <h2 id="video-gif-faq" className="mt-3 text-3xl font-bold text-white">
            Common questions, clear answers
          </h2>
          <div className="mt-8 divide-y divide-gray-800 rounded-2xl border border-gray-800 bg-gray-950/45 px-5 sm:px-7">
            {videoToGifFAQs.map((item) => (
              <section key={item.question} className="py-6">
                <h3 className="font-bold text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-400">{item.answer}</p>
              </section>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-[#E91E8C]/30 bg-[#E91E8C]/8 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Making a GIF from YouTube?</h2>
            <p className="mt-2 max-w-2xl leading-7 text-gray-400">
              Use the YTgify Chrome extension to choose the moment directly inside the YouTube player.
            </p>
          </div>
          <Link
            href="/#install"
            className="mt-5 inline-flex flex-shrink-0 items-center justify-center rounded-xl bg-[#E91E8C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#d51a80] sm:mt-0"
          >
            View the extension
          </Link>
        </aside>
      </div>
    </article>
  );
}
