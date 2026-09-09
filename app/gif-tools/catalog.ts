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
} as const;
export type GifTool = keyof typeof gifTools;
