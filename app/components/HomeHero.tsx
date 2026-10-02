import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronDown, Download, FileVideo2, Monitor, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import HeroDescription from './HeroDescription';
import HeroConverterLink from './HeroConverterLink';
import ExampleGifsGallery from './ExampleGifsGallery';
import { TrackedExtensionLink } from './ExtensionAnalytics';
import { CHROME_EXTENSION_VERSION } from '@/lib/extensionAnalytics';

const proofPoints = [
  { label: 'No watermark', value: 'Clean GIF export' },
  { label: 'In YouTube', value: 'Clip from the player' },
  { label: 'Local install', value: 'Chrome ZIP, about 330 KB' },
];

export default function HomeHero() {
  return (
    <section className="relative -mx-5 flex flex-col justify-center border-b border-gray-800 bg-gray-950/75 px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:-mx-8 sm:min-h-[calc(100svh-3.5rem)] sm:px-8 sm:py-14 lg:min-h-[calc(100svh-3.75rem)] lg:py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <div>
          <div className="mb-3 sm:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4fd1c5]">Make it a GIF</p>
          </div>
          <div className="mb-8 hidden items-center gap-4 sm:flex">
            <Logo />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E91E8C]">
                Open-source Chrome extension
              </p>
              <p className="mt-2 text-4xl font-bold leading-none text-white sm:text-5xl">YTgify</p>
            </div>
          </div>

          <h1 className="mb-4 text-[2.1rem] font-bold leading-[1.06] tracking-tight text-white sm:mb-6 sm:text-5xl lg:text-6xl">
            YouTube to GIF Converter - Free, No Watermark
          </h1>
          <p className="mb-6 text-base leading-7 text-gray-300 sm:hidden">
            Make a GIF from a video on this device. For YouTube clips, YTgify works in desktop Chrome.
          </p>
          <div className="mb-8 hidden max-w-2xl sm:block">
            <HeroDescription />
          </div>

          <div className="space-y-3 sm:hidden">
            <div className="rounded-2xl border border-[#4fd1c5]/60 bg-[#4fd1c5]/10 p-4">
              <div className="flex items-start gap-3">
                <FileVideo2 className="mt-0.5 h-6 w-6 shrink-0 text-[#9ff3ea]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9ff3ea]">Your video</p>
                  <h2 className="mt-1 text-lg font-bold text-white">Turn your video into a GIF</h2>
                  <p className="mt-1 text-sm leading-5 text-gray-300">
                    Pick a video file, trim it, and download. No install.
                  </p>
                </div>
              </div>
              <Link
                href="/video-to-gif?entry=home_hero"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4fd1c5] px-4 py-3 text-sm font-bold text-gray-950 transition-colors hover:bg-[#9ff3ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Open free converter <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#9ff3ea]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Private · Free · No watermark
              </p>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-4">
              <div className="flex items-start gap-3">
                <Monitor className="mt-0.5 h-6 w-6 shrink-0 text-[#ff75bd]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ff75bd]">YouTube</p>
                  <h2 className="mt-1 text-lg font-bold text-white">Clip from YouTube</h2>
                  <p className="mt-1 text-sm leading-5 text-gray-400">
                    Use the extension inside Chrome on your computer.
                  </p>
                  <TrackedExtensionLink
                    href="#install"
                    surface="home_hero"
                    cta="jump_to_install_section"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline decoration-[#E91E8C] underline-offset-4"
                  >
                    See desktop setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </TrackedExtensionLink>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 hidden grid-cols-3 gap-2 sm:grid sm:gap-3">
            {proofPoints.map((point) => (
              <div key={point.label} className="border border-gray-800 bg-gray-900/35 p-2.5 sm:p-3">
                <p className="text-xs font-semibold text-white sm:text-sm">{point.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-400 sm:text-xs">{point.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-5 hidden flex-col gap-3 sm:flex sm:flex-row">
            <TrackedExtensionLink
              href="#install"
              surface="home_hero"
              cta="jump_to_install_section"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80]"
            >
              <Download className="h-4 w-4" /> Install Chrome Extension
            </TrackedExtensionLink>
            <TrackedExtensionLink
              href="#install"
              surface="home_hero"
              cta="jump_to_install_section"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950/70 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900"
            >
              <BookOpen className="h-4 w-4" /> View install walkthrough
            </TrackedExtensionLink>
            <HeroConverterLink />
          </div>
          <p className="mt-3 hidden text-xs text-gray-500 sm:block">
            Download v{CHROME_EXTENSION_VERSION}. Manual installs update when you load a newer ZIP.
          </p>
        </div>

        <div className="hidden rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950/80 p-4 shadow-2xl sm:block sm:p-5">
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
        See it in action <ChevronDown className="h-4 w-4" />
      </a>
    </section>
  );
}
