'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackStudioEvent, type StudioEntryPoint } from '@/lib/studio/analytics';

type ConverterLinkProps = {
  entryPoint: StudioEntryPoint;
  className: string;
  children: ReactNode;
};

export default function ConverterLink({ entryPoint, className, children }: ConverterLinkProps) {
  function trackClick() {
    trackStudioEvent('studio_entry_clicked', { entry_point: entryPoint });
  }

  return (
    <Link
      href="/video-to-gif"
      className={className}
      onClick={trackClick}
      onAuxClick={(event) => {
        if (event.button === 1) trackClick();
      }}
    >
      {children}
    </Link>
  );
}
