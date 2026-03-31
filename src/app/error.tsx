'use client';

import { useEffect } from 'react';
import { Button } from '@/components/Button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#C17B7B]/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-[#C17B7B]" />
        </div>
        <h1 className="text-2xl font-serif text-[#2D2A26] mb-2">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="text-[#6B6560] mb-6">
          Une erreur inattendue s&apos;est produite. Veuillez réessayer.
        </p>
        {error.digest && (
          <p className="text-xs text-[#6B6560] mb-6 font-mono">
            Erreur: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="mx-auto">
          Réessayer
        </Button>
      </div>
    </div>
  );
}