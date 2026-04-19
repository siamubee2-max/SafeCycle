import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplet, Sparkles, Activity, Zap, Calendar, Edit3,
  ChevronLeft, ChevronRight, Info, Plus, Trash2, Bell, Pill
} from 'lucide-react';
import { Language } from '../translations';
import { calculateCurrentPhase } from '../utils/cyclePhase';
import { secureStorage } from '../utils/crypto';
import TopBar from './TopBar';

const JournalScreen = ({ t, currentLang, setLang, isDarkMode, setIsDarkMode, entries, setEntries, onDeleteAllData }: { t: any, currentLang: Language, setLang: (lang: Language) => void, isDarkMode: boolean, setIsDarkMode: (dark: boolean) => void, entries: Record<string, any>, setEntries: React.Dispatch<React.SetStateAction<Record<string, any>>>, onDeleteAllData: () => Promise<void> | void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  const dateKey = selectedDate.toDateString();

  const [cramps, setCramps] = useState(50);
  const [lowerBackache, setLowerBackache] = useState(false);
  const [flowType, setFlowType] = useState<string | null>(null);
  const [energy, setEnergy] = useState(50);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState<string | null>(null);
  const [medications, setMedications] = useState<{ id: string, name: string, dosage: string, time: string, reminder: boolean }[]>([]);
  const [symptoms, setSymptoms] = useState<{ id: string, name: string, intensity: string, notes: string }[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [showSymptomDropdown, setShowSymptomDropdown] = useState(false);

  const predefinedSymptoms = [
    { id: 'headache', key: 'headache' },
    { id: 'bloating', key: 'bloating' },
    { id: 'fatigue', key: 'fatigue' },
    { id: 'acne', key: 'acne' },
    { id: 'nausea', key: 'nausea' },
    { id: 'tenderBreasts', key: 'tenderBreasts' },
  ];

  const getPhaseSuggestion = () => {
    const phase = calculateCurrentPhase(entries);
    const phaseMap: Record<string, { phase: string; suggestion: string }> = {
      menstrual:  { phase: t.phaseMenstrual,  suggestion: t.suggestionMenstrual },
      follicular: { phase: t.phaseFollicular, suggestion: t.suggestionFollicular },
      ovulatory:  { phase: t.phaseOvulatory,  suggestion: t.suggestionOvulatory },
      luteal:     { phase: t.phaseLuteal,     suggestion: t.suggestionLuteal },
    };
    return phaseMap[phase] ?? phaseMap['follicular'];
  };
  const { phase: currentPhase, suggestion: currentSuggestion } = getPhaseSuggestion();

  useEffect(() => {
    const fetchPrompt = async () => {
      const today = new Date().toDateString();
      const stored = await secureStorage.getItem(`daily_ai_prompt_${currentLang}`);
      if (stored) {
        try {
          const { date, prompt } = JSON.parse(stored);
          if (date === today && prompt) {
            setAiPrompt(prompt);
            return;
          }
        } catch (e) {}
      }

      setIsGeneratingPrompt(true);
      try {
        const phase = calculateCurrentPhase(entries);
        const response = await fetch('/api/gemini/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phase, lang: currentLang }),
        });

        if (!response.ok) throw new Error('API error');
        const { text } = await response.json() as { text: string };
        const newPrompt = text || t.defaultPrompt;
        setAiPrompt(newPrompt);
        await secureStorage.setItem(`daily_ai_prompt_${currentLang}`, JSON.stringify({ date: today, prompt: newPrompt }));
      } catch (error) {
        console.error('Error generating prompt:', error);
        setAiPrompt(t.defaultPrompt);
      } finally {
        setIsGeneratingPrompt(false);
      }
    };

    fetchPrompt();
  }, [currentLang, t.defaultPrompt, entries]);

  useEffect(() => {
    const entry = entries[dateKey];
    if (entry) {
      setCramps(entry.cramps);
      setLowerBackache(entry.lowerBackache);
      setFlowType(entry.flowType);
      setEnergy(entry.energy);
      setSelectedMood(entry.mood);
      setExerciseType(entry.exerciseType || '');
      setExerciseDuration(entry.exerciseDuration || '');
      setExerciseIntensity(entry.exerciseIntensity || null);
      setMedications(entry.medications || []);
      setSymptoms(entry.symptoms || []);
    } else {
      setCramps(50);
      setLowerBackache(false);
      setFlowType(null);
      setEnergy(50);
      setSelectedMood(null);
      setExerciseType('');
      setExerciseDuration('');
      setExerciseIntensity(null);
      setMedications([]);
      setSymptoms([]);
    }
  }, [dateKey, entries]);

  const handleSave = () => {
    setEntries(prev => ({
      ...prev,
      [dateKey]: {
        cramps,
        lowerBackache,
        flowType,
        energy,
        mood: selectedMood,
        exerciseType,
        exerciseDuration,
        exerciseIntensity,
        medications,
        symptoms
      }
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const addMedication = () => {
    setMedications([...medications, { id: Date.now().toString(), name: '', dosage: '', time: '', reminder: false }]);
  };

  const updateMedication = (id: string, field: string, value: any) => {
    setMedications(medications.map(med => med.id === id ? { ...med, [field]: value } : med));
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const addSymptom = (id: string, name: string) => {
    if (!symptoms.find(s => s.id === id)) {
      setSymptoms([...symptoms, { id, name, intensity: 'mild', notes: '' }]);
    }
  };

  const updateSymptom = (id: string, field: string, value: any) => {
    setSymptoms(symptoms.map(sym => sym.id === id ? { ...sym, [field]: value } : sym));
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(sym => sym.id !== id));
  };

  const moods = ['😊', '😔', '😠', '🥺', '✨', '😴'];

  const formattedDate = new Intl.DateTimeFormat(currentLang, { weekday: 'long', month: 'short', day: 'numeric' }).format(selectedDate);
  const formattedMonth = new Intl.DateTimeFormat(currentLang, { month: 'long', year: 'numeric' }).format(currentMonth);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(2024, 0, i + 7);
    return new Intl.DateTimeFormat(currentLang, { weekday: 'narrow' }).format(d);
  });

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  return (
    <div className="pb-32">
      <TopBar title={t.appTitle} currentLang={currentLang} setLang={setLang} t={t} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} entries={entries} onDeleteAllData={onDeleteAllData} />
      <main className="max-w-2xl mx-auto px-6 pt-8">
        <header className="mb-12">
          <span className="font-sans text-xs font-medium tracking-wider uppercase text-secondary mb-2 block">{t.dailyLog}</span>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-primary leading-tight">{t.journalEntries}</h2>
          <p className="text-on-surface-variant mt-4 font-sans leading-relaxed max-w-md">{t.journalDesc}</p>
        </header>

        <div className="space-y-10">
          <section className="relative z-20">
            <div className="flex items-end justify-between">
              <div 
                className="bg-surface-low p-6 rounded-xl flex-1 mr-4 cursor-pointer hover:bg-surface-lowest transition-colors border border-transparent hover:border-primary/20"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block">{t.selectedDate}</span>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl text-primary capitalize">{formattedDate}</span>
                  <Calendar className={`w-5 h-5 transition-colors ${showCalendar ? 'text-primary' : 'text-primary-container'}`} strokeWidth={1.5} />
                </div>
              </div>
              <button 
                onClick={() => setShowCalendar(true)}
                aria-label={t.openCalendar || 'Open calendar'}
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform shrink-0"
              >
                <Edit3 className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            <AnimatePresence>
              {showCalendar && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-surface-low rounded-xl mt-4 overflow-hidden border border-primary/10 shadow-lg absolute w-full left-0 origin-top"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <button onClick={prevMonth} aria-label={t.prevMonth || 'Previous month'} className="p-2 hover:bg-surface-lowest rounded-full transition-colors text-primary">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="font-serif text-lg text-primary capitalize">{formattedMonth}</span>
                      <button onClick={nextMonth} aria-label={t.nextMonth || 'Next month'} className="p-2 hover:bg-surface-lowest rounded-full transition-colors text-primary">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                      {weekDays.map((d, i) => (
                        <span key={i} className="font-sans text-[10px] text-outline font-bold uppercase">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`blank-${i}`} />
                      ))}
                      {days.map(day => {
                        const date = new Date(year, month, day);
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const hasEntry = !!entries[date.toDateString()];
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedDate(date);
                              setShowCalendar(false);
                            }}
                            className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-sans text-sm transition-all relative ${
                              isSelected ? 'bg-primary text-white shadow-md scale-110' : 
                              isToday ? 'bg-primary/10 text-primary font-bold' : 
                              'text-on-surface hover:bg-surface-lowest hover:scale-110'
                            }`}
                          >
                            {day}
                            {hasEntry && !isSelected && (
                              <span className="absolute bottom-1 w-1 h-1 bg-secondary rounded-full"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="bg-primary-container text-white rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-fixed" />
                <h3 className="font-serif text-xl text-primary-fixed">{t.aiPromptTitle}</h3>
              </div>
              {isGeneratingPrompt ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-sans text-lg leading-relaxed">
                    {aiPrompt}
                  </p>
                  <div className="flex items-start gap-2 bg-black/10 p-3 rounded-lg border border-white/10 mt-4">
                    <Info className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white/80 font-sans leading-relaxed">
                      {t.medicalDisclaimer}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          </section>

          <section className="bg-surface-low rounded-xl p-8 transition-all hover:bg-surface-lowest editorial-shadow">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-serif text-xl text-primary mb-1">{t.painIntensity}</h3>
                <p className="text-sm text-on-surface-variant font-sans">{t.painDesc}</p>
              </div>
              <Droplet className="text-secondary w-6 h-6" strokeWidth={1.5} />
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="font-sans text-sm font-semibold text-primary">{t.abdominalCramps}</label>
                  <span className="text-xs font-bold text-secondary px-3 py-1 bg-secondary-container rounded-full font-sans">
                    {cramps < 30 ? t.low : cramps > 70 ? t.high : t.moderate}
                  </span>
                </div>
                <input 
                  type="range" 
                  value={cramps}
                  onChange={(e) => setCramps(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-outline-variant rounded-full appearance-none accent-primary cursor-pointer" 
                />
              </div>
              
              <div className="flex justify-between items-center bg-surface-lowest p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="text-outline w-5 h-5" strokeWidth={1.5} />
                  <span className="font-sans text-sm">{t.lowerBackache}</span>
                </div>
                <button 
                  onClick={() => setLowerBackache(!lowerBackache)}
                  aria-pressed={lowerBackache === true}
                  aria-label={t.lowerBackache}
                  className={`w-12 h-6 rounded-full relative transition-colors ${lowerBackache ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${lowerBackache ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="bg-surface-low p-6 rounded-xl border-l-4 border-primary">
              <h4 className="font-serif text-lg text-primary mb-4">{t.flowType}</h4>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setFlowType('spotting')}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${flowType === 'spotting' ? 'border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                    <div className={`w-2.5 h-2.5 bg-primary rounded-full transition-opacity ${flowType === 'spotting' ? 'opacity-100' : 'opacity-0'}`}></div>
                  </div>
                  <span className={`text-sm font-medium font-sans ${flowType === 'spotting' ? 'text-primary' : 'text-on-surface-variant'}`}>{t.spotting}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setFlowType('heavy')}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${flowType === 'heavy' ? 'border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                    <div className={`w-2.5 h-2.5 bg-primary rounded-full transition-opacity ${flowType === 'heavy' ? 'opacity-100' : 'opacity-0'}`}></div>
                  </div>
                  <span className={`text-sm font-medium font-sans ${flowType === 'heavy' ? 'text-primary' : 'text-on-surface-variant'}`}>{t.heavy}</span>
                </label>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl h-full group">
              <img 
                src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=400&auto=format&fit=crop" 
                alt="Abstract gradient" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] p-6 flex flex-col justify-end">
                <span className="text-white font-serif text-lg leading-tight">{t.flowInsight}</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-secondary-container/30 rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-secondary">{t.energyLevels}</h3>
                <Zap className="text-secondary w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-sans text-outline uppercase tracking-widest">{t.low}</span>
                <div 
                  className="flex-1 h-12 bg-surface-lowest rounded-full flex items-center px-2 relative cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
                    setEnergy(percentage);
                  }}
                >
                  <div 
                    className="h-8 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-tighter transition-all duration-300" 
                    style={{ width: `${Math.max(15, energy)}%` }}
                  >
                    {t.current}: {energy}%
                  </div>
                </div>
                <span className="text-xs font-sans text-outline uppercase tracking-widest">{t.high}</span>
              </div>
            </div>
            
            <div className="bg-surface-low rounded-xl p-6 flex flex-col justify-between">
              <h3 className="font-serif text-lg text-primary">{t.mood}</h3>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {moods.map((emoji) => (
                  <button 
                    key={emoji}
                    onClick={() => setSelectedMood(emoji)}
                    aria-label={emoji}
                    aria-pressed={selectedMood === emoji}
                    className={`p-2 rounded-lg text-2xl transition-all flex justify-center items-center ${selectedMood === emoji ? 'bg-primary shadow-inner scale-95' : 'bg-surface-lowest hover:bg-primary/20'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-surface-low rounded-xl p-8 transition-all hover:bg-surface-lowest editorial-shadow">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-serif text-xl text-primary mb-1">{t.exercise}</h3>
                <p className="text-sm text-on-surface-variant font-sans">{t.exerciseDesc}</p>
              </div>
              <Activity className="text-secondary w-6 h-6" strokeWidth={1.5} />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2 block">{t.exerciseType}</label>
                  <input 
                    type="text" 
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    placeholder="e.g. Yoga, Running"
                    className="w-full bg-surface-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2 block">{t.duration}</label>
                  <input 
                    type="number" 
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full bg-surface-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2 block">{t.intensity}</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setExerciseIntensity(level)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${exerciseIntensity === level ? 'bg-primary text-white' : 'bg-surface-lowest text-on-surface-variant hover:bg-primary/10'}`}
                    >
                      {level === 'low' ? t.intensityLow : level === 'medium' ? t.intensityMedium : t.intensityHigh}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-primary-container/20 p-4 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{t.exerciseSuggestion}</span>
                </div>
                <p className="text-sm text-on-surface-variant font-sans">
                  <span className="font-semibold text-primary">{currentPhase}:</span> {currentSuggestion}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface-low rounded-xl p-8 transition-all hover:bg-surface-lowest editorial-shadow">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-serif text-xl text-primary mb-1">{t.medicationTracking}</h3>
                <p className="text-sm text-on-surface-variant font-sans">{t.medicationDesc}</p>
              </div>
              <Pill className="text-secondary w-6 h-6" strokeWidth={1.5} />
            </div>

            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="bg-surface-lowest p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center relative group">
                  <button 
                    onClick={() => removeMedication(med.id)}
                    className="absolute top-2 right-2 p-1 text-outline hover:text-error transition-colors md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1 block">{t.medName}</label>
                        <input 
                          type="text" 
                          value={med.name}
                          onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                          placeholder="e.g. Ibuprofen"
                          className="w-full bg-surface-low border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1 block">{t.dosage}</label>
                        <input 
                          type="text" 
                          value={med.dosage}
                          onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                          placeholder="e.g. 200mg"
                          className="w-full bg-surface-low border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="w-full md:w-1/4">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1 block">{t.timeTaken}</label>
                        <input 
                          type="time" 
                          value={med.time}
                          onChange={(e) => updateMedication(med.id, 'time', e.target.value)}
                          className="w-full bg-surface-low border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/10">
                      <button 
                        onClick={() => updateMedication(med.id, 'reminder', !med.reminder)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${med.reminder ? 'bg-primary/10 text-primary' : 'bg-surface-low text-on-surface-variant hover:bg-surface-variant'}`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        {t.reminder} {med.reminder ? 'On' : 'Off'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addMedication}
                className="w-full py-4 border-2 border-dashed border-outline-variant/50 rounded-lg flex items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary/30 transition-all font-sans text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {t.addMedication}
              </button>
            </div>
          </section>

          <section className="bg-surface-low rounded-xl p-8 transition-all hover:bg-surface-lowest editorial-shadow mt-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-serif text-xl text-primary mb-1">{t.symptoms}</h3>
              </div>
              <Activity className="text-secondary w-6 h-6" strokeWidth={1.5} />
            </div>

            <div className="space-y-4">
              {symptoms.map((sym) => (
                <div key={sym.id} className="bg-surface-lowest p-4 rounded-lg flex flex-col gap-4 relative group">
                  <button 
                    onClick={() => removeSymptom(sym.id)}
                    className="absolute top-2 right-2 p-1 text-outline hover:text-error transition-colors md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="w-full space-y-3">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1 block">{t.symptomName}</label>
                        <input 
                          type="text" 
                          value={sym.name}
                          onChange={(e) => updateSymptom(sym.id, 'name', e.target.value)}
                          placeholder="e.g. Headache"
                          className="w-full bg-surface-low border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1 block">{t.intensity}</label>
                        <select
                          value={sym.intensity}
                          onChange={(e) => updateSymptom(sym.id, 'intensity', e.target.value)}
                          className="w-full bg-surface-low border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        >
                          <option value="mild">{t.mild}</option>
                          <option value="moderate">{t.moderate}</option>
                          <option value="severe">{t.severe}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1 block">{t.notes}</label>
                      <input 
                        type="text" 
                        value={sym.notes}
                        onChange={(e) => updateSymptom(sym.id, 'notes', e.target.value)}
                        placeholder="Any additional notes..."
                        className="w-full bg-surface-low border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="relative">
                <button 
                  onClick={() => setShowSymptomDropdown(!showSymptomDropdown)}
                  className="w-full py-4 border-2 border-dashed border-outline-variant/50 rounded-lg flex items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary/30 transition-all font-sans text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t.addSymptom}
                </button>
                
                <AnimatePresence>
                  {showSymptomDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-surface-lowest border border-outline-variant/30 rounded-xl shadow-xl z-10 overflow-hidden"
                    >
                      <div className="p-2 flex flex-col">
                        {predefinedSymptoms.map(sym => (
                          <button
                            key={sym.id}
                            onClick={() => {
                              addSymptom(sym.id, t[sym.key] || sym.id);
                              setShowSymptomDropdown(false);
                            }}
                            className="text-left px-4 py-3 hover:bg-surface-low rounded-lg transition-colors font-sans text-sm text-on-surface"
                          >
                            {t[sym.key] || sym.id}
                          </button>
                        ))}
                        <div className="h-px bg-outline-variant/30 my-1" />
                        <button
                          onClick={() => {
                            addSymptom(Date.now().toString(), '');
                            setShowSymptomDropdown(false);
                          }}
                          className="text-left px-4 py-3 hover:bg-surface-low rounded-lg transition-colors font-sans text-sm text-primary font-medium flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {t.customSymptom}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          <section className="pt-8 pb-12">
            <button 
              onClick={handleSave}
              className={`w-full py-5 rounded-full font-sans font-bold text-sm tracking-[0.15em] uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all ${isSaved ? 'bg-secondary text-white' : 'bg-primary text-white'}`}
            >
              {isSaved ? (t.saved || '✓ Saved') : t.saveJournal}
            </button>
            <p className="text-center text-xs text-outline mt-6 italic font-sans">{t.encryptedPrivate}</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default JournalScreen;
