import { TrackingMode, UserSettings } from './types';

export const TRANSLATIONS = {
  fr: {
    appName: 'SafeCycle',
    tabs: {
      home: 'Accueil',
      journal: 'Suivi',
      stats: 'Stats',
      settings: 'Réglages',
    },
    flow: {
      none: 'Aucun',
      spotting: 'Spotting',
      light: 'Léger',
      medium: 'Moyen',
      heavy: 'Abondant',
    },
    symptoms: {
      common: ['Crampes', 'Fatigue', 'Maux de tête', 'Sensibilité poitrine', 'Gonflement', 'Acné', 'Changement d\'humeur', 'Insomnie'],
      sopk: ['Pilosité accrue', 'Perte de cheveux', 'Difficulté poids'],
      endometriosis: ['Douleur pelvienne', 'Douleur lombaire', 'Douleur intercourse', 'Nausées'],
      contraception: ['Prise oubliée', 'Effets secondaires', 'Spotting'],
    },
    modes: {
      simple: 'Simple',
      sopk: 'SOPK',
      endometriosis: 'Endométriose',
      contraception: 'Contraception',
    },
    phases: {
      menstrual: 'Menstruation',
      follicular: 'Phase folliculaire',
      ovulation: 'Ovulation',
      luteal: 'Phase lutéale',
    },
    stats: {
      avgCycle: 'Cycle moyen',
      avgLuteal: 'Phase lutéale',
      days: 'jours',
      noData: 'Ajoutez 3 cycles pour voir vos tendances',
    },
    actions: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      add: 'Ajouter',
      today: 'Aujourd\'hui',
      upgradePro: 'Passer à Lifetime',
      exportData: 'Exporter mes données',
      deleteAll: 'Supprimer toutes les données',
    },
    empty: {
      noEntries: 'Aucun suivi enregistré',
      startTracking: 'Commencez votre premier suivi',
    },
    privacy: {
      badge: 'Zero-Knowledge',
      description: 'Vos données sont chiffrées et stockées uniquement sur cet appareil.',
    },
    purchase: {
      title: 'SafeCycle Lifetime',
      price: '19,99 $',
      features: ['Accès à vie', 'Toutes les fonctionnalités', 'Aucune publicité', 'Support prioritaire'],
      cta: 'Acheter maintenant',
    },
  },
  en: {
    appName: 'SafeCycle',
    tabs: {
      home: 'Home',
      journal: 'Journal',
      stats: 'Stats',
      settings: 'Settings',
    },
    flow: {
      none: 'None',
      spotting: 'Spotting',
      light: 'Light',
      medium: 'Medium',
      heavy: 'Heavy',
    },
    symptoms: {
      common: ['Cramps', 'Fatigue', 'Headache', 'Breast tenderness', 'Bloating', 'Acne', 'Mood changes', 'Insomnia'],
      sopk: ['Increased hair growth', 'Hair loss', 'Weight difficulty'],
      endometriosis: ['Pelvic pain', 'Back pain', 'Pain during intercourse', 'Nausea'],
      contraception: ['Missed pill', 'Side effects', 'Spotting'],
    },
    modes: {
      simple: 'Simple',
      sopk: 'PCOS',
      endometriosis: 'Endometriosis',
      contraception: 'Contraception',
    },
    phases: {
      menstrual: 'Menstruation',
      follicular: 'Follicular phase',
      ovulation: 'Ovulation',
      luteal: 'Luteal phase',
    },
    stats: {
      avgCycle: 'Average cycle',
      avgLuteal: 'Luteal phase',
      days: 'days',
      noData: 'Add 3 cycles to see your trends',
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      add: 'Add',
      today: 'Today',
      upgradePro: 'Go Lifetime',
      exportData: 'Export my data',
      deleteAll: 'Delete all data',
    },
    empty: {
      noEntries: 'No entries recorded',
      startTracking: 'Start your first tracking',
    },
    privacy: {
      badge: 'Zero-Knowledge',
      description: 'Your data is encrypted and stored only on this device.',
    },
    purchase: {
      title: 'SafeCycle Lifetime',
      price: '$19.99',
      features: ['Lifetime access', 'All features', 'No ads', 'Priority support'],
      cta: 'Buy now',
    },
  },
};

export const DEFAULT_SETTINGS: UserSettings = {
  mode: 'simple',
  notifications: {
    reminders: true,
    predictions: true,
    medication: false,
  },
  language: 'fr',
  hasPro: false,
};

export const DB_NAME = 'safecycle-db';
export const DB_VERSION = 1;

export const FLOW_COLORS: Record<string, string> = {
  none: 'transparent',
  spotting: '#E8D5C4',
  light: '#D4A574',
  medium: '#C17B7B',
  heavy: '#8B4D4D',
};
