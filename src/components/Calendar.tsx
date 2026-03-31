'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, isToday, isSameDay, formatDate } from '@/lib/utils';
import { TRANSLATIONS, FLOW_COLORS } from '@/lib/constants';
import { CycleEntry, FlowIntensity } from '@/lib/types';

interface CalendarProps {
  entries: CycleEntry[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  prediction?: { nextPeriodDate: string | null };
}

export function Calendar({ entries, selectedDate, onSelectDate, prediction }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const t = TRANSLATIONS.fr;
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long' });
  
  const entryMap = new Map(entries.map(e => [e.date, e]));
  
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };
  
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const getDateString = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className="p-2 hover:bg-[#EDE8E0] rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-[#6B6560]" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-[#2D2A26] capitalize">{monthName}</span>
          <span className="text-lg text-[#6B6560]">{currentYear}</span>
        </div>
        <button onClick={goToNextMonth} className="p-2 hover:bg-[#EDE8E0] rounded-lg transition-colors">
          <ChevronRight size={20} className="text-[#6B6560]" />
        </button>
      </div>
      
      <div className="flex justify-end mb-2">
        <button onClick={goToToday} className="text-sm text-[#C4A77D] hover:underline">
          {t.actions.today}
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-[#6B6560] py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(i => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}
        
        {days.map(day => {
          const dateStr = getDateString(day);
          const entry = entryMap.get(dateStr);
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(dateStr);
          const flowColor = entry ? FLOW_COLORS[entry.flow] : 'transparent';
          
          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative ${
                isSelected 
                  ? 'bg-[#C4A77D] text-white' 
                  : isTodayDate 
                    ? 'ring-2 ring-[#C4A77D]' 
                    : 'hover:bg-[#EDE8E0]'
              }`}
            >
              <span className={isSelected ? 'font-semibold' : ''}>{day}</span>
              {entry && entry.flow !== 'none' && (
                <div 
                  className="absolute bottom-1 flex gap-0.5"
                >
                  {['light', 'medium', 'heavy'].includes(entry.flow) && (
                    <>
                      <div 
                        className="w-1 h-1 rounded-full" 
                        style={{ backgroundColor: isSelected ? 'white' : flowColor }}
                      />
                      {(entry.flow === 'medium' || entry.flow === 'heavy') && (
                        <div 
                          className="w-1 h-1 rounded-full" 
                          style={{ backgroundColor: isSelected ? 'white' : flowColor }}
                        />
                      )}
                      {entry.flow === 'heavy' && (
                        <div 
                          className="w-1 h-1 rounded-full" 
                          style={{ backgroundColor: isSelected ? 'white' : flowColor }}
                        />
                      )}
                    </>
                  )}
                  {entry.flow === 'spotting' && (
                    <div 
                      className="w-1 h-1 rounded-full opacity-60" 
                      style={{ backgroundColor: isSelected ? 'white' : flowColor }}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {prediction?.nextPeriodDate && (
        <div className="mt-4 pt-4 border-t border-[#EDE8E0]">
          <p className="text-sm text-[#6B6560] text-center">
            Prochaines règles previstas: <span className="font-medium text-[#2D2A26]">
              {new Date(prediction.nextPeriodDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
