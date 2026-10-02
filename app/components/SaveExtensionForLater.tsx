'use client';

import { useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
import { trackExtensionEvent } from '@/lib/extensionAnalytics';

const installUrl = `${SITE_URL}/#install`;
const shareData = {
  title: 'Install YTgify on your computer',
  text: 'Save the YTgify Chrome extension setup for when you are at your computer.',
  url: installUrl,
};

type SaveStatus = 'idle' | 'shared' | 'copied' | 'manual';

export default function SaveExtensionForLater() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [busy, setBusy] = useState(false);

  async function saveLink() {
    setBusy(true);
    setStatus('idle');
    trackExtensionEvent('mobile_extension_save_clicked', { surface: 'home_hero' });

    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share(shareData);
          setStatus('shared');
          trackExtensionEvent('mobile_extension_save_completed', {
            surface: 'home_hero',
            save_method: 'web_share',
          });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            trackExtensionEvent('mobile_extension_save_cancelled', { surface: 'home_hero' });
            return;
          }
        }
      }

      if (typeof navigator.clipboard?.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(installUrl);
          setStatus('copied');
          trackExtensionEvent('mobile_extension_save_completed', {
            surface: 'home_hero',
            save_method: 'clipboard',
          });
          return;
        } catch {
          // A selectable link remains available when clipboard access is denied.
        }
      }

      setStatus('manual');
      trackExtensionEvent('mobile_extension_save_manual_link_shown', { surface: 'home_hero' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={saveLink}
        disabled={busy}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#E91E8C]/60 bg-[#E91E8C]/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#E91E8C]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
      >
        <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
        Save for later
      </button>
      <p className="mt-2 text-xs leading-5 text-gray-400">
        {status === 'shared' && 'Link shared. Open it on your computer when you are ready.'}
        {status === 'copied' && 'Link copied. Send it to yourself for your computer.'}
        {status === 'manual' && 'Copy this link and send it to yourself:'}
        {status === 'idle' && 'Share the setup link to your notes, email, or another device.'}
      </p>
      {status === 'manual' && (
        <input
          aria-label="Desktop extension setup link"
          className="mt-2 w-full min-w-0 rounded-md border border-gray-600 bg-gray-950 px-2 py-2 text-sm text-white"
          onFocus={(event) => event.currentTarget.select()}
          readOnly
          value={installUrl}
        />
      )}
    </div>
  );
}
