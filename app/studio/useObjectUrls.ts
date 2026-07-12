import { useCallback, useEffect, useRef } from 'react';

export function useObjectUrls(onUnmount: () => void) {
  const videoUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const revokeVideoUrl = useCallback(() => {
    if (!videoUrlRef.current) return;
    URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = null;
  }, []);

  const revokeResultUrl = useCallback(() => {
    if (!resultUrlRef.current) return;
    URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      onUnmount();
      revokeVideoUrl();
      revokeResultUrl();
    };
  }, [onUnmount, revokeResultUrl, revokeVideoUrl]);

  const createVideoUrl = useCallback(
    (file: File) => {
      revokeVideoUrl();
      const url = URL.createObjectURL(file);
      videoUrlRef.current = url;
      return url;
    },
    [revokeVideoUrl],
  );

  const createResultUrl = useCallback(
    (blob: Blob) => {
      revokeResultUrl();
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      return url;
    },
    [revokeResultUrl],
  );

  return { createResultUrl, createVideoUrl, revokeResultUrl, revokeVideoUrl };
}
