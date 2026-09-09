import type { Metadata } from 'next';
import Link from 'next/link';
import CreatorBrandSection from '@/app/components/CreatorBrandSection';
import SiteFooter from '@/app/components/SiteFooter';
import { SITE_URL } from '@/lib/constants';

const title = 'About the Builder | YTgify';
const description =
  'Meet Jeremy Watt, the builder behind YTgify, and explore BugDrop, Meme Search, Lineage, and Debt Is Fun.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: { title, description, url: `${SITE_URL}/about`, type: 'website' },
  twitter: { title, description },
};

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-6 border-b border-gray-800 py-5 text-sm text-gray-400"
        >
          <Link href="/" className="mr-auto font-bold text-white">
            YTgify
          </Link>
          <Link href="/blog" className="hover:text-white">
            Guides
          </Link>
          <Link href="/about" aria-current="page" className="font-semibold text-white">
            About
          </Link>
        </nav>
        <main>
          <CreatorBrandSection />
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
