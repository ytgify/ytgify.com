'use client';

import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  trackExtensionEvent,
  trackExtensionException,
  CHROME_EXTENSION_DOWNLOAD_PATH,
  analyticsDestination,
} from '@/lib/extensionAnalytics';

type Surface =
  | 'home_hero'
  | 'home_demo'
  | 'home_install_callout'
  | 'home_install_steps'
  | 'home_sticky_nav'
  | 'footer'
  | 'welcome_desktop'
  | 'welcome_mobile';

type ExtensionFunnelViewProps = {
  surface: Surface;
  funnelStep?: string;
  eventName?: string;
};

export function ExtensionFunnelView({
  surface,
  funnelStep = 'viewed',
  eventName = 'extension_install_funnel_viewed',
}: ExtensionFunnelViewProps) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    let captured = false;
    const captureView = () => {
      if (captured) return;
      captured = true;
      trackExtensionEvent(eventName, {
        surface,
        funnel_step: funnelStep,
      });
    };

    if (!('IntersectionObserver' in window)) {
      captureView();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          captureView();
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [eventName, surface, funnelStep]);

  return <span ref={markerRef} className="block h-px w-px" aria-hidden="true" />;
}

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  surface: Surface;
  cta: string;
  eventName?: string;
  children: ReactNode;
};

export function TrackedExtensionLink({
  surface,
  cta,
  eventName = 'extension_cta_clicked',
  href,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        trackExtensionEvent(eventName, {
          surface,
          cta,
          destination: analyticsDestination(href?.toString()),
          is_download: href === CHROME_EXTENSION_DOWNLOAD_PATH,
        });
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

type CopyChromeExtensionsButtonProps = {
  surface: Surface;
};

export function CopyChromeExtensionsButton({ surface }: CopyChromeExtensionsButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText('chrome://extensions');
      setCopied(true);
      trackExtensionEvent('extension_install_step_completed', {
        surface,
        install_step: 'copy_chrome_extensions_url',
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      trackExtensionException(error, {
        surface,
        install_step: 'copy_chrome_extensions_url',
      });
    }
  }

  return (
    <button
      type="button"
      onClick={copyUrl}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
