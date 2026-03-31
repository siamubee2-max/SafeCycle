'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[#2D2A26]">
          {label}
        </label>
      )}
      <input
        className={`w-full h-12 px-4 bg-white border border-[#EDE8E0] rounded-lg text-[#2D2A26] placeholder-[#6B6560] transition-colors focus:outline-none focus:border-[#C4A77D] focus:ring-1 focus:ring-[#C4A77D] ${
          error ? 'border-[#C17B7B] focus:border-[#C17B7B] focus:ring-[#C17B7B]' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-[#C17B7B]">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[#2D2A26]">
          {label}
        </label>
      )}
      <textarea
        className={`w-full min-h-[100px] px-4 py-3 bg-white border border-[#EDE8E0] rounded-lg text-[#2D2A26] placeholder-[#6B6560] transition-colors focus:outline-none focus:border-[#C4A77D] focus:ring-1 focus:ring-[#C4A77D] resize-none ${
          error ? 'border-[#C17B7B] focus:border-[#C17B7B] focus:ring-[#C17B7B]' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-[#C17B7B]">{error}</p>
      )}
    </div>
  );
}
