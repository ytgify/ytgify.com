'use client';

import EmailCaptureForm from '../components/EmailCaptureForm';

export default function ShareContent() {
  return (
    <div className="max-w-2xl text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      <p className="text-gray-500 text-sm tracking-widest uppercase mb-8 relative">YTgify</p>
      <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-[1.1] relative">
        Your corner of YouTube.
        <br />
        <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          All GIF&apos;d up.
        </span>
      </h1>
      <p className="text-gray-400 text-xl mb-12 max-w-md mx-auto relative">
        GIFs you won&apos;t find anywhere else. Made by the YouTube-obsessed.
      </p>
      <div className="relative max-w-md mx-auto">
        <EmailCaptureForm
          source="share_page"
          buttonText="Join the Waitlist"
          successMessage="You're on the list!"
          placeholder="you@example.com"
        />
      </div>
      <p className="text-gray-600 text-sm mt-6 relative">No spam. We&apos;ll only email you when sharing launches.</p>
    </div>
  );
}
