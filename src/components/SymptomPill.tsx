'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SymptomPillProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function SymptomPill({ label, selected, onToggle }: SymptomPillProps) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        selected 
          ? 'bg-[#E8D5C4] text-[#2D2A26]' 
          : 'bg-[#EDE8E0] text-[#6B6560]'
      }`}
    >
      {selected && <X size={14} />}
      {label}
    </button>
  );
}

interface SymptomGridProps {
  symptoms: string[];
  selected: string[];
  onToggle: (symptom: string) => void;
}

export function SymptomGrid({ symptoms, selected, onToggle }: SymptomGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {symptoms.map(symptom => (
        <SymptomPill
          key={symptom}
          label={symptom}
          selected={selected.includes(symptom)}
          onToggle={() => onToggle(symptom)}
        />
      ))}
    </div>
  );
}
