import Link from 'next/link';
import { ArrowRight, FileImage, FileVideo2, ShieldCheck } from 'lucide-react';

export default function BrowserToolPromo() {
  return (
    <section
      aria-labelledby="browser-tool-heading"
      className="-mx-5 border-b border-gray-800 bg-gradient-to-r from-[#E91E8C]/8 via-gray-950/80 to-[#4fd1c5]/8 px-5 py-10 sm:-mx-8 sm:px-8"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4fd1c5]">Free browser tools</p>
        <h2 id="browser-tool-heading" className="mt-2 text-2xl font-bold text-white">
          Work with your own media files
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          Convert a video or make an existing GIF smaller. Both tools process the file locally in your browser.
        </p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-800 bg-gray-950/65 p-6 sm:p-8">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#4fd1c5]/30 bg-[#4fd1c5]/10">
              <FileVideo2 className="h-6 w-6 text-[#4fd1c5]" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Turn a video file into a GIF</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Convert an MP4, MOV, or WebM clip locally — trim, caption, and download with no watermark.
              </p>
            </div>
          </div>
          <Link
            href="/video-to-gif?entry=browser_tool_promo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-950 transition-colors hover:bg-gray-200"
          >
            Open video to GIF converter <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
        <article className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-800 bg-gray-950/65 p-6 sm:p-8">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#E91E8C]/30 bg-[#E91E8C]/10">
              <FileImage className="h-6 w-6 text-[#E91E8C]" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Make an existing GIF smaller</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Choose a target size, compare the measured result, and download the compressed GIF without an account.
              </p>
            </div>
          </div>
          <Link
            href="/gif-compressor"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E91E8C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#d51a80]"
          >
            Open GIF compressor <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </div>
      <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-500">
        <ShieldCheck className="h-4 w-4 text-[#4fd1c5]" /> Your source file stays in your browser
      </p>
    </section>
  );
}
