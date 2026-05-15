import Link from 'next/link';
import { Jebena } from '@/lib/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-espresso flex flex-col items-center justify-center text-center px-6">
      <div className="animate-pulse-glow mb-6">
        <Jebena size={80} color="#D4845A" />
      </div>
      <h1 className="font-display text-6xl text-cream font-bold mb-3">404</h1>
      <p className="text-cream/70 text-lg mb-8">This page wandered off into the coffee fields.</p>
      <Link
        href="/"
        className="btn btn-primary"
      >
        Back to Home
      </Link>
    </div>
  );
}
