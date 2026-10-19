import { calculateOutputDimensions } from '@/lib/studio/resolution';
import type { StudioOutputSettings, StudioVideoMetadata } from '@/lib/studio/types';

export function outputDescription(metadata: StudioVideoMetadata, settings: StudioOutputSettings) {
  const { width, height } = calculateOutputDimensions(metadata.width, metadata.height, settings.resolution);
  return `${width} × ${height} at ${settings.fps} FPS (${settings.resolution}p maximum)`;
}
