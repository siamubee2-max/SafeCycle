export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type CyclePhaseType = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type TrackingMode = 'simple' | 'sopk' | 'endometriosis' | 'contraception';

export interface CycleEntry {
  id: string;
  date: string;
  flow: FlowIntensity;
  symptoms: string[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface CyclePhase {
  startDate: string;
  endDate: string | null;
  type: CyclePhaseType;
}

export interface NotificationSettings {
  reminders: boolean;
  predictions: boolean;
  medication: boolean;
}

export interface UserSettings {
  mode: TrackingMode;
  notifications: NotificationSettings;
  language: 'fr' | 'en';
  hasPro: boolean;
}

export interface CyclePrediction {
  nextPeriodDate: string | null;
  ovulationDate: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  confidence: number;
}

export interface CycleStatistics {
  averageCycleLength: number;
  averageLutealPhaseLength: number;
  cycleHistory: { date: string; length: number }[];
  symptomCorrelations: { symptom: string; phase: CyclePhaseType; frequency: number }[];
}
