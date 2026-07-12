import Link from 'next/link';
import Logo from './components/Logo';
import HeroDescription from './components/HeroDescription';
import FeatureChecklist from './components/FeatureChecklist';
import DemoVideo from './components/DemoVideo';
import ExampleGifsGallery from './components/ExampleGifsGallery';
import SiteFooter from './components/SiteFooter';
import { LegacyInstallSection } from './components/DiscontinuationNotice';
import CreatorBrandSection from './components/CreatorBrandSection';
import HomeFAQ, { homeFAQItems } from './components/HomeFAQ';
import {
  BookOpen,
  ChevronDown,
  Download,
  Github,
  MessageSquareText,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Timer,
} from 'lucide-react';
import { ExtensionFunnelView, TrackedExtensionLink } from './components/ExtensionAnalytics';
import { CHROME_EXTENSION_VERSION } from '@/lib/extensionAnalytics';
import { GITHUB_REPO_URL } from '@/lib/constants';
import { generateFAQSchema } from '@/lib/schema';

const heroProofPoints = [
  { label: 'No watermark', value: 'Clean GIF export' },
  { label: 'In YouTube', value: 'Clip from the player' },
  { label: 'Local install', value: 'Chrome ZIP, about 330 KB' },
];

const demoWorkflow = [
  {
    title: 'Pick the moment',
    description: 'Use the player controls to frame the exact YouTube moment.',
    icon: Timer,
  },
  {
    title: 'Tune the output',
    description: 'Choose FPS, resolution, and clip length for the share target.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Add context',
    description: 'Drop in text overlays before export when the moment needs a caption.',
    icon: MessageSquareText,
  },
  {
    title: 'Share the GIF',
    description: 'Export a no-watermark GIF without uploading your clip elsewhere.',
    icon: Share2,
  },
];

const guideLinks = [
  {
    href: '/blog/how-to-create-gif-from-youtube-video',
    title: 'Create a GIF step by step',
    description: 'Install v1.0.19, select a YouTube moment, tune it, and save the result.',
  },
  {
    href: '/blog/best-gif-settings-for-social-media',
    title: 'Choose resolution, FPS, and length',
    description: 'Use practical starting points for smaller files, smoother motion, or clearer detail.',
  },
  {
    href: '/blog/youtube-to-gif-free-no-watermark',
    title: 'Understand local, no-watermark processing',
    description: 'See what stays on your device and which current product limits apply.',
  },
];

export default function Home() {
  const faqSchema = generateFAQSchema(homeFAQItems);

  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-pattern">
      <script
        type="application/ld+json"
        data-schema="faq"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main>
        <article className="max-w-[1080px] mx-auto px-5 sm:px-8 pb-16">
          <ExtensionFunnelView surface="home_hero" funnelStep="landing_page_viewed" />
          <nav
            aria-label="Page sections"
            className="sticky top-0 z-50 -mx-5 border-b border-gray-800 bg-[#0a0a0a]/88 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8"
          >
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 text-white" aria-label="YTgify home">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E91E8C]/35 bg-[#E91E8C]/10">
                  <Sparkles className="h-4 w-4 text-[#E91E8C]" />
                </span>
                <span className="font-bold tracking-tight">YTgify</span>
              </Link>
              <div className="hidden items-center gap-x-5 text-sm font-semibold text-gray-400 md:flex">
                <a href="#demo" className="hover:text-white transition-colors">
                  Demo
                </a>
                <a href="#install" className="hover:text-white transition-colors">
                  Install
                </a>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Guides
                </Link>
                <a href="#also-by-jeremy" className="hover:text-white transition-colors">
                  Builder
                </a>
              </div>
              <TrackedExtensionLink
                href="#install"
                surface="home_sticky_nav"
                cta="jump_to_install_section"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E91E8C] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#d51a80] sm:px-4"
              >
                <Download className="h-4 w-4" />
                <span>Install</span>
              </TrackedExtensionLink>
            </div>
          </nav>

          <section className="relative -mx-5 flex min-h-[calc(100svh-3.5rem)] flex-col justify-center border-b border-gray-800 bg-gray-950/75 px-5 py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:-mx-8 sm:px-8 sm:py-14 lg:min-h-[calc(100svh-3.75rem)] lg:py-16">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <Logo />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E91E8C]">
                      Open-source Chrome extension
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold text-white leading-none mt-2">YTgify</p>
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.02] text-white tracking-tight">
                  YouTube to GIF Converter - Free, No Watermark
                </h1>

                <div className="max-w-2xl mb-8">
                  <HeroDescription />
                </div>

                <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
                  {heroProofPoints.map((point) => (
                    <div key={point.label} className="border border-gray-800 bg-gray-900/35 p-2.5 sm:p-3">
                      <p className="text-xs font-semibold text-white sm:text-sm">{point.label}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-gray-400 sm:text-xs">{point.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                  <TrackedExtensionLink
                    href="#install"
                    surface="home_hero"
                    cta="jump_to_install_section"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d51a80] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Install Chrome Extension
                  </TrackedExtensionLink>
                  <TrackedExtensionLink
                    href="#install"
                    surface="home_hero"
                    cta="jump_to_install_section"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950/70 px-5 py-3 text-sm font-semibold text-white hover:border-[#E91E8C]/70 hover:bg-gray-900 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    View install walkthrough
                  </TrackedExtensionLink>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Download v{CHROME_EXTENSION_VERSION}. Manual installs update when you load a newer ZIP.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950/80 p-4 shadow-2xl sm:p-5">
                <ExampleGifsGallery />
                <div className="mt-5 border-t border-gray-800 pt-4">
                  <p className="text-sm font-semibold text-white">Manual install, real YouTube workflow.</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Download v{CHROME_EXTENSION_VERSION}, load it in Chrome, then clip GIFs without leaving the video.
                  </p>
                </div>
              </div>
            </div>
            <a
              href="#demo"
              className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 transition-colors hover:text-white lg:inline-flex"
            >
              See it in action
              <ChevronDown className="h-4 w-4" />
            </a>
          </section>

          <section
            id="demo"
            className="-mx-5 flex scroll-mt-24 flex-col justify-center border-b border-gray-800 bg-[#0d1117]/85 px-5 py-12 sm:-mx-8 sm:px-8 sm:py-14 lg:min-h-[92svh] lg:py-16"
          >
            <div className="mb-8 border-b border-gray-800 pb-6">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#E91E8C]">
                See YTgify in live action
              </p>
              <h2 className="text-3xl font-bold text-white">See it in action</h2>
            </div>
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10">
              <div className="lg:sticky lg:top-8">
                <p className="mb-6 leading-relaxed text-gray-400">
                  YTgify adds lightweight controls directly inside YouTube, with GIF settings designed for fast sharing.
                </p>
                <FeatureChecklist />
                <div className="mt-8 grid gap-3">
                  {demoWorkflow.map((step) => {
                    const Icon = step.icon;

                    return (
                      <div key={step.title} className="flex gap-3 border border-gray-800 bg-gray-950/40 p-3">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#E91E8C]/30 bg-[#E91E8C]/10">
                          <Icon className="h-4 w-4 text-[#E91E8C]" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-white">{step.title}</span>
                          <span className="mt-1 block text-sm leading-relaxed text-gray-400">{step.description}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <DemoVideo />
                <div className="mt-6 border border-gray-800 bg-gray-900/40 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">Ready to add it to Chrome?</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-400">
                        Download the ZIP, load it unpacked, then make GIFs from the YouTube player.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <TrackedExtensionLink
                        href="#install"
                        surface="home_demo"
                        cta="jump_to_install_section"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80]"
                      >
                        <Download className="h-4 w-4" />
                        Install Chrome Extension
                      </TrackedExtensionLink>
                      <TrackedExtensionLink
                        href="#install"
                        surface="home_demo"
                        cta="jump_to_install_section"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950/70 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900"
                      >
                        <BookOpen className="h-4 w-4" />
                        View walkthrough
                      </TrackedExtensionLink>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-800 pt-4 text-xs font-semibold text-gray-500">
                    <span>Open source</span>
                    <a
                      href={GITHUB_REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 transition-colors hover:text-gray-300"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                    <a
                      href="https://neonwatty.com/posts/ytgify-launch/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 transition-colors hover:text-gray-300"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Build notes
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="install"
            className="-mx-5 flex scroll-mt-24 flex-col justify-center border-b border-gray-800 bg-gray-950/75 px-5 py-12 sm:-mx-8 sm:px-8 sm:py-14 lg:min-h-[86svh] lg:py-16"
          >
            <LegacyInstallSection />
          </section>

          <section
            aria-labelledby="guide-heading"
            className="-mx-5 border-b border-gray-800 bg-[#0d1117]/85 px-5 py-12 sm:-mx-8 sm:px-8 sm:py-14"
          >
            <div className="mb-8 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#E91E8C]">Verified guides</p>
              <h2 id="guide-heading" className="text-3xl font-bold text-white">
                Get a better GIF on the first export
              </h2>
              <p className="mt-3 leading-relaxed text-gray-400">
                These guides are checked against YTgify v{CHROME_EXTENSION_VERSION} and cover the workflow, settings
                tradeoffs, and local-processing boundary.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {guideLinks.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group border border-gray-800 bg-gray-950/45 p-5 transition-colors hover:border-[#E91E8C]/60"
                >
                  <h3 className="font-semibold text-white transition-colors group-hover:text-[#E91E8C]">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{guide.description}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-[#E91E8C]">Read guide →</span>
                </Link>
              ))}
            </div>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Browse all YouTube-to-GIF guides
            </Link>
          </section>

          <HomeFAQ />

          <CreatorBrandSection />
        </article>

        <SiteFooter />
      </main>
    </div>
  );
}
