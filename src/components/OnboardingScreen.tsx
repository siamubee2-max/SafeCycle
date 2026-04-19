import React from 'react';
import { Shield, Key, Droplet, BrainCircuit, CalendarDays, Leaf, ArrowRight } from 'lucide-react';
import { Language } from '../translations';

const OnboardingScreen = ({ onComplete, t, currentLang, setLang }: { onComplete: () => void, t: any, currentLang: Language, setLang: (lang: Language) => void }) => {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 max-w-5xl mx-auto">
      <header className="w-full flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <Shield className="text-primary w-8 h-8" strokeWidth={1.5} />
          <h1 className="font-serif text-2xl font-bold tracking-tight text-primary">{t.appTitle}</h1>
        </div>
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
      </header>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full mb-20">
        <div className="md:col-span-7">
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-outline mb-4 block">{t.privateSanctuary}</span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold leading-tight text-primary mb-6 whitespace-pre-line">
            {t.onboardingTitle}
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg font-sans">
            {t.onboardingDesc}
          </p>
        </div>
        
        <div className="md:col-span-5 relative flex justify-center">
          <div className="relative w-64 h-80 bg-surface-low ovoid-shape flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5"></div>
            <div className="relative z-10 flex flex-col items-center">
              <Key className="text-primary w-16 h-16 mb-4" strokeWidth={1} />
              <div className="w-32 h-1 bg-primary/20 rounded-full mb-2"></div>
              <div className="w-24 h-1 bg-primary/10 rounded-full"></div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary-container/30 rounded-full blur-2xl"></div>
        </div>
      </section>

      <section className="w-full mb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h3 className="font-serif text-2xl text-primary">{t.definePath}</h3>
            <p className="text-outline text-sm font-medium font-sans mt-2">{t.personalizeInterface}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Droplet, title: t.pcos, desc: t.pcosDesc },
            { icon: BrainCircuit, title: t.endo, desc: t.endoDesc },
            { icon: CalendarDays, title: t.contra, desc: t.contraDesc },
            { icon: Leaf, title: t.balance, desc: t.balanceDesc }
          ].map((item, i) => (
            <button key={i} className="group relative flex flex-col p-8 bg-surface-low rounded-xl text-left transition-all hover:bg-surface-lowest editorial-shadow focus:ring-2 focus:ring-primary/20">
              <item.icon className="text-secondary w-8 h-8 mb-12 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <h4 className="font-serif text-xl text-primary mb-2">{item.title}</h4>
              <p className="text-on-surface-variant text-sm font-sans">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl flex flex-col items-center text-center mt-auto">
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary font-medium">
            <Shield className="w-4 h-4" strokeWidth={2} />
            <span className="font-sans text-xs tracking-wider uppercase">{t.zkActive}</span>
          </div>
          <p className="text-on-surface-variant text-sm font-sans">
            {t.zkDesc}
          </p>
        </div>
        <button 
          onClick={onComplete}
          className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-full font-sans font-bold text-lg flex items-center justify-center gap-4 shadow-[0px_10px_40px_rgba(0,54,52,0.15)] hover:scale-[1.02] active:scale-95 transition-all"
        >
          {t.startSecurely}
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="mt-8 text-outline text-xs font-sans">
          {t.noAccount}
        </p>
      </section>
    </div>
  );
};

export default OnboardingScreen;
