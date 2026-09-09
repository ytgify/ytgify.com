'use client';
import Link from 'next/link';
import StudioApp from '../studio/StudioApp';
import { useScreenRecorder } from './useScreenRecorder';
import { useCaptureSupport } from './useCaptureSupport';

export default function ScreenRecorder() {
  const capture = useScreenRecorder();
  const supported = useCaptureSupport();
  return (
    <main data-ph-no-capture>
      <section className="mx-auto max-w-3xl space-y-5 px-5 py-12 text-white">
        <Link href="/" className="font-bold">
          YTgify
        </Link>
        <p className="text-sm text-[#9ff3ea]">Experimental tool</p>
        <h1 className="text-4xl font-bold">Record Your Screen to GIF</h1>
        <p className="text-gray-300">
          Choose a tab, window, or screen, record a short clip, then trim and export an animated GIF. Your recording
          stays in this browser. No account, upload, or watermark.
        </p>
        <p className="text-sm text-gray-400">
          Desktop browsers with screen-sharing support only. Recording stops after 30 seconds; the GIF editor supports
          up to 10 seconds. Audio is not recorded. Share only the content you intend to capture.
        </p>
        {capture.status === 'recording' ? (
          <button onClick={capture.stop} className="rounded-xl bg-red-700 px-6 py-3 font-semibold">
            Stop recording
          </button>
        ) : (
          <button
            disabled={!supported || capture.status === 'choosing' || capture.status === 'finalizing'}
            onClick={() => void capture.start()}
            className="rounded-xl bg-[#9ff3ea] px-6 py-3 font-semibold text-gray-950 disabled:opacity-50"
          >
            {capture.status === 'ready' ? 'Record another clip' : 'Start screen recording'}
          </button>
        )}
        <p role="status">
          {capture.status === 'finalizing'
            ? 'Preparing your recording for editing…'
            : capture.status === 'choosing'
              ? 'Choose a source in your browser’s sharing dialog.'
              : capture.status === 'recording'
                ? `Recording… ${capture.elapsed}s / 30s. Stop when you have your clip.`
                : capture.status === 'ready'
                  ? 'Recording stopped. Trim and create your GIF below.'
                  : ''}
        </p>
        {!supported ? (
          <p className="text-amber-200">
            Screen capture is unavailable here. Open a desktop browser with screen-sharing support, or upload an
            existing recording below.
          </p>
        ) : null}
        {capture.error ? (
          <p role="alert" className="text-red-300">
            {capture.error}
          </p>
        ) : null}
        <p className="text-sm">
          <Link className="underline" href="/video-to-gif">
            Already have a recording? Upload it to Video to GIF.
          </Link>
        </p>
      </section>
      {capture.file ? <StudioApp embedded key={capture.file.lastModified} initialFile={capture.file} /> : null}
    </main>
  );
}
