'use client';

import React from 'react';
import { FlowIntensity } from '@/lib/types';
import { TRANSLATIONS, FLOW_COLORS } from '@/lib/constants';

interface FlowSelectorProps {
  value: FlowIntensity;
  onChange: (flow: FlowIntensity) => void;
}

const flows: FlowIntensity[] = ['none', 'spotting', 'light', 'medium', 'heavy'];

export function FlowSelector({ value, onChange }: FlowSelectorProps) {
  const t = TRANSLATIONS.fr;
  
  return (
    <div className="flex gap-2">
      {flows.map(flow => (
        <button
          key={flow}
          onClick={() => onChange(flow)}
          className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all ${
            value === flow 
              ? 'bg-[#C4A77D] text-white' 
              : 'bg-[#EDE8E0] text-[#6B6560] hover:bg-[#E8D5C4]'
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ 
                backgroundColor: value === flow ? 'white' : FLOW_COLORS[flow],
                opacity: flow === 'none' ? 0.3 : 1,
              }}
            />
            <span className="text-xs">{t.flow[flow]}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
