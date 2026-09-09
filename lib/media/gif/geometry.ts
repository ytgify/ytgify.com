import { GifError, MAX_WORKSPACE, type DecodedGif } from './types';

export interface Geometry {
  left: number;
  top: number;
  cropWidth: number;
  cropHeight: number;
  width: number;
  height: number;
  fit: 'stretch' | 'contain';
}

function validateGeometry(gif: DecodedGif, geometry: Geometry): void {
  const { left, top, cropWidth, cropHeight, width, height } = geometry;
  if (
    ![left, top, cropWidth, cropHeight, width, height].every(Number.isInteger) ||
    left < 0 ||
    top < 0 ||
    cropWidth < 1 ||
    cropHeight < 1 ||
    width < 1 ||
    height < 1 ||
    width > 4096 ||
    height > 4096 ||
    left + cropWidth > gif.width ||
    top + cropHeight > gif.height
  ) {
    throw new GifError('input_limit', 'Enter positive dimensions and a crop within the original image.');
  }
  if (gif.estimatedWorkspace + width * height * 4 * (gif.frames.length * 2 + 4) > MAX_WORKSPACE) {
    throw new GifError('memory_limit', 'These output dimensions need too much memory. Choose a smaller size.');
  }
}

export function transformGif(gif: DecodedGif, geometry: Geometry): DecodedGif {
  validateGeometry(gif, geometry);
  const { left, top, cropWidth, cropHeight, width, height, fit } = geometry;
  const scale = Math.min(width / cropWidth, height / cropHeight);
  const renderedWidth = fit === 'contain' ? Math.max(1, Math.round(cropWidth * scale)) : width;
  const renderedHeight = fit === 'contain' ? Math.max(1, Math.round(cropHeight * scale)) : height;
  const padX = Math.floor((width - renderedWidth) / 2);
  const padY = Math.floor((height - renderedHeight) / 2);
  const frames = gif.frames.map((frame) => {
    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < renderedHeight; y++) {
      for (let x = 0; x < renderedWidth; x++) {
        const sx = left + Math.min(cropWidth - 1, Math.floor((x * cropWidth) / renderedWidth));
        const sy = top + Math.min(cropHeight - 1, Math.floor((y * cropHeight) / renderedHeight));
        const from = (sy * gif.width + sx) * 4;
        rgba.set(frame.rgba.subarray(from, from + 4), ((y + padY) * width + x + padX) * 4);
      }
    }
    return { rgba, delay: frame.delay };
  });
  return { ...gif, width, height, frames };
}
