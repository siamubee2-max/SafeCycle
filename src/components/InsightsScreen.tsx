import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity, ArrowRight, Info, X } from 'lucide-react';
import { Language } from '../translations';
import { calculateCurrentPhase } from '../utils/cyclePhase';
import { secureStorage } from '../utils/crypto';
import TopBar from './TopBar';

const InsightsScreen = ({ t, currentLang, setLang, isDarkMode, setIsDarkMode, entries, onDeleteAllData }: { t: any, currentLang: Language, setLang: (lang: Language) => void, isDarkMode: boolean, setIsDarkMode: (dark: boolean) => void, entries: Record<string, any>, onDeleteAllData: () => Promise<void> | void }) => {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showFoodGuide, setShowFoodGuide] = useState(false);
  const [showRoutineGuide, setShowRoutineGuide] = useState(false);

  useEffect(() => {
    const generateInsight = async () => {
      const today = new Date().toDateString();
      const stored = await secureStorage.getItem(`daily_ai_insight_${currentLang}`);
      if (stored) {
        try {
          const { date, insight } = JSON.parse(stored);
          if (date === today && insight) {
            setAiInsight(insight);
            return;
          }
        } catch (e) {}
      }

      const entriesList = Object.values(entries);
      if (entriesList.length === 0) {
        setAiInsight(t.noDataInsight || 'Log more data to get personalized AI insights about your cycle and health.');
        return;
      }

      setIsGeneratingInsight(true);
      try {
        const phase = calculateCurrentPhase(entries);

        const recentEntries = entriesList.slice(-14);
        const dataSummary = recentEntries.map((e: any) =>
          `Mood: ${e.mood || 'N/A'}, Energy: ${e.energy}/100, Cramps: ${e.cramps}/100, Backache: ${e.lowerBackache ? 'Yes' : 'No'}, Flow: ${e.flowType || 'N/A'}`
        ).join('; ');

        const response = await fetch('/api/gemini/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataSummary, phase, lang: currentLang }),
        });

        if (!response.ok) throw new Error('API error');
        const { text } = await response.json() as { text: string };
        const newInsight = text || (t.noDataInsight || 'Log more data to get personalized AI insights about your cycle and health.');
        setAiInsight(newInsight);
        await secureStorage.setItem(`daily_ai_insight_${currentLang}`, JSON.stringify({ date: today, insight: newInsight }));
      } catch (error) {
        console.error('Error generating insight:', error);
        setAiInsight(t.noDataInsight || 'Log more data to get personalized AI insights about your cycle and health.');
      } finally {
        setIsGeneratingInsight(false);
      }
    };

    generateInsight();
  }, [currentLang, entries, t.noDataInsight]);

  return (
    <div className="pb-32">
      <TopBar title={t.appTitle} currentLang={currentLang} setLang={setLang} t={t} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} entries={entries} onDeleteAllData={onDeleteAllData} />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="font-sans text-xs font-medium tracking-widest uppercase text-outline mb-3 block">{t.perspective}</span>
              <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">{t.monthlyNarrative}</h2>
            </div>
            <div className="text-left md:text-right">
              <p className="font-sans text-sm text-on-surface-variant max-w-[200px] leading-relaxed">
                {t.monthlyNarrativeDesc}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16 bg-secondary-container text-on-secondary-container rounded-xl p-8 relative overflow-hidden editorial-shadow">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-secondary" />
              <h3 className="font-serif text-2xl text-secondary">{t.aiInsightTitle || "AI Cycle Analysis"}</h3>
            </div>
            {isGeneratingInsight ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-secondary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-secondary/20 rounded w-full"></div>
                  <div className="h-4 bg-secondary/20 rounded w-5/6"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-sans text-lg leading-relaxed">
                  {aiInsight}
                </p>
                <div className="flex items-start gap-2 bg-on-secondary-container/5 p-3 rounded-lg border border-on-secondary-container/10 mt-4">
                  <Info className="w-4 h-4 text-on-secondary-container/70 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-on-secondary-container/80 font-sans leading-relaxed">
                    {t.medicalDisclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </section>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl text-primary">{t.cycleTrends}</h3>
            <div className="bg-surface-low px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-sans text-xs font-semibold text-primary">{t.currentPhase}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-low rounded-xl p-8 editorial-shadow relative overflow-hidden">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-outline mb-1">{t.energyVsEstrogen}</h4>
                  <p className="font-sans text-sm text-on-surface-variant">{t.last30Days}</p>
                </div>
                <Activity className="text-outline w-6 h-6" strokeWidth={1.5} />
              </div>
              
              <div className="relative h-48 w-full">
                <svg className="w-full h-full" fill="none" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <path d="M0 130 H400 M0 90 H400 M0 50 H400" stroke="currentColor" strokeOpacity="0.05" className="text-primary"></path>
                  <path d="M0 110 C 50 110, 80 40, 150 50 S 250 130, 320 80 S 380 30, 400 30" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" className="text-primary"></path>
                  <path d="M0 120 C 60 120, 100 20, 180 30 S 280 140, 350 90 S 390 40, 400 40" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1.5" className="text-secondary"></path>
                </svg>
                <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pt-4">
                  <span className="font-sans text-[10px] text-outline">{t.day1}</span>
                  <span className="font-sans text-[10px] text-outline">{t.day14}</span>
                  <span className="font-sans text-[10px] text-outline">{t.day28}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'menstrual', name: t.phaseMenstrual, desc: t.phaseMenstrualDesc },
                  { id: 'follicular', name: t.phaseFollicular, desc: t.phaseFollicularDesc },
                  { id: 'ovulatory', name: t.phaseOvulatory, desc: t.phaseOvulatoryDesc },
                  { id: 'luteal', name: t.phaseLuteal, desc: t.phaseLutealDesc },
                ].map(phase => (
                  <div 
                    key={phase.id}
                    onMouseEnter={() => setActivePhase(phase.id)}
                    onMouseLeave={() => setActivePhase(null)}
                    onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${activePhase === phase.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface-lowest border-outline-variant/30 hover:border-primary/50'}`}
                  >
                    <h5 className={`font-sans text-[10px] font-bold uppercase tracking-wider mb-1 ${activePhase === phase.id ? 'text-white' : 'text-primary'}`}>{phase.name}</h5>
                    <AnimatePresence>
                      {activePhase === phase.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="font-sans text-xs opacity-90 mt-2 leading-relaxed">
                            {phase.desc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-primary text-white rounded-xl p-8 flex flex-col justify-between editorial-shadow">
              <div className="space-y-4">
                <Sparkles className="text-primary-fixed w-8 h-8" strokeWidth={1.5} />
                <h4 className="font-serif text-xl leading-snug">{t.midCycleSpike}</h4>
              </div>
              <p className="font-sans text-sm text-primary-fixed leading-relaxed opacity-90 mt-6">
                {t.midCycleSpikeDesc}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20 bg-surface-low/50 p-10 rounded-xl border-l-4 border-primary">
          <h3 className="font-serif text-2xl text-primary mb-6 italic">{t.hormonalEchoes}</h3>
          <div className="columns-1 md:columns-2 gap-12 font-sans text-sm text-on-surface-variant leading-relaxed space-y-4">
            <p>
              {t.hormonalEchoesP1}
            </p>
            <p>
              {t.hormonalEchoesP2}
            </p>
          </div>
        </section>

        <section className="mb-24">
          <div className="flex items-end gap-3 mb-10">
            <h3 className="font-serif text-2xl text-primary">{t.aiRecs}</h3>
            <span className="font-sans text-[10px] text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-tighter mb-1.5">{t.locallyGenerated}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-surface-lowest rounded-xl overflow-hidden editorial-shadow flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop" 
                  alt="Yoga" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              </div>
              <div className="p-8">
                <h5 className="font-serif text-lg text-primary mb-3">{t.optimizeMovement}</h5>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {t.optimizeMovementDesc}
                </p>
                <button 
                  onClick={() => setShowRoutineGuide(true)}
                  className="mt-6 flex items-center gap-2 text-primary font-semibold text-sm hover:underline font-sans"
                >
                  {t.exploreRoutines}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="group bg-surface-lowest rounded-xl overflow-hidden editorial-shadow flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop" 
                  alt="Nutrition" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              </div>
              <div className="p-8">
                <h5 className="font-serif text-lg text-primary mb-3">{t.nutritionalSupport}</h5>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-5">
                  {t.nutritionalSupportDesc}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold">{t.foodPumpkinSeeds}</span>
                  <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold">{t.foodAlmonds}</span>
                  <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold">{t.foodAvocado}</span>
                </div>

                <button 
                  onClick={() => setShowFoodGuide(true)}
                  className="mt-2 flex items-center gap-2 text-primary font-semibold text-sm hover:underline font-sans"
                >
                  {t.viewFoodGuide}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showRoutineGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRoutineGuide(false)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-surface text-on-surface w-full max-w-md rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/20 -z-10"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-serif text-2xl text-primary mb-2">{t.routineGuideTitle}</h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    {t.routineGuideIntro}
                  </p>
                </div>
                <button 
                  onClick={() => setShowRoutineGuide(false)}
                  className="p-2 bg-surface-low rounded-full hover:bg-surface-high transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                <div className="bg-surface-low p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <h4 className="font-sans font-semibold text-indigo-800 dark:text-indigo-300 mb-2">{t.routineGuideSec1Title}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mb-3">{t.routineGuideSec1Desc}</p>
                  <p className="font-sans text-xs font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg inline-block">{t.routineGuideSec1Duration}</p>
                </div>

                <div className="bg-surface-low p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                  <h4 className="font-sans font-semibold text-purple-800 dark:text-purple-300 mb-2">{t.routineGuideSec2Title}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mb-3">{t.routineGuideSec2Desc}</p>
                  <p className="font-sans text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg inline-block">{t.routineGuideSec2Duration}</p>
                </div>

                <div className="bg-surface-low p-5 rounded-2xl border border-sky-100 dark:border-sky-900/30">
                  <h4 className="font-sans font-semibold text-sky-800 dark:text-sky-300 mb-2">{t.routineGuideSec3Title}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mb-3">{t.routineGuideSec3Desc}</p>
                  <p className="font-sans text-xs font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 p-2 rounded-lg inline-block">{t.routineGuideSec3Duration}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowRoutineGuide(false)}
                className="w-full mt-8 py-4 bg-primary text-on-primary rounded-full font-sans font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {t.closeRoutineGuide}
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {showFoodGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFoodGuide(false)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-surface text-on-surface w-full max-w-md rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 -z-10"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-serif text-2xl text-primary mb-2">{t.foodGuideTitle}</h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    {t.foodGuideIntro}
                  </p>
                </div>
                <button 
                  onClick={() => setShowFoodGuide(false)}
                  className="p-2 bg-surface-low rounded-full hover:bg-surface-high transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                <div className="bg-surface-low p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="font-sans font-semibold text-emerald-800 dark:text-emerald-300 mb-2">{t.foodGuideSec1Title}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mb-3">{t.foodGuideSec1Desc}</p>
                  <p className="font-sans text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg inline-block">{t.foodGuideSec1Foods}</p>
                </div>

                <div className="bg-surface-low p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                  <h4 className="font-sans font-semibold text-rose-800 dark:text-rose-300 mb-2">{t.foodGuideSec2Title}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mb-3">{t.foodGuideSec2Desc}</p>
                  <p className="font-sans text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg inline-block">{t.foodGuideSec2Foods}</p>
                </div>

                <div className="bg-surface-low p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <h4 className="font-sans font-semibold text-amber-800 dark:text-amber-300 mb-2">{t.foodGuideSec3Title}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mb-3">{t.foodGuideSec3Desc}</p>
                  <p className="font-sans text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg inline-block">{t.foodGuideSec3Foods}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowFoodGuide(false)}
                className="w-full mt-8 py-4 bg-primary text-on-primary rounded-full font-sans font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {t.closeGuide}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InsightsScreen;
