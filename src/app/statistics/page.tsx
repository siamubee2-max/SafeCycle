'use client';

import { useMemo } from 'react';
import { TrendingUp, Calendar, Droplets } from 'lucide-react';
import { Card } from '@/components/Card';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/lib/useTranslation';

export default function StatisticsPage() {
  const { state } = useApp();
  const { t, formatDate } = useTranslation();
  
  const hasEnoughData = state.statistics.averageCycleLength > 0;
  
  const cycleHistoryData = useMemo(() => {
    if (state.statistics.cycleHistory.length === 0) return null;
    
    const maxLength = Math.max(...state.statistics.cycleHistory.map(c => c.length));
    const minLength = Math.min(...state.statistics.cycleHistory.map(c => c.length));
    const range = maxLength - minLength || 1;
    
    return state.statistics.cycleHistory.map(c => ({
      ...c,
      height: ((c.length - minLength) / range) * 100,
    }));
  }, [state.statistics.cycleHistory]);
  
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-serif text-[#2D2A26]">{t.tabs.stats}</h1>
        <p className="text-sm text-[#6B6560] mt-1">
          {t.stats.subtitle}
        </p>
      </header>
      
      {!hasEnoughData ? (
        <Card className="text-center py-12">
          <TrendingUp size={48} className="mx-auto text-[#EDE8E0] mb-4" />
          <h3 className="text-lg font-medium text-[#2D2A26] mb-2">
            {t.stats.noData}
          </h3>
          <p className="text-sm text-[#6B6560]">
            {t.stats.noDataHint}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-[#C4A77D]" />
                <span className="text-sm text-[#6B6560]">{t.stats.avgCycle}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif text-[#2D2A26]">
                  {state.statistics.averageCycleLength}
                </span>
                <span className="text-sm text-[#6B6560]">{t.stats.days}</span>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Droplets size={18} className="text-[#C4A77D]" />
                <span className="text-sm text-[#6B6560]">{t.stats.avgLuteal}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif text-[#2D2A26]">
                  {state.statistics.averageLutealPhaseLength}
                </span>
                <span className="text-sm text-[#6B6560]">{t.stats.days}</span>
              </div>
            </Card>
          </div>
          
          {cycleHistoryData && cycleHistoryData.length > 1 && (
            <Card>
              <h3 className="text-sm font-medium text-[#2D2A26] mb-4">
                {t.stats.cycleLength}
              </h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {cycleHistoryData.map((cycle, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-[#C4A77D] rounded-t-md transition-all"
                      style={{ height: `${Math.max(cycle.height, 10)}%` }}
                    />
                    <span className="text-xs text-[#6B6560] mt-1">
                      {formatDate(cycle.date, { month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-xs text-[#6B6560]">
                  {cycleHistoryData[0].length} {t.stats.days} ({t.stats.last})
                </span>
              </div>
            </Card>
          )}
          
          {state.statistics.symptomCorrelations.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-[#2D2A26] mb-4">
                {t.stats.symptomsByPhase}
              </h3>
              <div className="space-y-3">
                {state.statistics.symptomCorrelations.slice(0, 5).map((correlation, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#2D2A26]">
                          {correlation.symptom}
                        </span>
                        <span className="text-xs text-[#6B6560]">
                          {correlation.frequency}% {t.phases[correlation.phase]}
                        </span>
                      </div>
                      <div className="h-2 bg-[#EDE8E0] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#C4A77D] rounded-full"
                          style={{ width: `${correlation.frequency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {state.prediction.nextPeriodDate && (
            <Card className="bg-[#C4A77D]/10 border border-[#C4A77D]/20">
              <h3 className="text-sm font-medium text-[#2D2A26] mb-2">
                {t.stats.predictions}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B6560]">{t.stats.nextPeriod}</span>
                  <span className="text-sm font-medium text-[#2D2A26]">
                    {formatDate(state.prediction.nextPeriodDate, {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                {state.prediction.ovulationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B6560]">{t.stats.estimatedOvulation}</span>
                    <span className="text-sm font-medium text-[#2D2A26]">
                      {formatDate(state.prediction.ovulationDate, {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B6560]">{t.stats.confidence}</span>
                  <span className="text-sm font-medium text-[#2D2A26]">
                    {Math.round(state.prediction.confidence * 100)}%
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}