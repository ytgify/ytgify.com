import type { StudioError, StudioExportProgress } from '@/lib/studio/types';
import { WizardHeader } from './shared';

export function ProcessingScreen({
  progress,
  error,
  onBack,
}: {
  progress: StudioExportProgress | null;
  error: StudioError | null;
  onBack: () => void;
}) {
  const stages = [
    { key: 'capturing', name: 'Capturing Frames' },
    { key: 'captions', name: 'Applying Captions' },
    { key: 'encoding', name: 'Encoding GIF' },
    { key: 'finalizing', name: 'Finalizing' },
  ];
  const currentStage = progress?.stage || 'preparing';
  const currentIndex =
    currentStage === 'preparing'
      ? 0
      : Math.max(
          0,
          stages.findIndex((stage) => stage.key === currentStage),
        );
  const isError = Boolean(error);
  const helper = isError
    ? [error?.message, error?.action].filter(Boolean).join(' ') || 'Try again with a shorter clip.'
    : progress?.message || 'Initializing...';

  return (
    <div className="space-y-6">
      <WizardHeader
        eyebrow="Processing"
        title={isError ? 'GIF Creation Failed' : 'Creating Your GIF'}
        helper={helper}
        onBack={onBack}
      />

      <section className="rounded-xl border border-gray-800 bg-black/10 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">
            {isError ? 'Error occurred' : `Stage ${Math.min(currentIndex + 1, 4)} of 4`}
          </h3>
          <span className="text-sm font-semibold text-gray-400">{progress?.percentage || 0}%</span>
        </div>
        <div className="mb-5 h-2 bg-gray-800">
          <div
            className={`h-full ${isError ? 'bg-red-400' : 'bg-[#4fd1c5]'}`}
            style={{ width: `${progress?.percentage || 0}%` }}
          />
        </div>
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const completed = !isError && index < currentIndex;
            const current = !isError && index === currentIndex;
            const failed = isError && index === currentIndex;
            return (
              <div
                key={stage.key}
                className={`flex items-center gap-3 border px-4 py-3 ${
                  failed
                    ? 'border-red-500/50 bg-red-950/30 text-red-100'
                    : completed
                      ? 'border-[#4fd1c5]/50 bg-[#4fd1c5]/10 text-[#9ff3ea]'
                      : current
                        ? 'border-[#E91E8C]/70 bg-[#E91E8C]/10 text-white'
                        : 'border-gray-800 text-gray-500'
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center border border-current text-xs">
                  {failed ? '!' : completed ? '✓' : current ? '●' : '○'}
                </span>
                <span className="font-semibold">{stage.name}</span>
              </div>
            );
          })}
        </div>
        {progress?.frameIndex && progress.totalFrames ? (
          <p className="mt-4 text-sm text-gray-400">
            Frame {progress.frameIndex}/{progress.totalFrames}
          </p>
        ) : null}
      </section>
    </div>
  );
}
