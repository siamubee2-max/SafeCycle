'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/Button';
import { FlowSelector } from '@/components/FlowSelector';
import { SymptomGrid } from '@/components/SymptomPill';
import { Textarea } from '@/components/Input';
import { useApp } from '@/context/AppContext';
import { CycleEntry, FlowIntensity } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/constants';
import { showToast } from '@/components/Toast';

interface EntryModalProps {
  date: string;
  existingEntry?: CycleEntry;
  onClose: () => void;
}

export default function EntryModal({ date, existingEntry, onClose }: EntryModalProps) {
  const { addEntry, updateEntry, deleteEntry } = useApp();
  const t = TRANSLATIONS.fr;
  
  const [flow, setFlow] = useState<FlowIntensity>(existingEntry?.flow || 'none');
  const [symptoms, setSymptoms] = useState<string[]>(existingEntry?.symptoms || []);
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const allSymptoms = [
    ...t.symptoms.common,
    ...t.symptoms.sopk,
    ...t.symptoms.endometriosis,
    ...t.symptoms.contraception,
  ];
  
  const uniqueSymptoms = [...new Set(allSymptoms)];
  
  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (existingEntry) {
        await updateEntry({
          ...existingEntry,
          flow,
          symptoms,
          notes,
        });
        showToast('Entrée mise à jour', 'success');
      } else {
        await addEntry({
          date,
          flow,
          symptoms,
          notes,
        });
        showToast('Entrée ajoutée', 'success');
      }
      onClose();
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!existingEntry) return;
    try {
      await deleteEntry(existingEntry.id);
      showToast('Entrée supprimée', 'success');
      onClose();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-[#F5F1EB] w-full max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#EDE8E0]">
          <h2 className="text-lg font-serif text-[#2D2A26]">
            {existingEntry ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#EDE8E0] rounded-lg">
            <X size={20} className="text-[#6B6560]" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className="text-sm font-medium text-[#2D2A26] mb-3">
              {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-3">
              Flux
            </label>
            <FlowSelector value={flow} onChange={setFlow} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-3">
              Symptômes
            </label>
            <SymptomGrid
              symptoms={uniqueSymptoms}
              selected={symptoms}
              onToggle={toggleSymptom}
            />
          </div>
          
          <div>
            <Textarea
              label="Notes"
              placeholder="Ajouter des notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          {existingEntry && (
            <div className="pt-4 border-t border-[#EDE8E0]">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6B6560] flex-1">Supprimer cette entrée ?</span>
                  <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                    Annuler
                  </Button>
                  <Button size="sm" variant="primary" onClick={handleDelete}>
                    Supprimer
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm text-[#C17B7B] hover:underline"
                >
                  {t.actions.delete}
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[#EDE8E0]">
          <Button onClick={handleSave} loading={isSaving} className="w-full">
            {t.actions.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
