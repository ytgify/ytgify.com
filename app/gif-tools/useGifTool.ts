'use client';
import { useEffect, useRef, useState } from 'react';
import { trackToolEvent } from '@/lib/media/analytics';
import type { Geometry } from '@/lib/media/gif/geometry';
import type { GifJobResult, GifOperation } from '@/lib/media/jobs/protocol';
import type { GifTool } from './catalog';
import { useGifJob } from './useGifJob';
export function useGifTool(tool: GifTool) {
  const job = useGifJob();
  useEffect(() => {
    trackToolEvent(tool, 'view');
  }, [tool]);
  useEffect(() => {
    if (job.error) trackToolEvent(tool, 'error');
  }, [job.error, tool]);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [metadata, setMetadata] = useState<GifJobResult | null>(null);
  const [result, setResult] = useState<GifJobResult | null>(null);
  const [outputUrl, setOutputUrl] = useState('');
  useEffect(
    () => () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    },
    [outputUrl],
  );
  const [target, setTarget] = useState(1);
  const [allowResize, setAllowResize] = useState(false);
  const [allowFrameReduction, setAllowFrameReduction] = useState(false);
  const [cycles, setCycles] = useState(1);
  const [background, setBackground] = useState('#ffffff');
  const [geometry, setGeometry] = useState<Geometry>({
    left: 0,
    top: 0,
    cropWidth: 1,
    cropHeight: 1,
    width: 1,
    height: 1,
    fit: 'stretch',
  });
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source);
    },
    [source],
  );
  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);
  const choose = (next: File) => {
    setFile(next);
    setSource('');
    setMetadata(null);
    setResult(null);
    void job.run(next, { kind: 'inspect' }, (info) => {
      setMetadata(info);
      setSource(URL.createObjectURL(next));
      setGeometry({
        left: 0,
        top: 0,
        cropWidth: info.width,
        cropHeight: info.height,
        width: info.width,
        height: info.height,
        fit: 'stretch',
      });
    });
  };
  const process = () => {
    if (!file) return;
    setResult(null);
    trackToolEvent(tool, 'start');
    const operation: GifOperation =
      tool === 'gif-compressor'
        ? {
            kind: 'compress',
            options: { targetBytes: Math.round(target * 1_000_000), allowResize, allowFrameReduction },
          }
        : tool === 'resize-gif'
          ? { kind: 'resize', options: geometry }
          : { kind: 'mp4', options: { cycles, background } };
    void job.run(file, operation, (value) => {
      if (value.bytes) setOutputUrl(URL.createObjectURL(new Blob([new Uint8Array(value.bytes)], { type: value.mime })));
      trackToolEvent(tool, 'success');
      setResult(value);
    });
  };
  return {
    job,
    file,
    source,
    metadata,
    result,
    outputUrl,
    target,
    setTarget,
    allowResize,
    allowFrameReduction,
    setAllowFrameReduction,
    setAllowResize,
    cycles,
    setCycles,
    background,
    setBackground,
    geometry,
    setGeometry,
    resultHeading,
    choose,
    process,
    setResult,
  };
}
