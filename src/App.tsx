import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from './translations';
import { secureStorage } from './utils/crypto';

import OnboardingScreen from './components/OnboardingScreen';
import DashboardScreen from './components/DashboardScreen';
import JournalScreen from './components/JournalScreen';
import InsightsScreen from './components/InsightsScreen';
import BottomNav from './components/BottomNav';

/** Detect the device/browser locale and map to a supported Language code. */
function detectSystemLanguage(): Language {
  const supported: Language[] = ['en', 'fr', 'es', 'de', 'ja', 'pt', 'it'];
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const locale of locales) {
    const lang = locale.split('-')[0].toLowerCase() as Language;
    if (supported.includes(lang)) return lang;
  }
  return 'en';
}

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null); // null = loading
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [lang, setLang] = useState<Language>(detectSystemLanguage);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [entries, setEntries] = useState<Record<string, any>>({});
  const entriesInitialized = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      // Check onboarding
      const onboarded = localStorage.getItem('sc_onboarded');
      setHasOnboarded(onboarded === 'true');

      // Load encrypted entries
      try {
        const saved = await secureStorage.getItem('journal_entries');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setEntries(parsed);
          }
        }
      } catch {
        // Corrupted data — start fresh
      }
      entriesInitialized.current = true;
    };
    loadState();
  }, []);

  // Persist encrypted entries on every change (skip initial empty state before load)
  useEffect(() => {
    if (!entriesInitialized.current) return;
    secureStorage.setItem('journal_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = translations[lang];

  const handleDeleteAllData = async () => {
    setEntries({});
    secureStorage.clearAppData();
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('sc_onboarded', 'true');
    setHasOnboarded(true);
  };

  // Still loading persisted state — show minimal splash
  if (hasOnboarded === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} t={t} currentLang={lang} setLang={setLang} />;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-fixed selection:text-primary">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentTab === 'dashboard' && <DashboardScreen t={t} currentLang={lang} setLang={setLang} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} entries={entries} onDeleteAllData={handleDeleteAllData} />}
          {currentTab === 'journal' && <JournalScreen t={t} currentLang={lang} setLang={setLang} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} entries={entries} setEntries={setEntries} onDeleteAllData={handleDeleteAllData} />}
          {currentTab === 'insights' && <InsightsScreen t={t} currentLang={lang} setLang={setLang} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} entries={entries} onDeleteAllData={handleDeleteAllData} />}
        </motion.div>
      </AnimatePresence>
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} t={t} />
    </div>
  );
}
