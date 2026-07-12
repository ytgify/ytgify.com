import { Metadata } from 'next';
import SiteFooter from '../components/SiteFooter';
import ShareContent from './ShareContent';

export const metadata: Metadata = {
  title: "Your Corner of YouTube, All GIF'd Up - YTgify",
  description: "GIFs you won't find anywhere else. Made by the YouTube-obsessed.",
};

export default function SharePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-pattern flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6">
        <ShareContent />
      </main>

      <SiteFooter />
    </div>
  );
}
