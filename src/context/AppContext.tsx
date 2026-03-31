'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CycleEntry, UserSettings, TrackingMode } from '@/lib/types';
import { getEntries, saveEntry, deleteEntry, getSettings, saveSettings, initDB, getOrCreateKey } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { generateId, calculatePredictions, calculateStatistics } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface AppState {
  entries: CycleEntry[];
  settings: UserSettings;
  isLoading: boolean;
  isInitialized: boolean;
  prediction: ReturnType<typeof calculatePredictions>;
  statistics: ReturnType<typeof calculateStatistics>;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ENTRIES'; payload: CycleEntry[] }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'ADD_ENTRY'; payload: CycleEntry }
  | { type: 'UPDATE_ENTRY'; payload: CycleEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'SET_INITIALIZED' }
  | { type: 'SET_PREDICTION'; payload: ReturnType<typeof calculatePredictions> }
  | { type: 'SET_STATISTICS'; payload: ReturnType<typeof calculateStatistics> };

const initialState: AppState = {
  entries: [],
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  isInitialized: false,
  prediction: {
    nextPeriodDate: null,
    ovulationDate: null,
    fertileWindowStart: null,
    fertileWindowEnd: null,
    confidence: 0,
  },
  statistics: {
    averageCycleLength: 0,
    averageLutealPhaseLength: 14,
    cycleHistory: [],
    symptomCorrelations: [],
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'ADD_ENTRY':
      return { ...state, entries: [action.payload, ...state.entries] };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(e => e.id !== action.payload),
      };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true, isLoading: false };
    case 'SET_PREDICTION':
      return { ...state, prediction: action.payload };
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  addEntry: (entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (entry: CycleEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  setTrackingMode: (mode: TrackingMode) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        await getOrCreateKey();
        
        const [entries, settings] = await Promise.all([
          getEntries(),
          getSettings(),
        ]);
        
        dispatch({ type: 'SET_ENTRIES', payload: entries });
        dispatch({ type: 'SET_SETTINGS', payload: settings });
        dispatch({ type: 'SET_PREDICTION', payload: calculatePredictions(entries) });
        dispatch({ type: 'SET_STATISTICS', payload: calculateStatistics(entries) });
        dispatch({ type: 'SET_INITIALIZED' });
      } catch (error) {
        logger.error('Failed to initialize', error instanceof Error ? error.message : String(error));
        dispatch({ type: 'SET_INITIALIZED' });
      }
    };
    
    initialize();
  }, []);
  
  const addEntry = async (entryData: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const entry: CycleEntry = {
      ...entryData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    await saveEntry(entry);
    dispatch({ type: 'ADD_ENTRY', payload: entry });
    dispatch({ type: 'SET_PREDICTION', payload: calculatePredictions([...state.entries, entry]) });
    dispatch({ type: 'SET_STATISTICS', payload: calculateStatistics([...state.entries, entry]) });
  };
  
  const updateEntry = async (entry: CycleEntry) => {
    const updated = { ...entry, updatedAt: Date.now() };
    await saveEntry(updated);
    dispatch({ type: 'UPDATE_ENTRY', payload: updated });
    
    const newEntries = state.entries.map(e => e.id === updated.id ? updated : e);
    dispatch({ type: 'SET_PREDICTION', payload: calculatePredictions(newEntries) });
    dispatch({ type: 'SET_STATISTICS', payload: calculateStatistics(newEntries) });
  };
  
  const deleteEntry = async (id: string) => {
    await deleteEntry(id);
    dispatch({ type: 'DELETE_ENTRY', payload: id });
    
    const newEntries = state.entries.filter(e => e.id !== id);
    dispatch({ type: 'SET_PREDICTION', payload: calculatePredictions(newEntries) });
    dispatch({ type: 'SET_STATISTICS', payload: calculateStatistics(newEntries) });
  };
  
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...state.settings, ...newSettings };
    await saveSettings(updated);
    dispatch({ type: 'SET_SETTINGS', payload: updated });
  };
  
  const setTrackingMode = async (mode: TrackingMode) => {
    await updateSettings({ mode });
  };
  
  const refreshData = async () => {
    const [entries, settings] = await Promise.all([
      getEntries(),
      getSettings(),
    ]);
    
    dispatch({ type: 'SET_ENTRIES', payload: entries });
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    dispatch({ type: 'SET_PREDICTION', payload: calculatePredictions(entries) });
    dispatch({ type: 'SET_STATISTICS', payload: calculateStatistics(entries) });
  };
  
  return (
    <AppContext.Provider value={{
      state,
      addEntry,
      updateEntry,
      deleteEntry,
      updateSettings,
      setTrackingMode,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
