import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Check, Download, Trash2 } from 'lucide-react';
import { useNativeBridge } from '../hooks/useNativeBridge';

const SettingsModal = ({ isOpen, onClose, t, isDarkMode, setIsDarkMode, currentLang, setLang, entries, onDeleteAllData }: any) => {
  const [trackingMode, setTrackingMode] = useState('simple');
  const [notifications, setNotifications] = useState({
    tracking: true,
    predictions: true,
    medication: false
  });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { isNative, isLifetime, purchaseLifetime, restorePurchases } = useNativeBridge();

  const handleExportData = () => {
    if (!entries) return;
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "safecycle_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllData = async () => {
    if (window.confirm(t.deleteAllData + "?")) {
      if (onDeleteAllData) await onDeleteAllData();
      onClose();
    }
  };

  const handlePurchaseLifetime = async () => {
    if (isLifetime) return;
    if (!isNative) {
      window.alert('Lifetime purchase is available in the SafeCycle iOS/Android app.');
      return;
    }
    setIsPurchasing(true);
    await purchaseLifetime();
    setIsPurchasing(false);
  };

  const handleRestorePurchases = async () => {
    if (!isNative) return;
    setIsPurchasing(true);
    await restorePurchases();
    setIsPurchasing(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-0 z-[80] bg-[#F5F5F0] dark:bg-surface overflow-y-auto"
      >
        <div className="max-w-md mx-auto px-4 py-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#1b1c1a] dark:text-on-surface">{t.settings}</h2>
            <button onClick={onClose} aria-label={t.close || 'Close'} className="p-2 rounded-full bg-white dark:bg-surface-low shadow-sm cursor-pointer hover:bg-surface-low transition-colors">
              <X className="w-5 h-5 text-[#1b1c1a] dark:text-on-surface" />
            </button>
          </div>

          {/* Mode de suivi */}
          <div className="bg-white dark:bg-surface-low rounded-2xl p-4 mb-6 shadow-sm">
            <h3 className="font-sans text-sm font-semibold text-[#1b1c1a] dark:text-on-surface mb-3">{t.trackingMode}</h3>
            <div className="flex flex-col gap-2">
              {[
                { id: 'simple', label: t.modeSimple },
                { id: 'pcos', label: t.modePCOS },
                { id: 'endometriosis', label: t.modeEndometriosis },
                { id: 'contraception', label: t.modeContraception }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setTrackingMode(mode.id)}
                  className={`flex justify-between items-center p-3 rounded-xl font-sans text-sm transition-colors cursor-pointer ${
                    trackingMode === mode.id 
                      ? 'bg-[#C6A87C] text-white' 
                      : 'bg-[#E8E6E1] dark:bg-surface text-[#1b1c1a] dark:text-on-surface hover:bg-[#E8E6E1]/80'
                  }`}
                >
                  {mode.label}
                  {trackingMode === mode.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-surface-low rounded-2xl p-4 mb-6 shadow-sm">
            <h3 className="font-sans text-sm font-semibold text-[#1b1c1a] dark:text-on-surface mb-3">{t.notifications}</h3>
            <div className="flex flex-col gap-3">
              <label className="flex justify-between items-center cursor-pointer">
                <span className="font-sans text-sm text-[#1b1c1a] dark:text-on-surface">{t.trackingReminders}</span>
                <input 
                  type="checkbox" 
                  checked={notifications.tracking} 
                  onChange={(e) => setNotifications({...notifications, tracking: e.target.checked})}
                  className="w-5 h-5 rounded border-[#C6A87C] text-[#C6A87C] focus:ring-[#C6A87C] bg-[#E8E6E1] dark:bg-surface accent-[#C6A87C] cursor-pointer"
                />
              </label>
              <label className="flex justify-between items-center cursor-pointer">
                <span className="font-sans text-sm text-[#1b1c1a] dark:text-on-surface">{t.predictions}</span>
                <input 
                  type="checkbox" 
                  checked={notifications.predictions} 
                  onChange={(e) => setNotifications({...notifications, predictions: e.target.checked})}
                  className="w-5 h-5 rounded border-[#C6A87C] text-[#C6A87C] focus:ring-[#C6A87C] bg-[#E8E6E1] dark:bg-surface accent-[#C6A87C] cursor-pointer"
                />
              </label>
              <label className="flex justify-between items-center cursor-pointer">
                <span className="font-sans text-sm text-[#1b1c1a] dark:text-on-surface">{t.medicationReminders}</span>
                <input 
                  type="checkbox" 
                  checked={notifications.medication} 
                  onChange={(e) => setNotifications({...notifications, medication: e.target.checked})}
                  className="w-5 h-5 rounded border-[#C6A87C] text-[#C6A87C] focus:ring-[#C6A87C] bg-[#E8E6E1] dark:bg-surface accent-[#C6A87C] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* SafeCycle Lifetime */}
          <div className="bg-[#C6A87C] rounded-2xl p-5 mb-6 shadow-sm text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">SafeCycle Lifetime</h3>
                <p className="font-sans text-sm opacity-90">{isLifetime ? '✓ Active' : '19,99 $'}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2 mb-5">
              {[t.lifetimeAccess, t.allFeatures, t.noAds, t.prioritySupport].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 font-sans text-sm">
                  <Check className="w-4 h-4 opacity-80" />
                  {feature}
                </li>
              ))}
            </ul>
            {!isLifetime && (
              <button
                onClick={handlePurchaseLifetime}
                disabled={isPurchasing}
                className="w-full py-3 bg-white text-[#C6A87C] rounded-xl font-sans font-semibold text-sm hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isPurchasing ? '...' : (t.getLifetime || 'Get SafeCycle Lifetime')}
              </button>
            )}
            {isLifetime && (
              <div className="w-full py-3 bg-white/20 text-white rounded-xl font-sans font-semibold text-sm text-center">
                ✓ {t.lifetimeAccess || 'Lifetime Access Active'}
              </div>
            )}
            {isNative && !isLifetime && (
              <button
                onClick={handleRestorePurchases}
                disabled={isPurchasing}
                className="w-full mt-2 py-2 text-white/70 font-sans text-xs underline cursor-pointer"
              >
                {t.restorePurchases || 'Restore purchases'}
              </button>
            )}
          </div>

          {/* Exporter mes données */}
          <div className="bg-white dark:bg-surface-low rounded-2xl p-4 mb-6 shadow-sm">
            <h3 className="font-sans text-sm font-semibold text-[#1b1c1a] dark:text-on-surface mb-3">{t.exportMyData}</h3>
            <button 
              onClick={handleExportData}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-[#C6A87C] text-[#C6A87C] font-sans text-sm hover:bg-[#C6A87C]/10 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t.exportMyDataJson}
            </button>
          </div>

          {/* Zone dangereuse */}
          <div className="bg-white dark:bg-surface-low rounded-2xl p-4 mb-8 shadow-sm">
            <h3 className="font-sans text-sm font-semibold text-[#1b1c1a] dark:text-on-surface mb-3">{t.dangerZone}</h3>
            <button 
              onClick={handleDeleteAllData}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-[#D9534F] hover:bg-[#D9534F]/10 transition-colors font-sans text-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {t.deleteAllData}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pb-8">
            <p className="font-sans text-xs text-outline mb-1">SafeCycle v1.0.0</p>
            <p className="font-sans text-xs text-outline">{t.encryptedData}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
