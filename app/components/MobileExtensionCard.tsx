import { ArrowRight, Monitor } from 'lucide-react';
import { TrackedExtensionLink } from './ExtensionAnalytics';
import SaveExtensionForLater from './SaveExtensionForLater';

export default function MobileExtensionCard() {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-4">
      <div className="flex items-start gap-3">
        <Monitor className="mt-0.5 h-6 w-6 shrink-0 text-[#ff75bd]" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ff75bd]">YouTube</p>
          <h2 className="mt-1 text-lg font-bold text-white">Clip from YouTube</h2>
          <p className="mt-1 text-sm leading-5 text-gray-400">Use the extension inside Chrome on your computer.</p>
          <TrackedExtensionLink
            href="#install"
            surface="home_hero"
            cta="jump_to_install_section"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline decoration-[#E91E8C] underline-offset-4"
          >
            See desktop setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TrackedExtensionLink>
          <SaveExtensionForLater />
        </div>
      </div>
    </div>
  );
}
