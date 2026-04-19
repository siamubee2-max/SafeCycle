/**
 * SafeCycle — Cycle Phase Calculator
 * Derives the current cycle phase from real journal entry data.
 * Falls back to a sensible default when no data is available.
 */

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

interface JournalEntry {
  flowType?: string | null;
  cramps?: number;
  energy?: number;
  mood?: string | null;
  [key: string]: unknown;
}

/**
 * Find the most recent period start date from journal entries.
 * A "period start" is the earliest date in a sequence of consecutive days with flow.
 */
function findLastPeriodStartDate(entries: Record<string, JournalEntry>): Date | null {
  const flowDates = Object.entries(entries)
    .filter(([, entry]) =>
      entry.flowType === 'heavy' || entry.flowType === 'spotting'
    )
    .map(([dateStr]) => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime()); // newest first

  if (flowDates.length === 0) return null;

  // Walk back from the most recent flow day to find the start of that period
  let periodStart = flowDates[0];
  for (let i = 1; i < flowDates.length; i++) {
    const diff = (flowDates[i - 1].getTime() - flowDates[i].getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 2) {
      // Consecutive or close — same period
      periodStart = flowDates[i];
    } else {
      break;
    }
  }

  return periodStart;
}

/**
 * Calculate the current cycle phase based on journal entries.
 * @param entries - The journal entries Record
 * @param cycleLength - Total cycle length in days (default 28)
 * @returns The current cycle phase key
 */
export function calculateCurrentPhase(
  entries: Record<string, JournalEntry>,
  cycleLength = 28
): CyclePhase {
  const lastPeriodStart = findLastPeriodStartDate(entries);

  if (!lastPeriodStart) {
    // No period data — return follicular as the most neutral default
    return 'follicular';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPeriodStart.setHours(0, 0, 0, 0);

  const daysSinceStart = Math.floor(
    (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dayInCycle = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;

  // Standard 28-day cycle phase boundaries
  if (dayInCycle < 6) return 'menstrual';    // Days 1-5
  if (dayInCycle < 14) return 'follicular';  // Days 6-13
  if (dayInCycle < 18) return 'ovulatory';   // Days 14-17
  return 'luteal';                            // Days 18-28
}

/**
 * Get a human-readable label for the phase (using the translations object).
 */
export function getPhaseLabel(phase: CyclePhase, t: Record<string, string>): string {
  const map: Record<CyclePhase, string> = {
    menstrual: t.phaseMenstrual || 'Menstrual',
    follicular: t.phaseFollicular || 'Follicular',
    ovulatory: t.phaseOvulatory || 'Ovulatory',
    luteal: t.phaseLuteal || 'Luteal',
  };
  return map[phase];
}

/**
 * Get the number of days remaining in the current cycle.
 */
export function getDaysRemainingInCycle(
  entries: Record<string, JournalEntry>,
  cycleLength = 28
): number {
  const lastPeriodStart = findLastPeriodStartDate(entries);
  if (!lastPeriodStart) return Math.floor(cycleLength / 2); // Default

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPeriodStart.setHours(0, 0, 0, 0);

  const daysSinceStart = Math.floor(
    (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dayInCycle = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;
  return Math.max(0, cycleLength - dayInCycle);
}
