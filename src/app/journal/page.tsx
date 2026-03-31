'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { TRANSLATIONS, FLOW_COLORS } from '@/lib/constants';
import { CycleEntry } from '@/lib/types';
import EntryModal from '@/components/EntryModal';

export default function JournalPage() {
  const { state, deleteEntry } = useApp();
  const [selectedEntry, setSelectedEntry] = useState<CycleEntry | undefined>();
  const [showModal, setShowModal] = useState(false);
  const t = TRANSLATIONS.fr;
  
  const handleAddEntry = () => {
    setSelectedEntry(undefined);
    setShowModal(true);
  };
  
  const handleEditEntry = (entry: CycleEntry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };
  
  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Supprimer cette entrée ?')) {
      await deleteEntry(id);
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-[#2D2A26]">{t.tabs.journal}</h1>
          <p className="text-sm text-[#6B6560] mt-1">
            {state.entries.length} entrée{state.entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={handleAddEntry}
          className="w-11 h-11 rounded-full bg-[#C4A77D] flex items-center justify-center text-white hover:bg-[#B39668] transition-colors active:scale-95"
        >
          <Plus size={22} />
        </button>
      </header>
      
      {state.entries.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar size={48} className="mx-auto text-[#EDE8E0] mb-4" />
          <h3 className="text-lg font-medium text-[#2D2A26] mb-2">
            {t.empty.noEntries}
          </h3>
          <p className="text-sm text-[#6B6560] mb-6">
            {t.empty.startTracking}
          </p>
          <Button onClick={handleAddEntry} icon={Plus}>
            {t.actions.add}
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {state.entries.map(entry => (
            <Card key={entry.id} className="group">
              <div className="flex items-start justify-between">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: FLOW_COLORS[entry.flow] + '20' }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: FLOW_COLORS[entry.flow] }}
                  />
                </div>
                
                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[#2D2A26]">
                      {formatDate(entry.date)}
                    </span>
                    <span className="text-sm text-[#6B6560]">
                      {t.flow[entry.flow]}
                    </span>
                  </div>
                  
                  {entry.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.symptoms.slice(0, 3).map(symptom => (
                        <span 
                          key={symptom}
                          className="px-2 py-0.5 bg-[#EDE8E0] rounded-full text-xs text-[#6B6560]"
                        >
                          {symptom}
                        </span>
                      ))}
                      {entry.symptoms.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-[#6B6560]">
                          +{entry.symptoms.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {entry.notes && (
                    <p className="text-sm text-[#6B6560] mt-2 line-clamp-2">
                      {entry.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditEntry(entry)}
                    className="p-2 hover:bg-[#EDE8E0] rounded-lg text-[#6B6560]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 hover:bg-[#C17B7B]/10 rounded-lg text-[#C17B7B]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {showModal && (
        <EntryModal
          date={selectedEntry?.date || new Date().toISOString().split('T')[0]}
          existingEntry={selectedEntry}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
