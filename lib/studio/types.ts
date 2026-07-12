export type StudioStatus = 'idle' | 'loading-video' | 'editing' | 'exporting' | 'complete' | 'error';

type StudioProgressStage = 'preparing' | 'capturing' | 'captions' | 'encoding' | 'finalizing' | 'complete';

export type StudioFps = 5 | 10 | 15;
export type StudioResolution = 240 | 360 | 480;
export type StudioEncoderUsed = 'gifenc';
export type StudioCaptionSize = 'standard' | 'large';
export type StudioCaptionColor = 'white' | 'yellow';

export interface StudioVideoMetadata {
  duration: number;
  width: number;
  height: number;
  type: string;
  size: number;
}

export interface StudioTrimSelection {
  startTime: number;
  endTime: number;
  duration: number;
}

export interface StudioOutputSettings {
  fps: StudioFps;
  resolution: StudioResolution;
}

export interface StudioCaptionSettings {
  topText: string;
  bottomText: string;
  size: StudioCaptionSize;
  color: StudioCaptionColor;
}

export interface StudioExportProgress {
  stage: StudioProgressStage;
  percentage: number;
  message: string;
  frameIndex?: number;
  totalFrames?: number;
}

export interface StudioExportResult {
  blob: Blob;
  url: string;
  fileSize: number;
  width: number;
  height: number;
  duration: number;
  frameCount: number;
  encoder: StudioEncoderUsed;
}

export interface StudioFrame {
  imageData: ImageData;
  delay: number;
}

type StudioErrorCode =
  | 'unsupported_file'
  | 'decode_failed'
  | 'file_too_large'
  | 'source_too_long'
  | 'clip_too_long'
  | 'canvas_failed'
  | 'extraction_timeout'
  | 'encoding_failed'
  | 'memory_limit'
  | 'cancelled';

export interface StudioError {
  code: StudioErrorCode;
  message: string;
  action: string;
}
