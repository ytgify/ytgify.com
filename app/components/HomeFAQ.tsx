import type { FAQItem } from '@/lib/schema';

export const homeFAQItems: FAQItem[] = [
  {
    question: 'How do I turn a YouTube video into a GIF?',
    answer: 'Install YTgify in Chrome, open a YouTube video, choose the moment you want, set the GIF length and quality, then export and download the GIF. The workflow stays in your browser.',
  },
  {
    question: 'Is YTgify free to use?',
    answer: 'Yes. YTgify is free and open source. It does not add a watermark or require an account.',
  },
  {
    question: 'Does YTgify upload my video?',
    answer: 'No. GIF creation happens locally in your browser, so YTgify does not upload the video or finished GIF to a conversion server.',
  },
  {
    question: 'Can I add text and change GIF quality?',
    answer: 'Yes. You can add a text overlay and adjust the frame rate, resolution, and clip timing before exporting.',
  },
  {
    question: 'Why does YTgify require a manual Chrome install?',
    answer: 'The current Chrome release is distributed as a ZIP. After extracting it, enable Developer mode on the Chrome extensions page and load the extracted folder as an unpacked extension.',
  },
];

export default function HomeFAQ() {
  return (
    <section aria-labelledby="faq-heading" className="-mx-5 border-b border-gray-800 bg-[#0d1117]/85 px-5 py-12 sm:-mx-8 sm:px-8 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#E91E8C]">YouTube to GIF FAQ</p>
        <h2 id="faq-heading" className="text-3xl font-bold text-white">Common questions, answered</h2>
        <p className="mt-4 leading-relaxed text-gray-400">The short version of how YTgify works, what it costs, and what happens to your video.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {homeFAQItems.map((item) => (
          <details key={item.question} className="group border border-gray-800 bg-gray-950/50 p-5 open:border-[#E91E8C]/40">
            <summary className="cursor-pointer list-none pr-6 font-semibold text-white marker:hidden">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
