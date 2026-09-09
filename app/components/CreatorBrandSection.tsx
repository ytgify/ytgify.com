import { BookOpen, Bug, Github, Search, Layers, Landmark, UserRound } from 'lucide-react';
import { GITHUB_REPO_URL } from '@/lib/constants';

const primaryLinks = [
  {
    href: 'https://neonwatty.com/posts/ytgify-launch/',
    label: 'Read the build notes',
    description: 'The launch story, traction, and how YTgify was built.',
    icon: BookOpen,
  },
  {
    href: GITHUB_REPO_URL,
    label: 'View the source',
    description: 'Open-source extension code, tests, and architecture.',
    icon: Github,
  },
];

const projectLinks = [
  {
    href: 'https://github.com/mean-weasel/bugdrop',
    label: 'BugDrop',
    description: 'Turn in-app feedback into GitHub Issues, with screenshots and annotations.',
    icon: Bug,
  },
  {
    href: 'https://github.com/meme-search/meme-search',
    label: 'Meme Search',
    description: 'An open-source meme search engine. Free to run on your own machine.',
    icon: Search,
  },
  {
    href: 'https://lineagehq.github.io/lineage/',
    label: 'Lineage',
    description: 'A shared visual workspace for people and AI agents to shape creative work together.',
    icon: Layers,
  },
  {
    href: 'https://debtisfun.com/',
    label: 'Debt Is Fun',
    description: 'Explore university debt and endowments through interactive comparisons and shareable cards.',
    icon: Landmark,
  },
];

export default function CreatorBrandSection() {
  return (
    <section aria-labelledby="about-builder" className="py-12 sm:py-16">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#E91E8C]/30 bg-gradient-to-br from-[#E91E8C]/20 to-[#7B2FBE]/20">
              <UserRound className="h-5 w-5 text-[#E91E8C]" />
            </div>
            <h1 id="about-builder" className="text-3xl font-bold text-white sm:text-4xl">
              About the Builder
            </h1>
          </div>

          <p className="mb-6 text-lg leading-relaxed text-gray-300">
            YTgify is one of{' '}
            <a
              href="https://neonwatty.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-[#E91E8C] decoration-2 underline-offset-4 transition-colors hover:text-[#E91E8C]"
            >
              Jeremy Watt&apos;s
            </a>{' '}
            small media and automation projects. For the full context, read the launch notes or browse the source.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {primaryLinks.map(({ href, label, description, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-800 bg-gray-950/70 p-4 transition-colors hover:border-[#E91E8C]/70 hover:bg-gray-900"
              >
                <span className="flex items-center gap-2 font-semibold text-white">
                  <Icon className="h-4 w-4 text-[#E91E8C]" />
                  {label}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-gray-400">{description}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">More projects</h2>
              <p className="mt-2 leading-relaxed text-gray-400">
                Apps, writing, and open-source work from the same builder.
              </p>
            </div>
          </div>

          <a
            href="https://neonwatty.com/projects/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 inline-block text-sm font-semibold text-[#E91E8C] hover:underline"
          >
            Browse all projects →
          </a>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projectLinks.map(({ href, label, description, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-lg border border-gray-800 bg-[#111111]/80 p-4 transition-colors hover:border-[#E91E8C]/60 hover:bg-[#161616]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-[#E91E8C] group-hover:border-[#E91E8C]/50">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-white">{label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-400">{description}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
