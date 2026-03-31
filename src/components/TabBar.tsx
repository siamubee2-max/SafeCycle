'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react';
import { TRANSLATIONS } from '@/lib/constants';

const tabs = [
  { href: '/', icon: Home, labelKey: 'home' as const },
  { href: '/journal', icon: BookOpen, labelKey: 'journal' as const },
  { href: '/statistics', icon: BarChart3, labelKey: 'stats' as const },
  { href: '/settings', icon: Settings, labelKey: 'settings' as const },
];

export function TabBar() {
  const pathname = usePathname();
  const t = TRANSLATIONS.fr;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE8E0] z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-[#C4A77D]' : 'text-[#6B6560]'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-xs font-medium">{t.tabs[tab.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
