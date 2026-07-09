export default function DiscontinuationNotice() {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 sm:p-5 mb-14">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[0.72fr_1.28fr] gap-3 lg:gap-8 flex-1">
          <h3 className="text-lg font-bold text-red-200">Removed from the Chrome Web Store</h3>
          <div className="text-sm sm:text-base text-gray-300 leading-relaxed">
            <p className="mb-3">
              After 8 months in the Chrome Web Store and being a featured extension for 4 months, Google informed us that YTgify violates their terms of service regarding the transformation of YouTube video frames into GIFs.
            </p>
            <p>
              You can still use YTgify by installing it locally. The source, build notes, and last local install remain available below.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LegacyInstallSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-8 lg:gap-10 rounded-2xl border border-gray-800 bg-gray-900/40 p-5 sm:p-6 lg:p-8 mb-8">
      <div>
        <h3 className="text-3xl font-bold text-white mb-4">Local Chrome Install</h3>

        <p className="text-gray-300 leading-relaxed mb-6">
          You can install YTgify as an unpacked Chrome extension. This direct install will not auto-update through the Chrome Web Store.
        </p>

        <div>
          <a
            href="/downloads/ytgify-v1.0.19-chrome.zip"
            download
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download YTgify v1.0.19
          </a>
          <p className="text-gray-500 text-sm mt-2">Chrome ZIP file, ~330 KB</p>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-200 text-sm leading-relaxed">
            <strong>Note:</strong> Unpacked extensions won&apos;t auto-update. For current work, follow{' '}
            <a href="https://x.com/neonwatty" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">Jeremy on X/Twitter</a>
            {' '}or visit{' '}
            <a href="https://neonwatty.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">neonwatty.com</a>.
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Installation Steps</h4>

        <ol className="space-y-4 text-gray-300">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
            <div>
              <p className="font-medium text-white">Download and extract the ZIP file</p>
              <p className="text-gray-400 text-sm">Extract the downloaded ZIP to a folder on your computer.</p>
            </div>
          </li>

        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
          <div>
            <p className="font-medium text-white">Open Chrome Extensions</p>
            <p className="text-gray-400 text-sm">
              Go to <code className="bg-gray-800 px-2 py-0.5 rounded text-blue-300">chrome://extensions</code> in your browser, or click Menu &gt; More Tools &gt; Extensions.
            </p>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
          <div>
            <p className="font-medium text-white">Enable Developer Mode</p>
            <p className="text-gray-400 text-sm">Toggle the &ldquo;Developer mode&rdquo; switch in the top-right corner of the extensions page.</p>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
          <div>
            <p className="font-medium text-white">Load the extension</p>
            <p className="text-gray-400 text-sm">Click &ldquo;Load unpacked&rdquo; and select the folder where you extracted YTgify.</p>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</span>
          <div>
            <p className="font-medium text-white">Done</p>
            <p className="text-gray-400 text-sm">Go to YouTube and you&apos;ll see the YTgify button on supported videos.</p>
          </div>
        </li>
      </ol>
      </div>
    </section>
  );
}
