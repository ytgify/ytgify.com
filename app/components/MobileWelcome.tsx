'use client';

import { useState } from 'react';
import Logo from './Logo';
import DemoVideo from './DemoVideo';
import SiteFooter from './SiteFooter';
import EmailCaptureForm from './EmailCaptureForm';
import { MOBILE_REMINDER, MOBILE_REMINDER_EMAIL } from '@/lib/constants';
import { ExtensionFunnelView } from './ExtensionAnalytics';
import { trackExtensionEvent, trackExtensionException } from '@/lib/extensionAnalytics';

export default function MobileWelcome() {
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared'>('idle');
  const mailtoLink = `mailto:?subject=${MOBILE_REMINDER_EMAIL.subject}&body=${MOBILE_REMINDER_EMAIL.body}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: MOBILE_REMINDER.title,
          text: MOBILE_REMINDER.text,
          url: MOBILE_REMINDER.url,
        });
        setShareStatus('shared');
        trackExtensionEvent('mobile_install_reminder_shared', {
          surface: 'welcome_mobile',
          share_method: 'web_share',
        });
      } catch (err) {
        // User cancelled or share failed - fall back to mailto
        if ((err as Error).name !== 'AbortError') {
          trackExtensionException(err, {
            surface: 'welcome_mobile',
            workflow: 'mobile_install_reminder',
          });
          trackExtensionEvent('mobile_install_reminder_fallback_used', {
            surface: 'welcome_mobile',
            share_method: 'mailto',
          });
          window.location.href = mailtoLink;
        } else {
          trackExtensionEvent('mobile_install_reminder_cancelled', {
            surface: 'welcome_mobile',
          });
        }
      }
    } else {
      // Share API not supported - fall back to mailto
      trackExtensionEvent('mobile_install_reminder_fallback_used', {
        surface: 'welcome_mobile',
        share_method: 'mailto',
      });
      window.location.href = mailtoLink;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-pattern">
      <main>
        <article className="max-w-[800px] mx-auto px-6 pt-12 pb-16">
          <ExtensionFunnelView
            surface="welcome_mobile"
            funnelStep="mobile_reminder_viewed"
            eventName="mobile_install_reminder_viewed"
          />
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Logo />
            <h2 className="text-4xl font-bold text-white">YTgify</h2>
          </div>

          {/* Desktop Extension Message */}
          <div className="text-center mb-10">
            {/* Desktop Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E91E8C]/20 to-[#7B2FBE]/20 border-2 border-[#E91E8C]/50 mb-6">
              <svg className="w-10 h-10 text-[#E91E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              YTgify is a Desktop Extension
            </h1>
            <p className="text-lg text-gray-400 mb-2">
              It works inside Chrome and Firefox on your computer.
            </p>
            <p className="text-gray-500">
              Save the link to install when you&apos;re back at your desktop.
            </p>
          </div>

          {/* Primary CTA - Share/Save Link */}
          <div className="mb-8">
            {shareStatus === 'shared' ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-green-400 text-lg font-semibold">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Link saved!
                </div>
                <p className="text-gray-500 text-sm mt-2">Check your notes, email, or messages</p>
              </div>
            ) : (
              <button
                onClick={handleShare}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-[#E91E8C] to-[#7B2FBE] text-white font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Save Link for Later
              </button>
            )}
          </div>

          {/* Secondary CTA - Email Capture */}
          <div className="mb-10 py-6 px-6 rounded-lg bg-gray-900/50 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-1 text-center">Want updates?</h2>
            <p className="text-gray-500 text-sm text-center mb-4">
              Get notified about new features. No spam.
            </p>
            <EmailCaptureForm
              source="mobile_welcome"
              buttonText="Subscribe"
              successMessage="You're on the list!"
              placeholder="your@email.com"
            />
          </div>

          {/* Demo Video Section */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 text-center">See what you can do with YTgify</h2>
            <DemoVideo />
          </div>

          {/* Quick Features List */}
          <div className="mb-10">
            <div className="grid grid-cols-2 gap-4">
              <Feature icon="✨" text="No watermark" />
              <Feature icon="⚡" text="30 seconds to GIF" />
              <Feature icon="📝" text="Add text overlays" />
              <Feature icon="🎬" text="Works inside YouTube" />
            </div>
          </div>
        </article>

        <SiteFooter />
      </main>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-300">
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  );
}
