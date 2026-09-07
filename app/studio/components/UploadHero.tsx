import { Sparkles } from 'lucide-react';

export function UploadHero() {
  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4fd1c5]/30 bg-[#4fd1c5]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#9ff3ea]">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Free · No watermark
      </div>
      <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
        Free Video to GIF Converter
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
        Trim a moment, add an optional caption, and download your GIF.
      </p>
    </div>
  );
}
