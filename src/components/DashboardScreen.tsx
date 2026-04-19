import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Leaf, Sun, Moon, TrendingUp, Utensils, X } from 'lucide-react';
import { Language } from '../translations';
import { calculateCurrentPhase, getDaysRemainingInCycle } from '../utils/cyclePhase';
import { recipePlanTranslations } from '../recipes';
import TopBar from './TopBar';

const DashboardScreen = ({ t, currentLang, setLang, isDarkMode, setIsDarkMode, entries, onDeleteAllData }: { t: any, currentLang: Language, setLang: (lang: Language) => void, isDarkMode: boolean, setIsDarkMode: (dark: boolean) => void, entries: Record<string, any>, onDeleteAllData: () => Promise<void> | void }) => {
  const [showRecipePlan, setShowRecipePlan] = useState(false);
  const recipePlan = recipePlanTranslations[currentLang] || recipePlanTranslations['en'];

  // Real cycle data
  const currentPhase = calculateCurrentPhase(entries);
  const daysLeft = getDaysRemainingInCycle(entries);
  const todayFormatted = new Intl.DateTimeFormat(currentLang, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  // Phase label and icon
  const phaseLabels: Record<string, string> = {
    menstrual: t.phaseMenstrualShort || t.phaseMenstrual || 'Menstrual',
    follicular: t.phaseFollicularShort || t.phaseFollicular || 'Follicular',
    ovulatory: t.phaseOvulatoryShort || t.phaseOvulatory || 'Ovulatory',
    luteal: t.phaseLutealShort || t.phaseLuteal || 'Luteal',
  };
  const phaseLabel = phaseLabels[currentPhase];

  // Day in cycle (for welcome heading)
  const dayInCycle = Math.max(1, 28 - daysLeft + 1);
  const welcomeMsg = typeof t.welcomeBack === 'string'
    ? t.welcomeBack.replace(/\d+/, String(dayInCycle))
    : String(t.welcomeBack);

  return (
    <div className="pb-32">
      <TopBar title={t.appTitle} currentLang={currentLang} setLang={setLang} t={t} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} entries={entries} onDeleteAllData={onDeleteAllData} />
      <main className="max-w-4xl mx-auto px-6 pt-8">
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-outline mb-2 block">{t.currentStatus}</span>
              <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight whitespace-pre-line">{welcomeMsg}</h2>
            </div>
            <div className="text-left md:text-right">
              <p className="font-sans text-sm text-outline uppercase tracking-widest capitalize">{todayFormatted}</p>
            </div>
          </div>
        </section>

        <section className="flex justify-center mb-16 relative">
          <div className="relative w-72 h-80 bg-gradient-to-br from-primary-fixed to-[#8cbdba] ovoid-shape-cycle editorial-shadow flex flex-col items-center justify-center text-primary transition-transform active:scale-95 duration-500">
            <span className="font-sans text-xs uppercase tracking-widest opacity-70 mb-3">{t.phase}</span>
            <div className="flex items-center gap-2.5 bg-white/30 px-5 py-2 rounded-full backdrop-blur-sm border border-white/40 shadow-sm">
              {currentPhase === 'menstrual' && <Droplet className="w-5 h-5 text-primary" strokeWidth={2} />}
              {currentPhase === 'follicular' && <Leaf className="w-5 h-5 text-primary" strokeWidth={2} />}
              {currentPhase === 'ovulatory' && <Sun className="w-5 h-5 text-primary" strokeWidth={2} />}
              {currentPhase === 'luteal' && <Moon className="w-5 h-5 text-primary" strokeWidth={2} />}
              <p className="font-serif text-2xl font-bold">{phaseLabel}</p>
            </div>
            <div className="mt-6 flex flex-col items-center">
              <span className="text-5xl font-serif italic">{daysLeft}</span>
              <span className="font-sans text-[10px] uppercase tracking-widest mt-1">{t.daysRemaining}</span>
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/30 backdrop-blur-xl rounded-full"></div>
            <div className="absolute bottom-10 -left-6 w-20 h-20 bg-secondary-container/20 backdrop-blur-lg rounded-full"></div>
          </div>
        </section>

        <section className="mb-16 max-w-xl mx-auto text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-secondary-container/30 text-secondary font-sans text-[10px] uppercase tracking-widest mb-6">{t.dailyInsight}</div>
          <p className="font-serif text-2xl text-on-surface leading-relaxed italic">
            {t.dailyInsightText}
          </p>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg text-primary">{t.weeklySnapshot}</h3>
            <span className="font-sans text-[10px] uppercase tracking-widest text-outline">{t.slideExplore}</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x">
            {[
              { day: t.mon, icon: Sun, label: t.highEnergy, active: false },
              { day: t.today, icon: Moon, label: t.resting, active: true },
              { day: t.wed, icon: Droplet, label: t.mindful, active: false },
              { day: t.thu, icon: Droplet, label: t.hydrated, active: false },
              { day: t.fri, icon: Droplet, label: t.rising, active: false },
            ].map((item, i) => (
              <div key={i} className={`snap-start min-w-[140px] p-5 rounded-2xl flex flex-col items-center transition-colors ${item.active ? 'bg-surface-lowest editorial-shadow border border-primary/5' : 'bg-surface-low hover:bg-surface-lowest'}`}>
                <span className={`font-sans text-[10px] uppercase tracking-widest mb-4 ${item.active ? 'text-primary font-bold' : 'text-outline'}`}>{item.day}</span>
                <item.icon className={`w-6 h-6 mb-3 ${item.active ? 'text-secondary' : 'text-primary'}`} strokeWidth={1.5} />
                <span className="font-sans text-xs font-semibold text-primary">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-primary-container text-white p-8 rounded-[32px] relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-serif text-xl mb-2">{t.cycleTrends}</h4>
              <p className="font-sans text-sm opacity-80 mb-6">{t.cycleTrendsDesc}</p>
              <button className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest">{t.viewDetails}</button>
            </div>
            <TrendingUp className="absolute -bottom-4 -right-4 text-white/5 w-48 h-48 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
          </div>
          <div className="bg-surface-low text-on-surface p-8 rounded-[32px] relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-serif text-xl mb-2 text-primary">{t.nutritionalFocus}</h4>
              <p className="font-sans text-sm text-on-surface-variant mb-4">{t.nutritionalFocusDesc}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">{t.foodSpinach}</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">{t.foodLentils}</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">{t.foodDarkChoc}</span>
              </div>

              <button 
                onClick={() => setShowRecipePlan(true)}
                className="bg-primary/5 hover:bg-primary/10 text-primary transition-colors px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-semibold"
              >
                {t.exploreRecipes}
              </button>
            </div>
            <Utensils className="absolute -bottom-4 -right-4 text-primary/5 w-48 h-48 group-hover:rotate-12 transition-transform duration-700" strokeWidth={1} />
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showRecipePlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRecipePlan(false)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-surface text-on-surface w-full max-w-2xl rounded-[32px] p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20 -z-10"></div>
              
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h3 className="font-serif text-2xl text-primary mb-2">{recipePlan.title}</h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    {recipePlan.desc}
                  </p>
                </div>
                <button 
                  onClick={() => setShowRecipePlan(false)}
                  className="p-2 bg-surface-low rounded-full hover:bg-surface-high transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {/* Menstrual Phase */}
                <div>
                  <h4 className="font-sans font-bold text-rose-800 dark:text-rose-300 mb-4 sticky top-0 bg-surface/90 backdrop-blur-sm py-2 z-10 border-b border-rose-100 dark:border-rose-900/30">
                    {recipePlan.phases.menstrual}
                  </h4>
                  <div className="space-y-3">
                    {recipePlan.days.slice(0, 5).map(day => (
                      <div key={day.day} className="bg-surface-low p-4 rounded-2xl border border-rose-100/50 dark:border-rose-900/20">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs">
                            {day.day}
                          </span>
                          <div>
                            <h5 className="font-serif text-base text-on-surface mb-1">{day.title}</h5>
                            <p className="font-sans text-xs text-on-surface-variant">{day.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follicular Phase */}
                <div>
                  <h4 className="font-sans font-bold text-emerald-800 dark:text-emerald-300 mb-4 sticky top-0 bg-surface/90 backdrop-blur-sm py-2 z-10 border-b border-emerald-100 dark:border-emerald-900/30">
                    {recipePlan.phases.follicular}
                  </h4>
                  <div className="space-y-3">
                    {recipePlan.days.slice(5, 13).map(day => (
                      <div key={day.day} className="bg-surface-low p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                            {day.day}
                          </span>
                          <div>
                            <h5 className="font-serif text-base text-on-surface mb-1">{day.title}</h5>
                            <p className="font-sans text-xs text-on-surface-variant">{day.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ovulatory Phase */}
                <div>
                  <h4 className="font-sans font-bold text-amber-800 dark:text-amber-300 mb-4 sticky top-0 bg-surface/90 backdrop-blur-sm py-2 z-10 border-b border-amber-100 dark:border-amber-900/30">
                    {recipePlan.phases.ovulatory}
                  </h4>
                  <div className="space-y-3">
                    {recipePlan.days.slice(13, 16).map(day => (
                      <div key={day.day} className="bg-surface-low p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                            {day.day}
                          </span>
                          <div>
                            <h5 className="font-serif text-base text-on-surface mb-1">{day.title}</h5>
                            <p className="font-sans text-xs text-on-surface-variant">{day.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Luteal Phase */}
                <div>
                  <h4 className="font-sans font-bold text-indigo-800 dark:text-indigo-300 mb-4 sticky top-0 bg-surface/90 backdrop-blur-sm py-2 z-10 border-b border-indigo-100 dark:border-indigo-900/30">
                    {recipePlan.phases.luteal}
                  </h4>
                  <div className="space-y-3">
                    {recipePlan.days.slice(16, 28).map(day => (
                      <div key={day.day} className="bg-surface-low p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                            {day.day}
                          </span>
                          <div>
                            <h5 className="font-serif text-base text-on-surface mb-1">{day.title}</h5>
                            <p className="font-sans text-xs text-on-surface-variant">{day.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardScreen;
