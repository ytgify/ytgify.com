import { RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { StudioWizardStep } from '../studio-config';
import { studioPhase, wizardSteps } from '../studio-config';

export function WizardFrame({
  currentStep,
  onReset,
  children,
}: {
  currentStep: StudioWizardStep;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950/80 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between gap-2 border-b border-gray-800 p-3 sm:gap-4 sm:p-5">
        <WizardProgress currentStep={currentStep} />
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-700 sm:w-auto sm:px-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Start over</span>
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function WizardProgress({ currentStep }: { currentStep: StudioWizardStep }) {
  const currentIndex = wizardSteps.findIndex((item) => item.id === studioPhase(currentStep));

  return (
    <ol
      aria-label="Video to GIF progress"
      className="grid flex-1 grid-cols-3 gap-2 text-xs font-semibold text-gray-400 sm:min-w-[520px]"
    >
      {wizardSteps.map((item, index) => {
        const isComplete = currentIndex > index;
        const isCurrent = currentIndex === index;
        return (
          <li
            key={item.id}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 py-2 sm:min-h-14 sm:justify-start sm:px-3 ${
              isCurrent
                ? 'border-[#E91E8C] bg-[#E91E8C]/15 text-white'
                : isComplete
                  ? 'border-[#4fd1c5]/60 bg-[#4fd1c5]/10 text-[#9ff3ea]'
                  : 'border-gray-800 text-gray-500'
            }`}
          >
            <span className="hidden h-5 w-5 items-center sm:flex justify-center border border-current text-[11px]">
              {isComplete ? '✓' : index + 1}
            </span>
            <span>
              <span className="block text-sm">{item.label}</span>
              <span className="mt-0.5 hidden text-[11px] font-normal text-gray-500 sm:block">{item.helper}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
