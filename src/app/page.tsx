'use client';

import { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { Calendar } from '@/components/Calendar';
import { Card } from '@/components/Card';
import { useApp } from '@/context/AppContext';
import { FLOW_COLORS } from '@/lib/constants';
import { useTranslation } from '@/lib/useTranslation';
import EntryModal from '@/components/EntryModal';

export default function HomePage() {
  const { state } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const { t, formatDate } = useTranslation();
  
  const selectedEntry = selectedDate 
    ? state.entries.find(e => e.date === selectedDate) ?? undefined
    : undefined;
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };
  
  const handleAddEntry = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowEntryModal(true);
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-[#2D2A26]">{t.appName}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Shield size={14} className="text-[#7D9C7D]" />
            <span className="text-xs text-[#6B6560]">{t.privacy.badge}</span>
          </div>
        </div>
        <button 
          onClick={handleAddEntry}
          className="w-11 h-11 rounded-full bg-[#C4A77D] flex items-center justify-center text-white hover:bg-[#B39668] transition-colors active:scale-95"
          aria-label={t.actions.add}
        >
          <Plus size={22} />
        </button>
      </header>
      
      <div className="mb-6">
        <p className="text-sm text-[#6B6560] mb-2">{t.privacy.description}</p>
      </div>
      
      <Calendar
        entries={state.entries}
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
        prediction={state.prediction}
      />
      
      {selectedDate && (
        <Card className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[#2D2A26]">
              {formatDate(selectedDate, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            <button 
              onClick={() => setShowEntryModal(true)}
              className="text-sm text-[#C4A77D] hover:underline"
            >
              {selectedEntry ? t.actions.edit : t.actions.add}
            </button>
          </div>
          
          {selectedEntry ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: FLOW_COLORS[selectedEntry.flow] }}
                />
                <span className="text-sm text-[#6B6560]">
                  {t.flow[selectedEntry.flow]}
                </span>
              </div>
              
              {selectedEntry.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntry.symptoms.map(symptom => (
                    <span 
                      key={symptom}
                      className="px-2 py-1 bg-[#EDE8E0] rounded-full text-xs text-[#6B6560]"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              )}
              
              {selectedEntry.notes && (
                <p className="text-sm text-[#6B6560] pt-2 border-t border-[#EDE8E0]">
                  {selectedEntry.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#6B6560]">{t.empty.noEntriesForDate}</p>
          )}
        </Card>
      )}
      
      {showEntryModal && selectedDate && (
        <EntryModal
          date={selectedDate}
          existingEntry={selectedEntry}
          onClose={() => setShowEntryModal(false)}
        />
      )}
    </div>
  );
}