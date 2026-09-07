'use client';

import { useCallback, useRef, useState } from 'react';
import { trackStudioEvent } from '@/lib/studio/analytics';
import { STUDIO_CAPTION_MAX_LENGTH } from '@/lib/studio/constants';
import type { StudioCaptionSettings } from '@/lib/studio/types';
import { defaultCaptions } from './studio-config';

export function useStudioCaptions() {
  const [captions, setCaptions] = useState(defaultCaptions);
  const captionReported = useRef(false);
  const resetCaptions = useCallback(() => {
    captionReported.current = false;
    setCaptions(defaultCaptions);
  }, []);
  const updateCaption = useCallback((placement: 'topText' | 'bottomText', value: string) => {
    const nextValue = value.slice(0, STUDIO_CAPTION_MAX_LENGTH);
    if (nextValue.trim() && !captionReported.current) {
      captionReported.current = true;
      trackStudioEvent('studio_caption_added', { captions_enabled: true });
    }
    setCaptions((current) => ({ ...current, [placement]: nextValue }));
  }, []);
  const updateCaptionSetting = useCallback(
    <Key extends keyof StudioCaptionSettings>(key: Key, value: StudioCaptionSettings[Key]) => {
      setCaptions((current) => ({ ...current, [key]: value }));
    },
    [],
  );
  return { captions, resetCaptions, updateCaption, updateCaptionSetting };
}
