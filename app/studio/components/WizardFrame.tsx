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
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/80 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <WizardProgress currentStep={currentStep} />
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Start over
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
      aria-label="Studio wizard progress"
      className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-400 sm:min-w-[520px]"
    >
      {wizardSteps.map((item, index) => {
        const isComplete = currentIndex > index;
        const isCurrent = currentIndex === index;
        return (
          <li
            key={item.id}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-2 ${
              isCurrent
                ? 'border-[#E91E8C] bg-[#E91E8C]/15 text-white'
                : isComplete
                  ? 'border-[#4fd1c5]/60 bg-[#4fd1c5]/10 text-[#9ff3ea]'
                  : 'border-gray-800 text-gray-500'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center border border-current text-[11px]">
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
