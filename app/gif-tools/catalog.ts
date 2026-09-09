export const gifTools = {
  'gif-compressor': {
    title: 'Free GIF Compressor',
    description:
      'Reduce animated GIF file size in your browser. Choose a size target, compare the measured result, and download with no watermark or account.',
    action: 'Compress GIF',
    steps: [
      'Choose an animated GIF from your device.',
      'Set a file-size target. Allow smaller dimensions only if you want them.',
      'Compare the actual size and download the best acceptable result.',
    ],
  },
  'resize-gif': {
    title: 'Resize and Crop Animated GIFs',
    description:
      'Crop a GIF or change its pixel dimensions while keeping the animation. Free local processing with transparent padding and no watermark.',
    action: 'Resize GIF',
    steps: [
      'Choose a GIF from your device.',
      'Drag a crop or enter its coordinates, then choose output dimensions.',
      'Preview and download the resized animated GIF.',
    ],
  },
  'gif-to-mp4': {
    title: 'GIF to MP4 Converter',
    description:
      'Convert an animated GIF to a real MP4 video locally. Choose a background and repeat count, then preview and download.',
    action: 'Create MP4',
    steps: [
      'Choose an animated GIF.',
      'Choose the number of cycles and a background for transparent areas.',
      'Create and download an MP4 in a browser with supported video encoding.',
    ],
  },
} as const;

export type GifTool = keyof typeof gifTools;
