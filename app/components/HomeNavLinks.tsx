import Link from 'next/link';
import ConverterLink from './ConverterLink';

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
      <ConverterLink entryPoint="home_nav" className="hidden transition-colors hover:text-white md:block">
        Video file to GIF
      </ConverterLink>
      <Link href="/about" className="transition-colors hover:text-white">
        About
      </Link>
    </div>
  );
}
