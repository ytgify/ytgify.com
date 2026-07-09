import { BookOpen, ClipboardCheck, Github, Mic2, Scissors, TicketCheck, UserRound } from 'lucide-react';

const primaryLinks = [
  {
    href: 'https://neonwatty.com/posts/ytgify-launch/',
    label: 'Read the build notes',
    description: 'The launch story, traction, and how YTgify was built.',
    icon: BookOpen,
  },
  {
    href: 'https://github.com/neonwatty/ytgify',
    label: 'View the source',
    description: 'Open-source extension code, tests, and architecture.',
    icon: Github,
  },
];

const projectLinks = [
  {
    href: 'https://neonwatty.com/',
    label: 'neonwatty.com',
    description: 'Writing, product notes, and project history.',
    icon: BookOpen,
  },
  {
    href: 'https://bleepthat.sh/',
    label: 'Bleep That',
    description: 'A current media workflow from Jeremy Watt.',
    icon: Scissors,
  },
  {
    href: 'https://seatify.app/',
    label: 'Seatify',
    description: 'Another live app from the same builder bench.',
    icon: TicketCheck,
  },
  {
    href: 'https://deckchecker.app/',
    label: 'DeckChecker',
    description: 'Slide-deck compliance and submission tracking for events.',
    icon: ClipboardCheck,
  },
  {
    href: 'https://sayfoil.com/',
    label: 'Foil',
    description: 'Voice-to-paste dictation for real Mac workflows.',
    icon: Mic2,
  },
  {
    href: 'https://github.com/neonwatty',
    label: 'GitHub',
    description: 'More open-source projects and experiments.',
    icon: Github,
  },
];

export default function CreatorBrandSection() {
  return (
    <section id="also-by-jeremy" className="scroll-mt-8 grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-12 items-start py-14 mb-16 border-y border-gray-900">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#E91E8C]/20 to-[#7B2FBE]/20 border border-[#E91E8C]/30 flex items-center justify-center">
            <UserRound className="w-5 h-5 text-[#E91E8C]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Also by Jeremy</h2>
        </div>

        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          YTgify is one of Jeremy Watt&apos;s small media and automation projects. For the full context, read the launch notes or browse the source.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {primaryLinks.map(({ href, label, description, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-800 bg-gray-950/70 p-4 hover:border-[#E91E8C]/70 hover:bg-gray-900 transition-colors"
            >
              <span className="flex items-center gap-2 text-white font-semibold">
                <Icon className="w-4 h-4 text-[#E91E8C]" />
                {label}
              </span>
              <span className="block text-sm text-gray-400 mt-2 leading-relaxed">{description}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">More to Explore</h2>
            <p className="text-gray-400 leading-relaxed mt-2">
              Apps, writing, and open-source work from the same builder.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projectLinks.map(({ href, label, description, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-lg border border-gray-800 bg-[#111111]/80 p-4 hover:border-[#E91E8C]/60 hover:bg-[#161616] transition-colors"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-[#E91E8C] group-hover:border-[#E91E8C]/50">
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-white font-semibold">{label}</span>
                <span className="block text-sm text-gray-400 mt-1 leading-relaxed">{description}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
