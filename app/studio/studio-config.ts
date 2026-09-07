import { STUDIO_DEFAULT_FPS, STUDIO_DEFAULT_RESOLUTION } from '@/lib/studio/constants';
import type { StudioCaptionSettings, StudioOutputSettings } from '@/lib/studio/types';

export type StudioWizardStep = 'upload' | 'capture' | 'processing' | 'success';
export type StudioPhase = 'upload' | 'edit' | 'export';

export const defaultCaptions: StudioCaptionSettings = {
  topText: '',
  bottomText: '',
  size: 'standard',
  color: 'white',
};

export const defaultSettings: StudioOutputSettings = {
  fps: STUDIO_DEFAULT_FPS,
  resolution: STUDIO_DEFAULT_RESOLUTION,
  sizeTarget: 'auto',
};

export const wizardSteps: Array<{ id: StudioPhase; label: string; helper: string }> = [
  { id: 'upload', label: 'Upload', helper: 'Choose your clip' },
  { id: 'edit', label: 'Edit', helper: 'Trim and caption' },
  { id: 'export', label: 'Export', helper: 'Create and download' },
];

export function studioPhase(step: StudioWizardStep): StudioPhase {
  if (step === 'upload') return 'upload';
  if (step === 'capture') return 'edit';
  return 'export';
}
