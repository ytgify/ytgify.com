import { STUDIO_DEFAULT_FPS, STUDIO_DEFAULT_RESOLUTION } from '@/lib/studio/constants';
import type {
  StudioCaptionColor,
  StudioCaptionSettings,
  StudioCaptionSize,
  StudioFps,
  StudioOutputSettings,
  StudioResolution,
} from '@/lib/studio/types';

export type StudioWizardStep = 'upload' | 'capture' | 'text' | 'processing' | 'success';
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
};

export const resolutionDetails: Record<StudioResolution, { name: string; description: string; multiplier: number }> = {
  240: { name: '240p Mini', description: 'Quick to share', multiplier: 0.5 },
  360: { name: '360p Compact', description: 'Ideal for email', multiplier: 0.7 },
  480: { name: '480p HD', description: 'Best quality', multiplier: 1 },
};

export const fpsDetails: Record<StudioFps, { label: string; description: string }> = {
  5: { label: '5 fps', description: 'Smaller file - Classic GIF feel' },
  10: { label: '10 fps', description: 'Balanced - Recommended' },
  15: { label: '15 fps', description: 'Smoother - Larger file' },
};

export const captionSizeDetails: Record<StudioCaptionSize, { label: string; description: string }> = {
  standard: { label: 'Standard', description: 'Classic caption scale' },
  large: { label: 'Large', description: 'More emphasis' },
};

export const captionColorDetails: Record<StudioCaptionColor, { label: string; description: string }> = {
  white: { label: 'White', description: 'High contrast' },
  yellow: { label: 'Yellow', description: 'Warm highlight' },
};

export const highCostFrameThreshold = 75;

export const wizardSteps: Array<{ id: StudioPhase; label: string; helper: string }> = [
  { id: 'upload', label: 'Upload', helper: 'Choose your clip' },
  { id: 'edit', label: 'Edit', helper: 'Trim and caption' },
  { id: 'export', label: 'Export', helper: 'Create and download' },
];

export function studioPhase(step: StudioWizardStep): StudioPhase {
  if (step === 'upload') return 'upload';
  if (step === 'capture' || step === 'text') return 'edit';
  return 'export';
}
