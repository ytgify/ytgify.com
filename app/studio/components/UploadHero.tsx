import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

const benefits = [
  { icon: ShieldCheck, title: 'Stays on your device', detail: 'Your source video is never uploaded' },
  { icon: Sparkles, title: 'No watermark', detail: 'Clean GIFs you can use anywhere' },
  { icon: Zap, title: 'Smart defaults', detail: 'Great output without codec guesswork' },
];

export function UploadHero() {
  return (
    <div>
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4fd1c5]/30 bg-[#4fd1c5]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#9ff3ea]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Private, local processing
      </div>
      <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
        Free Video to GIF Converter
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
        Turn a clip you own into a crisp, share-ready GIF. Trim the moment, add an optional caption, and download it —
        all without sending your video to a server.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        {benefits.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="rounded-xl border border-gray-800/90 bg-gray-950/70 p-3 sm:p-4">
            <Icon className="h-5 w-5 text-[#4fd1c5]" />
            <p className="mt-3 text-xs font-bold leading-5 text-white sm:text-sm">{title}</p>
            <p className="mt-1 hidden text-xs leading-5 text-gray-500 sm:block">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
