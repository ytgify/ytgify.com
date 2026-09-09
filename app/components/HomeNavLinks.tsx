import Link from 'next/link';

export default function HomeNavLinks() {
  return (
    <div className="flex items-center gap-x-5 text-sm font-semibold text-gray-400">
      <a href="#demo" className="hidden transition-colors hover:text-white md:block">
        Demo
      </a>
      <a href="#install" className="hidden transition-colors hover:text-white md:block">
        Install
      </a>
      <Link href="/blog" className="hidden transition-colors hover:text-white md:block">
        Guides
      </Link>
      <Link href="/video-to-gif?entry=home_nav" className="hidden transition-colors hover:text-white md:block">
        Video file to GIF
      </Link>
      <Link href="/about" className="transition-colors hover:text-white">
        About
      </Link>
    </div>
  );
}
