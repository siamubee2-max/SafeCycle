import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sun, Moon, X, User, Settings, Download, LogOut } from 'lucide-react';
import { Language } from '../translations';
import SettingsModal from './SettingsModal';

const TopBar = ({ title, showProfile = true, currentLang, setLang, t, isDarkMode, setIsDarkMode, entries, onDeleteAllData }: { title: string, showProfile?: boolean, currentLang: Language, setLang: (lang: Language) => void, t: any, isDarkMode: boolean, setIsDarkMode: (dark: boolean) => void, entries?: Record<string, any>, onDeleteAllData?: () => Promise<void> | void }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleExportData = () => {
    if (!entries) return;
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "safecycle_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex justify-between items-center px-6 py-4 w-full bg-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Shield className="text-primary w-6 h-6" strokeWidth={1.5} />
          <h1 className="font-serif text-xl font-bold text-primary tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={currentLang} 
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-transparent text-primary font-sans text-sm outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
            <option value="de">DE</option>
            <option value="ja">JA</option>
            <option value="pt">PT</option>
            <option value="it">IT</option>
          </select>
          {showProfile && (
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-full overflow-hidden bg-surface-low border border-outline-variant/20 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
                alt="User Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 right-6 w-80 bg-surface-lowest border border-outline-variant/20 rounded-3xl shadow-2xl z-[70] overflow-hidden editorial-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
                      alt="User Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button onClick={() => setIsProfileOpen(false)} aria-label={t.close || 'Close'} className="p-2 bg-surface-low rounded-full text-outline hover:text-primary transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-serif text-2xl text-primary mb-1">Jane Doe</h3>
                <p className="font-sans text-sm text-on-surface-variant mb-6">jane.doe@example.com</p>
                
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-low transition-colors text-primary font-sans text-sm cursor-pointer">
                    <User className="w-4 h-4" />
                    {t.personalDetails}
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-low transition-colors text-primary font-sans text-sm cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    {t.settings}
                  </button>
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-low transition-colors text-primary font-sans text-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      {isDarkMode ? t.darkMode : t.lightMode}
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-outline-variant'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`}></span>
                    </div>
                  </button>
                  <button 
                    onClick={handleExportData}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-low transition-colors text-primary font-sans text-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {t.exportData || "Export Data"}
                  </button>
                  <div className="h-px w-full bg-outline-variant/30 my-2"></div>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-error/10 text-error transition-colors font-sans text-sm cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    {t.signOut}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        t={t} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        currentLang={currentLang} 
        setLang={setLang} 
        entries={entries}
        onDeleteAllData={onDeleteAllData}
      />
    </>
  );
};

export default TopBar;
