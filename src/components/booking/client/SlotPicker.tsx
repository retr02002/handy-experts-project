'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepNavigator } from './StepNavigator';
import { ClientIcon } from '@/components/ui/ClientIcon';

type Status = 'available' | 'filling-fast' | 'occupied' | 'non-working';

interface TimeSlot {
  time: string;
  status: Status;
}

interface DayData {
  value: string;
  dayName: string;
  dateNum: number;
  month: string;
  status: Status;
  isWeekend: boolean;
  slots: {
    morning: TimeSlot[];
    afternoon: TimeSlot[];
    evening: TimeSlot[];
  };
}

// Pseudo-random generator to keep mock data stable per date
function pseudoRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296; // 0 to 1
  };
}

export function SlotPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Generate stable mock data
  const dates = useMemo<DayData[]>(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const prng = pseudoRandom(dateStr);
      
      const generateSlot = (time: string): TimeSlot => {
        if (isWeekend) return { time, status: 'non-working' };
        
        // Randomly assign statuses for weekdays
        const rand = prng(); 
        // 50% available, 30% filling-fast, 20% occupied
        if (rand < 0.2) return { time, status: 'occupied' };
        if (rand < 0.5) return { time, status: 'filling-fast' };
        return { time, status: 'available' };
      };

      const morning = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'].map(generateSlot);
      const afternoon = ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'].map(generateSlot);
      const evening = ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'].map(generateSlot);
      
      const allSlots = [...morning, ...afternoon, ...evening];
      
      let dayStatus: Status = 'available';
      if (isWeekend) {
        dayStatus = 'non-working';
      } else {
        const occupiedCount = allSlots.filter(s => s.status === 'occupied').length;
        const fastCount = allSlots.filter(s => s.status === 'filling-fast').length;
        if (occupiedCount === allSlots.length) dayStatus = 'occupied';
        else if (occupiedCount + fastCount > allSlots.length / 2) dayStatus = 'filling-fast';
      }

      return {
        value: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        status: dayStatus,
        isWeekend,
        slots: { morning, afternoon, evening }
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const param = searchParams.get('date');
    if (param) return param;
    const firstAvailable = dates.find(d => d.status !== 'non-working' && d.status !== 'occupied');
    return firstAvailable ? firstAvailable.value : null;
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(searchParams.get('time') || null);

  const handleNext = (params: URLSearchParams) => {
    if (selectedDate) params.set('date', selectedDate);
    if (selectedTime) params.set('time', selectedTime);
    return params;
  };

  const getStatusColors = (status: Status, isSelected: boolean = false) => {
    switch (status) {
      case 'available':
        return isSelected 
          ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-500/30' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
      case 'filling-fast':
        return isSelected 
          ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30' 
          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300';
      case 'occupied':
        return 'bg-rose-50 text-rose-400 border-rose-100 opacity-60 cursor-not-allowed';
      case 'non-working':
      default:
        return 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed';
    }
  };

  const getDayDotColor = (status: Status) => {
    switch (status) {
      case 'available': return 'bg-emerald-500';
      case 'filling-fast': return 'bg-amber-500';
      case 'occupied': return 'bg-rose-500';
      case 'non-working': return 'bg-slate-300';
    }
  };

  const activeDay = dates.find(d => d.value === selectedDate);

  const renderSlotGroup = (title: string, icon: string, slots: TimeSlot[]) => {
    if (!slots || slots.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <ClientIcon icon={icon} className="text-lg text-slate-400" />
          {title}
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            const isSelectable = slot.status === 'available' || slot.status === 'filling-fast';
            
            return (
              <div 
                key={slot.time}
                onClick={() => {
                  if (isSelectable) setSelectedTime(slot.time);
                }}
                className={`py-3 px-2 rounded-xl border-2 text-center font-bold text-xs sm:text-sm transition-all duration-300 ${getStatusColors(slot.status, isSelected)} ${isSelectable ? 'cursor-pointer' : ''}`}
              >
                {slot.time}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Filling Fast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Non-working</span>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <ClientIcon icon="ph:calendar-blank" className="text-lg" />
          Select Date
        </h3>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto px-4 -mx-4 pt-4 -mt-4 pb-8 -mb-4 hide-scrollbar snap-x">
          {dates.map((d) => {
            const isSelected = selectedDate === d.value;
            const isSelectable = d.status === 'available' || d.status === 'filling-fast';
            
            return (
              <div 
                key={d.value}
                onClick={() => {
                  if (isSelectable) {
                    setSelectedDate(d.value);
                    setSelectedTime(null); // Reset time when date changes
                  }
                }}
                className={`snap-center relative min-w-[85px] sm:min-w-[90px] shrink-0 p-3 sm:p-4 rounded-2xl border-2 text-center transition-all duration-300 ${isSelectable ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-not-allowed opacity-60'} ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30 -translate-y-1' 
                    : 'border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{d.month}</div>
                <div className={`text-2xl sm:text-3xl font-black mb-1 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{d.dateNum}</div>
                <div className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{d.dayName}</div>
                
                {/* Status Indicator */}
                <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${getDayDotColor(d.status)}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <ClientIcon icon="ph:clock" className="text-lg" />
          Select Time
        </h3>
        
        {activeDay ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
            {renderSlotGroup('Morning', 'ph:sun-horizon', activeDay.slots.morning)}
            {renderSlotGroup('Afternoon', 'ph:sun', activeDay.slots.afternoon)}
            {renderSlotGroup('Evening', 'ph:moon-stars', activeDay.slots.evening)}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 font-medium">Please select a valid date first.</p>
          </div>
        )}
      </div>

      <StepNavigator 
        prevStep="location"
        nextStep="details"
        isNextDisabled={!selectedDate || !selectedTime}
        onNext={handleNext}
      />
    </div>
  );
}
