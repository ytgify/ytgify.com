import Link from 'next/link';
import { FileVideo2 } from 'lucide-react';

export default function HeroConverterLink() {
  return (
    <Link
      href="/video-to-gif?entry=home_hero"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#4fd1c5]/50 bg-[#4fd1c5]/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#4fd1c5] hover:bg-[#4fd1c5]/20"
    >
      <FileVideo2 className="h-4 w-4 shrink-0" />
      <span>
        <span className="block">Convert video to GIF</span>
        <span className="mt-1 block text-xs font-normal text-gray-300">Free online tool · No installation</span>
      </span>
    </Link>
  );
}
