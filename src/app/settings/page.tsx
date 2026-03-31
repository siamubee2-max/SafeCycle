'use client';

import { useState } from 'react';
import { Shield, Download, Trash2, Crown, Check, Globe } from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/lib/useTranslation';
import { TrackingMode } from '@/lib/types';
import { deleteAllData, exportAllData } from '@/lib/storage';
import { showToast } from '@/components/Toast';

export default function SettingsPage() {
  const { state, setTrackingMode, updateSettings, refreshData } = useApp();
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const modes: { value: TrackingMode; label: string }[] = [
    { value: 'simple', label: t.modes.simple },
    { value: 'sopk', label: t.modes.sopk },
    { value: 'endometriosis', label: t.modes.endometriosis },
    { value: 'contraception', label: t.modes.contraception },
  ];
  
  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safecycle-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t.toast.dataExported, 'success');
    } catch (error) {
      showToast(t.toast.exportError, 'error');
    }
  };
  
  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllData();
      await refreshData();
      setShowDeleteConfirm(false);
      showToast(t.toast.dataDeleted, 'success');
    } catch (error) {
      showToast(t.toast.deleteError, 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handlePurchase = () => {
    showToast(t.toast.purchaseNotImplemented, 'info');
  };
  
  const handleLanguageChange = async (lang: 'fr' | 'en') => {
    await updateSettings({ language: lang });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-serif text-[#2D2A26]">{t.tabs.settings}</h1>
      </header>
      
      <div className="space-y-4">
        <Card className="bg-[#7D9C7D]/10 border border-[#7D9C7D]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#7D9C7D]/20 flex items-center justify-center">
              <Shield size={24} className="text-[#7D9C7D]" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[#2D2A26]">{t.privacy.badge}</h3>
              <p className="text-sm text-[#6B6560] mt-0.5">
                {t.privacy.description}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-[#2D2A26] mb-3">
            <Globe size={16} className="inline mr-2" />
            {t.settings.language}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange('fr')}
              className={`flex-1 p-3 rounded-lg transition-colors ${
                state.settings.language === 'fr'
                  ? 'bg-[#C4A77D] text-white'
                  : 'bg-[#EDE8E0] text-[#6B6560] hover:bg-[#E8D5C4]'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 p-3 rounded-lg transition-colors ${
                state.settings.language === 'en'
                  ? 'bg-[#C4A77D] text-white'
                  : 'bg-[#EDE8E0] text-[#6B6560] hover:bg-[#E8D5C4]'
              }`}
            >
              English
            </button>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-[#2D2A26] mb-3">
            {t.settings.trackingMode}
          </h3>
          <div className="space-y-2">
            {modes.map(mode => (
              <button
                key={mode.value}
                onClick={() => setTrackingMode(mode.value)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  state.settings.mode === mode.value
                    ? 'bg-[#C4A77D] text-white'
                    : 'bg-[#EDE8E0] text-[#6B6560] hover:bg-[#E8D5C4]'
                }`}
              >
                <span className="text-sm font-medium">{mode.label}</span>
                {state.settings.mode === mode.value && (
                  <Check size={18} />
                )}
              </button>
            ))}
          </div>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-[#2D2A26] mb-3">
            {t.settings.notifications}
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#6B6560]">{t.settings.reminders}</span>
              <input
                type="checkbox"
                checked={state.settings.notifications.reminders}
                onChange={(e) => updateSettings({
                  notifications: {
                    ...state.settings.notifications,
                    reminders: e.target.checked,
                  },
                })}
                className="w-5 h-5 accent-[#C4A77D]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#6B6560]">{t.settings.predictions}</span>
              <input
                type="checkbox"
                checked={state.settings.notifications.predictions}
                onChange={(e) => updateSettings({
                  notifications: {
                    ...state.settings.notifications,
                    predictions: e.target.checked,
                  },
                })}
                className="w-5 h-5 accent-[#C4A77D]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#6B6560]">{t.settings.medication}</span>
              <input
                type="checkbox"
                checked={state.settings.notifications.medication}
                onChange={(e) => updateSettings({
                  notifications: {
                    ...state.settings.notifications,
                    medication: e.target.checked,
                  },
                })}
                className="w-5 h-5 accent-[#C4A77D]"
              />
            </label>
          </div>
        </Card>
        
        {!state.settings.hasPro && (
          <Card className="bg-gradient-to-br from-[#C4A77D] to-[#D4A574]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Crown size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{t.purchase.title}</h3>
                <p className="text-sm text-white/80">{t.purchase.price}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {t.purchase.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-white/90">
                  <Check size={16} className="text-white/80" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              onClick={handlePurchase}
              className="w-full bg-white text-[#C4A77D] hover:bg-white/90"
            >
              {t.purchase.cta}
            </Button>
          </Card>
        )}
        
        <Card>
          <h3 className="text-sm font-medium text-[#2D2A26] mb-3">
            {t.actions.exportData}
          </h3>
          <Button 
            variant="secondary" 
            icon={Download}
            onClick={handleExport}
            className="w-full"
          >
            {t.settings.exportJson}
          </Button>
        </Card>
        
        <Card>
          <h3 className="text-sm font-medium text-[#2D2A26] mb-3">
            {t.settings.dangerZone}
          </h3>
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-[#6B6560]">
                {t.confirm.deleteAll}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  {t.actions.cancel}
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleDeleteAll}
                  loading={isDeleting}
                  className="flex-1 bg-[#C17B7B] hover:bg-[#B06A6A]"
                >
                  {t.actions.deleteAll}
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-[#C17B7B]"
            >
              {t.actions.deleteAll}
            </Button>
          )}
        </Card>
        
        <div className="text-center pt-4">
          <p className="text-xs text-[#6B6560]">
            SafeCycle v1.0.0
          </p>
          <p className="text-xs text-[#6B6560] mt-1">
            {t.settings.encryptedWith}
          </p>
        </div>
      </div>
    </div>
  );
}