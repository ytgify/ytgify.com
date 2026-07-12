'use client';

import Logo from './Logo';
import DemoVideo from './DemoVideo';
import SiteFooter from './SiteFooter';
import { CHROME_EXTENSION_URL } from '@/lib/constants';
import { ExtensionFunnelView, TrackedExtensionLink } from './ExtensionAnalytics';

const quickTips = [
  'Look for the pink GIF button below any YouTube video',
  'Drag to select the exact clip you want (max 10 seconds)',
  'Add custom text overlay for memes',
  'No watermark, ever',
];

export default function DesktopWelcome() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-pattern">
      <main>
        <article className="max-w-[800px] mx-auto px-12 sm:px-6 pt-12 pb-16">
          <ExtensionFunnelView
            surface="welcome_desktop"
            funnelStep="extension_installed"
            eventName="extension_install_confirmed"
          />
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Logo />
            <h2 className="text-4xl sm:text-5xl font-bold text-white">YTgify</h2>
          </div>

          {/* Success Message */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E91E8C]/20 to-[#7B2FBE]/20 border-2 border-[#E91E8C]/50 mb-6">
              <svg
                className="w-10 h-10 text-[#E91E8C]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">You&apos;re all set!</h1>
            <p className="text-lg text-gray-400">
              YTgify is now installed and ready to create GIFs from any YouTube video.
            </p>
          </div>

          {/* Demo Video Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">See how it works</h2>
            <DemoVideo />
          </div>

          {/* Where to Find It */}
          <div className="mb-10 py-6 px-6 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E91E8C]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#E91E8C]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Where to find it</h3>
                <p className="text-gray-400">
                  Look for the <span className="text-[#E91E8C] font-semibold">pink GIF button</span> below any YouTube
                  video, right next to the like/dislike buttons. Click it to open the GIF creator.
                </p>
              </div>
            </div>
          </div>

          {/* Try It Now CTA */}
          <div className="text-center mb-10">
            <TrackedExtensionLink
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              surface="welcome_desktop"
              cta="try_on_youtube"
              eventName="extension_activation_clicked"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E91E8C] to-[#7B2FBE] text-white font-bold text-lg rounded-full hover:opacity-90 transition-opacity shadow-lg"
            >
              Try it now on YouTube
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </TrackedExtensionLink>
          </div>

          {/* Quick Tips */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Quick tips</h2>
            <div className="space-y-3">
              {quickTips.map((tip) => (
                <div key={tip} className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    className="text-[#E91E8C] flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating CTA */}
          <div className="text-center py-8 px-6 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
            <div className="text-3xl mb-3">
              <span role="img" aria-label="stars">
                ⭐⭐⭐⭐⭐
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enjoying YTgify?</h3>
            <p className="text-gray-400 mb-4">
              A quick review helps others discover the extension and keeps development going!
            </p>
            <TrackedExtensionLink
              href={`${CHROME_EXTENSION_URL}/reviews`}
              target="_blank"
              rel="noopener noreferrer"
              surface="welcome_desktop"
              cta="leave_review"
              eventName="extension_review_clicked"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-semibold rounded-full hover:bg-yellow-500/30 transition-colors"
            >
              Leave a review
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </TrackedExtensionLink>
          </div>
        </article>

        <SiteFooter />
      </main>
    </div>
  );
}
