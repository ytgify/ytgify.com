'use client';

import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { CaptureScreen } from './components/CaptureScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { TextScreen } from './components/TextScreen';
import { UploadScreen } from './components/UploadScreen';
import { WizardFrame } from './components/WizardFrame';
import { useStudioController } from './useStudioController';

export default function StudioApp() {
  const studio = useStudioController();

  return (
    <main data-ph-no-capture className="min-h-screen bg-[#0a0a0a] grid-pattern text-white">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 py-6 sm:px-8 lg:py-8">
        <header className="flex items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
          <Link href="/" className="flex items-center gap-2.5 text-white" aria-label="YTgify home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E91E8C]/35 bg-[#E91E8C]/10">
              <Sparkles className="h-4 w-4 text-[#ff5fb2]" />
            </span>
            <span className="font-bold tracking-tight">YTgify</span>
          </Link>
          <nav aria-label="Studio navigation" className="flex items-center gap-4 text-sm font-semibold text-gray-400">
            <Link href="/blog" className="transition-colors hover:text-white">
              GIF guides
            </Link>
            <Link href="/" className="hidden items-center gap-1 transition-colors hover:text-white sm:inline-flex">
              Chrome extension <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </header>

        <section id="wizard" className="mx-auto w-full max-w-[920px]">
          {studio.displayStep === 'upload' ? (
            <UploadScreen
              status={studio.status}
              error={studio.error}
              isDragging={studio.isDragging}
              inputRef={studio.inputRef}
              videoUrl={studio.videoUrl}
              videoRef={studio.videoRef}
              metadata={studio.metadata}
              onFile={studio.handleFile}
              onMetadataLoaded={studio.handleMetadataLoaded}
              onDecodeError={studio.handleDecodeError}
              onReset={studio.resetStudio}
              setIsDragging={studio.setIsDragging}
            />
          ) : null}

          {studio.displayStep !== 'upload' && studio.metadata && studio.trim && studio.videoUrl ? (
            <WizardFrame currentStep={studio.displayStep} onReset={studio.resetStudio}>
              {studio.displayStep === 'capture' ? (
                <CaptureScreen
                  videoUrl={studio.videoUrl}
                  videoRef={studio.videoRef}
                  metadata={studio.metadata}
                  trim={studio.trim}
                  settings={studio.settings}
                  outputSummary={studio.outputSummary}
                  estimatedSize={studio.estimatedSize}
                  exportBudget={studio.exportBudget!}
                  onTrimChange={studio.updateTrim}
                  onPreset={studio.applyPreset}
                  onSettingsChange={studio.setSettings}
                  onBack={studio.resetStudio}
                  onContinue={studio.goToText}
                />
              ) : null}
              {studio.displayStep === 'text' ? (
                <TextScreen
                  videoUrl={studio.videoUrl}
                  videoRef={studio.videoRef}
                  metadata={studio.metadata}
                  trim={studio.trim}
                  captions={studio.captions}
                  onCaptionChange={studio.updateCaption}
                  onCaptionSettingChange={studio.updateCaptionSetting}
                  onBack={studio.goToCapture}
                  onSkip={studio.exportWithoutText}
                  onCreate={studio.exportWithText}
                  disabled={!studio.canExport}
                />
              ) : null}
              {studio.displayStep === 'processing' ? (
                <ProcessingScreen
                  progress={studio.progress}
                  error={studio.status === 'error' ? studio.error : null}
                  onBack={studio.processingBack}
                />
              ) : null}
              {studio.displayStep === 'success' && studio.result ? (
                <SuccessScreen
                  result={studio.result}
                  nextTool={studio.nextTool}
                  setNextTool={studio.setNextTool}
                  onBack={studio.successBack}
                  onReset={studio.resetStudio}
                />
              ) : null}
            </WizardFrame>
          ) : null}
        </section>
      </div>
    </main>
  );
}
