import Link from 'next/link';

export default function HomeNavLinks() {
  return (
    <div className="hidden items-center gap-x-5 text-sm font-semibold text-gray-400 md:flex">
      <a href="#demo" className="transition-colors hover:text-white">
        Demo
      </a>
      <a href="#install" className="transition-colors hover:text-white">
        Install
      </a>
      <Link href="/blog" className="transition-colors hover:text-white">
        Guides
      </Link>
      <Link href="/video-to-gif" className="transition-colors hover:text-white">
        Video file to GIF
      </Link>
      <a href="#also-by-jeremy" className="transition-colors hover:text-white">
        Builder
      </a>
    </div>
  );
}
