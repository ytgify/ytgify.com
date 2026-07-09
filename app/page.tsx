import Logo from './components/Logo';
import HeroDescription from './components/HeroDescription';
import FeatureChecklist from './components/FeatureChecklist';
import DemoVideo from './components/DemoVideo';
import ExampleGifsGallery from './components/ExampleGifsGallery';
import SiteFooter from './components/SiteFooter';
import DiscontinuationNotice, { LegacyInstallSection } from './components/DiscontinuationNotice';
import CreatorBrandSection from './components/CreatorBrandSection';
import { BookOpen, Github } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-pattern">
      <main>
        <article className="max-w-[1080px] mx-auto px-5 sm:px-8 pt-10 pb-16">
          <nav aria-label="Page sections" className="mb-10 flex justify-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-gray-400">
              <a href="#demo" className="hover:text-white transition-colors">Demo</a>
              <a href="#install" className="hover:text-white transition-colors">Install</a>
              <a href="#also-by-jeremy" className="hover:text-white transition-colors">Also by the Builder</a>
            </div>
          </nav>

          <section className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-14 items-center mb-10">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <Logo />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E91E8C]">Open-source Chrome extension</p>
                  <p className="text-4xl sm:text-5xl font-bold text-white leading-none mt-2">YTgify</p>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.02] text-white tracking-tight">
                YouTube to GIF Converter - Free, No Watermark
              </h1>

              <div className="max-w-2xl mb-8">
                <HeroDescription />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a
                  href="https://neonwatty.com/posts/ytgify-launch/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d51a80] transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Read the build notes
                </a>
                <a
                  href="https://github.com/neonwatty/ytgify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950/70 px-5 py-3 text-sm font-semibold text-white hover:border-[#E91E8C]/70 hover:bg-gray-900 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View the source
                </a>
              </div>

            </div>

            <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950/80 p-4 sm:p-5 shadow-2xl">
              <ExampleGifsGallery />
              <div className="mt-5 border-t border-gray-800 pt-4">
                <p className="text-sm font-semibold text-white">Open source and still usable locally.</p>
                <p className="text-sm text-gray-400 mt-1">
                  A small media utility that found real search demand, with public build notes, source code, and a local install.
                </p>
              </div>
            </div>
          </section>

          <DiscontinuationNotice />

          <section id="demo" className="scroll-mt-8 grid grid-cols-1 lg:grid-cols-[0.78fr_1.22fr] gap-8 lg:gap-10 items-start mb-16">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-3xl font-bold mb-4 text-white">See it in action</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                YTgify adds lightweight controls directly inside YouTube, with GIF settings designed for fast sharing.
              </p>
              <FeatureChecklist />
            </div>
            <div>
              <DemoVideo />
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/40 p-5">
                <p className="text-white font-semibold">Want the source and build story?</p>
                <a
                  href="https://github.com/neonwatty/ytgify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  Open the GitHub repo
                </a>
              </div>
            </div>
          </section>

          <div id="install" className="scroll-mt-8">
            <LegacyInstallSection />
          </div>

          <CreatorBrandSection />
        </article>

        <SiteFooter />
      </main>
    </div>
  );
}
