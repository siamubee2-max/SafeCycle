import React from 'react';
import { LayoutGrid, BookOpen, TrendingUp } from 'lucide-react';

const BottomNav = ({ currentTab, setCurrentTab, t }: { currentTab: string, setCurrentTab: (tab: string) => void, t: any }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: t.navDashboard },
    { id: 'journal', icon: BookOpen, label: t.navJournal },
    { id: 'insights', icon: TrendingUp, label: t.navInsights },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-3 pb-8 px-4 bg-surface/80 backdrop-blur-xl shadow-[0px_-10px_40px_rgba(27,28,26,0.06)] rounded-t-3xl">
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        const Icon = item.icon;
        return (
          <button 
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-[#4ade80] bg-primary/5 rounded-xl px-4 py-2' : 'text-outline hover:text-primary'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
            <span className={`font-sans text-[10px] font-medium tracking-wider uppercase ${isActive ? 'text-primary' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
