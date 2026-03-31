import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#EDE8E0] flex items-center justify-center mx-auto mb-6">
          <Home size={32} className="text-[#6B6560]" />
        </div>
        <h1 className="text-2xl font-serif text-[#2D2A26] mb-2">
          Page introuvable
        </h1>
        <p className="text-[#6B6560] mb-6">
          La page que vous recherchez n&apos;existe pas.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#C4A77D] text-white rounded-lg hover:bg-[#B39668] transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}