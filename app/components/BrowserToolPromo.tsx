import Link from 'next/link';
import { ArrowRight, FileVideo2, ShieldCheck } from 'lucide-react';

export default function BrowserToolPromo() {
  return (
    <section
      aria-labelledby="browser-tool-heading"
      className="-mx-5 border-b border-gray-800 bg-gradient-to-r from-[#E91E8C]/8 via-gray-950/80 to-[#4fd1c5]/8 px-5 py-10 sm:-mx-8 sm:px-8"
    >
      <div className="flex flex-col gap-6 rounded-2xl border border-gray-800 bg-gray-950/65 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#4fd1c5]/30 bg-[#4fd1c5]/10">
            <FileVideo2 className="h-6 w-6 text-[#4fd1c5]" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4fd1c5]">Free browser tool</p>
            <h2 id="browser-tool-heading" className="mt-2 text-2xl font-bold text-white">
              Already have a video file?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Convert your own MP4, MOV, or WebM clip to a GIF locally — trim, caption, and download with no watermark.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-500">
              <ShieldCheck className="h-4 w-4 text-[#4fd1c5]" /> Your source video stays in your browser
            </p>
          </div>
        </div>
        <Link
          href="/video-to-gif"
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-950 transition-colors hover:bg-gray-200"
        >
          Open video to GIF converter <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
