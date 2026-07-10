'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ChevronLeft, ChevronRight, Download, FolderOpen, Maximize2, MousePointerClick, Settings, X } from 'lucide-react';
import {
  CopyChromeExtensionsButton,
  ExtensionFunnelView,
  TrackedExtensionLink,
} from './ExtensionAnalytics';
import {
  CHROME_EXTENSION_DOWNLOAD_PATH,
  CHROME_EXTENSION_VERSION,
  trackExtensionEvent,
} from '@/lib/extensionAnalytics';

const installSteps = [
  {
    title: 'Open Chrome extensions',
    description: 'Paste chrome://extensions into Chrome or use the Extensions menu.',
    previewTitle: 'Go to chrome://extensions',
    previewDetail: 'This is Chrome\'s built-in extensions manager. It is where local extensions are loaded and updated.',
    previewAction: 'Developer mode starts off. You will turn it on in the next step.',
    screenshot: '/install-screenshots/01-chrome-extensions-dev-mode-off.png',
    screenshotAlt: 'Chrome extensions page with Developer mode off',
    screenshotWidth: 1280,
    screenshotHeight: 900,
    icon: Settings,
  },
  {
    title: 'Turn on Developer mode',
    description: 'Use the switch in the top-right of the Chrome extensions page.',
    previewTitle: 'Enable Developer mode',
    previewDetail: 'Chrome reveals the Load unpacked button only after Developer mode is enabled.',
    previewAction: 'Look for the switch in the top-right corner of the extensions page.',
    screenshot: '/install-screenshots/02-chrome-extensions-dev-mode-on-load-unpacked.png',
    screenshotAlt: 'Chrome extensions page with Developer mode on and Load unpacked visible',
    screenshotWidth: 1280,
    screenshotHeight: 900,
    icon: MousePointerClick,
  },
  {
    title: 'Select extracted folder',
    description: 'Click Load unpacked and select the folder you extracted from the ZIP.',
    previewTitle: 'Choose the extracted folder',
    previewDetail: 'Select the folder that contains the extension files. Do not select the ZIP file.',
    previewAction: 'Choose ytgify-v1.0.19-chrome, then click Select.',
    screenshot: '/install-screenshots/04-native-folder-picker-select-extension-folder.png',
    screenshotAlt: 'macOS folder picker with the ytgify-v1.0.19-chrome folder selected',
    screenshotWidth: 900,
    screenshotHeight: 470,
    icon: FolderOpen,
  },
  {
    title: 'Confirm YTgify loaded',
    description: 'Chrome shows the YTgify card when the extension is installed.',
    previewTitle: 'YTgify appears in Chrome',
    previewDetail: 'When the card appears, the extension is loaded and ready for supported YouTube videos.',
    previewAction: 'Keep the extension enabled, then open YouTube and make your first GIF.',
    screenshot: '/install-screenshots/03-ytgify-loaded-in-extensions.png',
    screenshotAlt: 'YTgify extension card loaded on the Chrome extensions page',
    screenshotWidth: 1280,
    screenshotHeight: 900,
    icon: CheckCircle2,
  },
];

const installTips = [
  'Extract the ZIP before loading it.',
  'Choose the extracted folder, not the ZIP file.',
  'Use the reload icon after loading a newer version.',
];

export function LegacyInstallSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const activeStep = installSteps[activeStepIndex];
  const ActiveIcon = activeStep.icon;
  const expandedStep = expandedStepIndex === null ? null : installSteps[expandedStepIndex];
  const expandedStepOrdinal = expandedStepIndex === null ? 0 : expandedStepIndex + 1;

  function selectStep(index: number, source: string) {
    setActiveStepIndex(index);
    trackExtensionEvent('extension_install_step_previewed', {
      surface: 'home_install_steps',
      install_step: installSteps[index].title,
      install_step_index: index + 1,
      source,
    });
  }

  function moveStep(direction: -1 | 1) {
    const nextIndex = Math.min(Math.max(activeStepIndex + direction, 0), installSteps.length - 1);

    if (nextIndex !== activeStepIndex) {
      selectStep(nextIndex, direction > 0 ? 'next_button' : 'previous_button');
    }
  }

  function openExpandedStep(index: number) {
    setExpandedStepIndex(index);
    trackExtensionEvent('extension_install_step_image_expanded', {
      surface: 'home_install_steps',
      install_step: installSteps[index].title,
      install_step_index: index + 1,
    });
  }

  const moveExpandedStep = useCallback((direction: -1 | 1) => {
    if (expandedStepIndex === null) return;

    const nextIndex = (expandedStepIndex + direction + installSteps.length) % installSteps.length;
    setExpandedStepIndex(nextIndex);
    setActiveStepIndex(nextIndex);
    trackExtensionEvent('extension_install_step_image_carousel_navigated', {
      surface: 'home_install_steps',
      install_step: installSteps[nextIndex].title,
      install_step_index: nextIndex + 1,
      direction: direction > 0 ? 'next' : 'previous',
    });
  }, [expandedStepIndex]);

  useEffect(() => {
    if (expandedStepIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setExpandedStepIndex(null);
      }

      if (event.key === 'ArrowLeft') {
        moveExpandedStep(-1);
      }

      if (event.key === 'ArrowRight') {
        moveExpandedStep(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedStepIndex, moveExpandedStep]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
      <ExtensionFunnelView surface="home_install_steps" funnelStep="install_steps_viewed" />
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#E91E8C]">
          Manual Chrome install
        </p>
        <h2 className="mb-4 text-3xl font-bold text-white">Install the YTgify extension</h2>

        <p className="mb-6 leading-relaxed text-gray-300">
          YTgify runs as an unpacked Chrome extension. The setup is the same flow developers use when testing extensions locally, and it keeps the GIF workflow right where you watch videos.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <TrackedExtensionLink
            href={CHROME_EXTENSION_DOWNLOAD_PATH}
            download
            surface="home_install_steps"
            cta="download_extension_zip"
            eventName="extension_download_clicked"
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            Download v{CHROME_EXTENSION_VERSION}
          </TrackedExtensionLink>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Chrome ZIP file, about 330 KB. Manual installs update when you download and load a newer ZIP.
        </p>

        <div className="mt-8 border border-gray-800 bg-gray-900/35 p-4">
          <p className="mb-3 text-sm font-semibold text-white">Common install tips</p>
          <ul className="space-y-2 text-sm text-gray-400">
            {installTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-lg font-semibold text-white">Chrome install walkthrough</h4>
          <div className="flex items-center gap-2 border border-gray-800 bg-gray-950/80 px-3 py-2">
            <code className="text-sm text-blue-300">chrome://extensions</code>
            <CopyChromeExtensionsButton surface="home_install_steps" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-2">
            {installSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStepIndex;

              return (
                <button
                  key={step.title}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectStep(index, 'step_button')}
                  className={`flex min-h-20 gap-3 border p-3 text-left transition-colors ${
                    isActive
                      ? 'border-[#E91E8C]/70 bg-[#E91E8C]/10'
                      : 'border-gray-800 bg-gray-900/35 hover:border-gray-700 hover:bg-gray-900/60'
                  }`}
                >
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${
                    isActive ? 'bg-[#E91E8C]' : 'bg-blue-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span>
                    <span className="flex items-center gap-2 font-medium text-white">
                      <Icon className="h-4 w-4 text-[#E91E8C]" />
                      {step.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-400">{step.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border border-gray-800 bg-gray-950/80 p-4">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <p className="text-sm font-semibold text-[#E91E8C]">Step {activeStepIndex + 1}</p>
                <h5 className="mt-1 text-xl font-bold text-white">{activeStep.previewTitle}</h5>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#E91E8C]/30 bg-[#E91E8C]/10">
                <ActiveIcon className="h-5 w-5 text-[#E91E8C]" />
              </span>
            </div>

            <div className="border border-gray-800 bg-[#0b1020] p-3">
              <div
                role="button"
                tabIndex={0}
                aria-label={`Expand screenshot for ${activeStep.title}`}
                onDoubleClick={() => openExpandedStep(activeStepIndex)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openExpandedStep(activeStepIndex);
                  }
                }}
                className="group relative overflow-hidden border border-gray-800 bg-black/30 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
              >
                <Image
                  src={activeStep.screenshot}
                  alt={activeStep.screenshotAlt}
                  width={activeStep.screenshotWidth}
                  height={activeStep.screenshotHeight}
                  className="h-auto w-full"
                  sizes="(min-width: 1024px) 370px, calc(100vw - 64px)"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openExpandedStep(activeStepIndex);
                  }}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-950/90 text-white opacity-100 transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Expand ${activeStep.title} screenshot`}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                <Maximize2 className="h-3.5 w-3.5 text-[#E91E8C]" />
                Double-click the screenshot to enlarge it
              </p>
              <p className="mt-4 text-sm font-semibold text-white">{activeStep.previewDetail}</p>
              <div className="mt-3 border border-blue-500/30 bg-blue-950/20 p-3 text-sm leading-relaxed text-blue-100">
                {activeStep.previewAction}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => moveStep(-1)}
                disabled={activeStepIndex === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-950 text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous install step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5" aria-hidden="true">
                {installSteps.map((step, index) => (
                  <span
                    key={step.title}
                    className={`h-1.5 w-6 rounded-full ${index === activeStepIndex ? 'bg-[#E91E8C]' : 'bg-gray-700'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => moveStep(1)}
                disabled={activeStepIndex === installSteps.length - 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-950 text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next install step"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex gap-3 border border-emerald-500/25 bg-emerald-950/15 p-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-white">Make your first GIF</p>
                <p className="text-sm text-gray-400">Open a supported YouTube video and use the YTgify button in the player.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expandedStep && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Manual install screenshot carousel"
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/[0.82] px-4 py-4 backdrop-blur-sm lg:items-center lg:py-6"
          onClick={() => setExpandedStepIndex(null)}
        >
          <div
            className="relative flex w-full max-w-6xl flex-col border border-gray-800 bg-gray-950 shadow-2xl lg:grid lg:max-h-[92svh] lg:grid-cols-[1.45fr_0.55fr] lg:overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-0 flex-col border-b border-gray-800 bg-[#080c14] lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
                <p className="text-sm font-semibold text-white">Step {expandedStepOrdinal} of {installSteps.length}</p>
                <button
                  type="button"
                  onClick={() => setExpandedStepIndex(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-950 text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900"
                  aria-label="Close screenshot carousel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex min-h-0 max-h-[42svh] flex-1 items-center justify-center p-4 lg:max-h-none">
                <Image
                  src={expandedStep.screenshot}
                  alt={expandedStep.screenshotAlt}
                  width={expandedStep.screenshotWidth}
                  height={expandedStep.screenshotHeight}
                  className="max-h-[34svh] w-full object-contain lg:max-h-[68svh] lg:w-auto"
                  sizes="(min-width: 1024px) 760px, calc(100vw - 48px)"
                  priority
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gray-800 px-4 py-3">
                <button
                  type="button"
                  onClick={() => moveExpandedStep(-1)}
                  aria-label="Previous screenshot"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900 sm:px-4"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <div className="flex gap-1.5" aria-hidden="true">
                  {installSteps.map((step, index) => (
                    <span
                      key={step.title}
                      className={`h-1.5 w-5 rounded-full sm:w-7 ${index === expandedStepIndex ? 'bg-[#E91E8C]' : 'bg-gray-700'}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => moveExpandedStep(1)}
                  aria-label="Next screenshot"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900 sm:px-4"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6 p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E91E8C]">
                  Manual install
                </p>
                <h5 className="mt-3 text-2xl font-bold text-white">{expandedStep.previewTitle}</h5>
                <p className="mt-4 text-sm leading-relaxed text-gray-300">{expandedStep.previewDetail}</p>
                <div className="mt-5 border border-blue-500/30 bg-blue-950/20 p-4 text-sm leading-relaxed text-blue-100">
                  {expandedStep.previewAction}
                </div>
              </div>
              <div className="grid gap-2">
                {installSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => {
                        setExpandedStepIndex(index);
                        setActiveStepIndex(index);
                      }}
                      className={`flex items-center gap-3 border p-3 text-left text-sm transition-colors ${
                        index === expandedStepIndex
                          ? 'border-[#E91E8C]/70 bg-[#E91E8C]/10 text-white'
                          : 'border-gray-800 bg-gray-900/35 text-gray-400 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white">
                        <Icon className="h-4 w-4 text-[#E91E8C]" />
                      </span>
                      <span>{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
