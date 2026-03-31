import { FlowIntensity, CyclePhaseType, CycleEntry, CycleStatistics, CyclePrediction } from './types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function differenceInDays(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getMonthName(month: number, locale: string = 'fr-FR'): string {
  return new Date(2000, month).toLocaleDateString(locale, { month: 'long' });
}

export function getCyclePhase(date: Date, cycleStart: Date, cycleLength: number): CyclePhaseType {
  const dayOfCycle = differenceInDays(date, cycleStart) + 1;
  
  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle <= 13) return 'follicular';
  if (dayOfCycle <= 16) return 'ovulation';
  return 'luteal';
}

export function calculatePredictions(entries: CycleEntry[]): CyclePrediction {
  if (entries.length < 2) {
    return {
      nextPeriodDate: null,
      ovulationDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      confidence: 0,
    };
  }

  const periodStarts = entries
    .filter(e => e.flow !== 'none' && e.flow !== 'spotting')
    .map(e => parseDate(e.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (periodStarts.length < 2) {
    return {
      nextPeriodDate: null,
      ovulationDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      confidence: 0,
    };
  }

  const cycleLengths: number[] = [];
  for (let i = 0; i < periodStarts.length - 1; i++) {
    cycleLengths.push(differenceInDays(periodStarts[i], periodStarts[i + 1]));
  }

  const avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  const avgLutealPhase = 14;

  const lastPeriodStart = periodStarts[0];
  const predictedNextPeriod = addDays(lastPeriodStart, avgCycleLength);
  const predictedOvulation = addDays(predictedNextPeriod, -avgLutealPhase - 1);
  const fertileStart = addDays(predictedOvulation, -4);
  const fertileEnd = addDays(predictedOvulation, 1);

  const consistency = cycleLengths.every(l => Math.abs(l - avgCycleLength) <= 2) ? 1 :
                      cycleLengths.every(l => Math.abs(l - avgCycleLength) <= 4) ? 0.7 : 0.4;

  return {
    nextPeriodDate: formatDate(predictedNextPeriod),
    ovulationDate: formatDate(predictedOvulation),
    fertileWindowStart: formatDate(fertileStart),
    fertileWindowEnd: formatDate(fertileEnd),
    confidence: consistency,
  };
}

export function calculateStatistics(entries: CycleEntry[]): CycleStatistics {
  const periodStarts = entries
    .filter(e => e.flow !== 'none' && e.flow !== 'spotting')
    .map(e => ({ date: e.date, flow: e.flow }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (periodStarts.length < 2) {
    return {
      averageCycleLength: 0,
      averageLutealPhaseLength: 14,
      cycleHistory: [],
      symptomCorrelations: [],
    };
  }

  const cycleLengths: number[] = [];
  const cycleHistory: { date: string; length: number }[] = [];

  for (let i = 0; i < periodStarts.length - 1; i++) {
    const length = differenceInDays(periodStarts[i].date, periodStarts[i + 1].date);
    if (length > 0 && length < 60) {
      cycleLengths.push(length);
      cycleHistory.push({ date: periodStarts[i].date, length });
    }
  }

  const symptomCounts: Record<string, Record<CyclePhaseType, number>> = {};
  
  const sortedPeriodStarts = [...periodStarts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const findCycleStart = (entryDate: Date): Date => {
    for (let i = sortedPeriodStarts.length - 1; i >= 0; i--) {
      if (parseDate(sortedPeriodStarts[i].date) <= entryDate) {
        return parseDate(sortedPeriodStarts[i].date);
      }
    }
    return parseDate(sortedPeriodStarts[0].date);
  };
  
  entries.forEach(entry => {
    const date = parseDate(entry.date);
    const cycleStart = findCycleStart(date);
    const phase = getCyclePhase(date, cycleStart, 28);
    
    entry.symptoms.forEach(symptom => {
      if (!symptomCounts[symptom]) {
        symptomCounts[symptom] = { menstrual: 0, follicular: 0, ovulation: 0, luteal: 0 };
      }
      symptomCounts[symptom][phase]++;
    });
  });

  const symptomCorrelations = Object.entries(symptomCounts).map(([symptom, phases]) => {
    const total = Object.values(phases).reduce((a, b) => a + b, 0);
    const dominantPhase = Object.entries(phases).reduce((a, b) => 
      b[1] > a[1] ? b : a
    )[0] as CyclePhaseType;
    return {
      symptom,
      phase: dominantPhase,
      frequency: Math.round((phases[dominantPhase] / total) * 100),
    };
  }).sort((a, b) => b.frequency - a.frequency);

  return {
    averageCycleLength: cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 0,
    averageLutealPhaseLength: 14,
    cycleHistory: cycleHistory.reverse(),
    symptomCorrelations,
  };
}

export function getFlowIndex(flow: FlowIntensity): number {
  const map: Record<FlowIntensity, number> = {
    none: 0,
    spotting: 1,
    light: 2,
    medium: 3,
    heavy: 4,
  };
  return map[flow];
}
