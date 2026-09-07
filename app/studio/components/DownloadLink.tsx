import { trackStudioEvent, studioFileSizeBucket } from '@/lib/studio/analytics';
import { sizeTargetOutcome } from '@/lib/studio/size-target';
import type { StudioExportResult } from '@/lib/studio/types';

export function DownloadLink({ result, previous = false }: { result: StudioExportResult; previous?: boolean }) {
  return (
    <a
      href={result.url}
      download="ytgify-video-to-gif.gif"
      onClick={() =>
        trackStudioEvent('studio_download_clicked', {
          size_target: result.sizeTarget,
          size_target_outcome: sizeTargetOutcome(result.fileSize, result.sizeTarget),
          output_file_size_bucket: studioFileSizeBucket(result.fileSize),
        })
      }
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold ${previous ? 'border border-gray-700 text-gray-200' : 'bg-[#E91E8C] text-white'}`}
    >
      {previous ? 'Download previous GIF' : 'Download GIF'}
    </a>
  );
}
