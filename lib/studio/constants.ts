import type { StudioFps, StudioResolution } from './types';

export const STUDIO_MAX_FILE_SIZE_BYTES = 250 * 1024 * 1024;
export const STUDIO_MAX_SOURCE_DURATION_SECONDS = 5 * 60;
export const STUDIO_MAX_EXPORT_DURATION_SECONDS = 10;
export const STUDIO_CAPTION_MAX_LENGTH = 90;
export const STUDIO_DEFAULT_FPS: StudioFps = 10;
export const STUDIO_DEFAULT_RESOLUTION: StudioResolution = 360;
export const STUDIO_PRESET_DURATIONS = [3, 5, 10] as const;
export const STUDIO_FPS_OPTIONS: StudioFps[] = [5, 10, 15];
export const STUDIO_RESOLUTION_OPTIONS: StudioResolution[] = [240, 360, 480];
export const STUDIO_ACCEPTED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
export const STUDIO_ACCEPTED_EXTENSIONS = ['.mp4', '.mov', '.webm'];
