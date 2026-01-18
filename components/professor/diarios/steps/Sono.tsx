'use client';

import React, { useState } from 'react';
import { PeriodoSono } from '@/types/diario';

interface SonoProps {
  value: PeriodoSono[];
  onChange: (value: PeriodoSono[]) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7-19
const MINUTES = [0, 15, 30, 45];

export default function Sono({ value, onChange }: SonoProps) {
  const [newSleepHour, setNewSleepHour] = useState(7);
  const [newSleepMinute, setNewSleepMinute] = useState(0);
  const [newWakeHour, setNewWakeHour] = useState(7);
  const [newWakeMinute, setNewWakeMinute] = useState(15);

  const handleSleepHourChange = (hour: number) => {
    setNewSleepHour(hour);

    const currentWakeTime = newWakeHour * 60 + newWakeMinute;
    const newSleepTime = hour * 60 + newSleepMinute;

    if (currentWakeTime <= newSleepTime) {
      const nextMinuteIndex = MINUTES.findIndex(m => m > newSleepMinute);
      if (nextMinuteIndex !== -1) {
        setNewWakeHour(hour);
        setNewWakeMinute(MINUTES[nextMinuteIndex]);
      } else {
        if (hour < 19) {
          setNewWakeHour(hour + 1);
          setNewWakeMinute(MINUTES[0]);
        }
      }
    }
  };

  const handleSleepMinuteChange = (minute: number) => {
    setNewSleepMinute(minute);
    
    const currentWakeTime = newWakeHour * 60 + newWakeMinute;
    const newSleepTime = newSleepHour * 60 + minute;

    if (currentWakeTime <= newSleepTime) {
      const nextMinuteIndex = MINUTES.findIndex(m => m > minute);
      if (nextMinuteIndex !== -1) {
        setNewWakeHour(newSleepHour);
        setNewWakeMinute(MINUTES[nextMinuteIndex]);
      } else {
        if (newSleepHour < 19) {
          setNewWakeHour(newSleepHour + 1);
          setNewWakeMinute(MINUTES[0]);
        }
      }
    }
  };

  const formatTimeString = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const calculateTotalTimeString = (
    sleepHour: number,
    sleepMinute: number,
    wakeHour: number,
    wakeMinute: number
  ): string => {
    if (sleepHour === wakeHour && sleepMinute === wakeMinute) {
      return '00:00';
    }

    let sleepMinutes = sleepHour * 60 + sleepMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;

    if (wakeMinutes < sleepMinutes) {
      wakeMinutes += 24 * 60;
    }
    const diffMinutes = wakeMinutes - sleepMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isTimeDisabled = (h: number, m: number, minHour?: number, minMinute?: number): boolean => {
    if (minHour === undefined || minMinute === undefined) return false;

    if (m === 0) {
      return h < minHour;
    }

    if (h === minHour) {
      return m <= minMinute;
    }

    return h < minHour;
  };

  const isTimesEqual = (): boolean => {
    return newSleepHour === newWakeHour && newSleepMinute === newWakeMinute;
  };

  const handleAddPeriod = () => {
    if (isTimesEqual()) return;

    const tempoTotal = calculateTotalTimeString(
      newSleepHour,
      newSleepMinute,
      newWakeHour,
      newWakeMinute
    );

    const newPeriod: PeriodoSono = {
      id: Date.now().toString(),
      sleepHour: newSleepHour,
      sleepMinute: newSleepMinute,
      wakeHour: newWakeHour,
      wakeMinute: newWakeMinute,
      saved: true,
      horaDormiu: formatTimeString(newSleepHour, newSleepMinute),
      horaAcordou: formatTimeString(newWakeHour, newWakeMinute),
      tempoTotal: tempoTotal,
    };
    onChange([...value, newPeriod]);
  };

  const handleRemoveSleep = (id: string | number) => {
    onChange(value.filter((period) => period.id !== id));
  };

  const formatDuration = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (hours === 0) return `${minutes}min`;
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-blue-50/50 p-4 md:p-6 rounded-3xl border border-blue-100 space-y-3 md:space-y-6">
        <h3 className="text-[10px] md:text-sm font-bold text-blue-800 uppercase tracking-widest pl-1">Adicionar Período</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {/* Dormiu */}
          <div className="space-y-2 md:space-y-4">
            <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider block px-1">Dormiu</label>
            <div className="bg-white p-3 md:p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3 md:space-y-4">
              <div className="text-center py-1 md:py-2">
                <span className="text-2xl md:text-3xl font-black text-blue-600">{formatTimeString(newSleepHour, newSleepMinute)}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-3 px-1 scrollbar-none -mx-1 p-2">
                  {HOURS.map((h) => (
                    <button
                      key={`sleep-h-${h}`}
                      onClick={() => handleSleepHourChange(h)}
                      className={`flex-shrink-0 w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        newSleepHour === h ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-center">
                  {MINUTES.map((m) => (
                    <button
                      key={`sleep-m-${m}`}
                      onClick={() => handleSleepMinuteChange(m)}
                      className={`w-12 h-10 rounded-xl font-bold text-sm transition-all ${
                        newSleepMinute === m ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Acordou */}
          <div className="space-y-2 md:space-y-4">
            <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider block px-1">Acordou</label>
            <div className="bg-white p-3 md:p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3 md:space-y-4">
              <div className="text-center py-1 md:py-2">
                <span className="text-2xl md:text-3xl font-black text-amber-500">{formatTimeString(newWakeHour, newWakeMinute)}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-3 px-1 scrollbar-none -mx-1 p-2">
                  {HOURS.map((h) => {
                    const disabled = h < newSleepHour;
                    return (
                      <button
                        key={`wake-h-${h}`}
                        disabled={disabled}
                        onClick={() => setNewWakeHour(h)}
                        className={`flex-shrink-0 w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          newWakeHour === h ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' : 
                          disabled ? 'opacity-20 cursor-not-allowed' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 justify-center">
                  {MINUTES.map((m) => {
                    const disabled = newWakeHour === newSleepHour && m <= newSleepMinute;
                    return (
                      <button
                        key={`wake-m-${m}`}
                        disabled={disabled}
                        onClick={() => setNewWakeMinute(m)}
                        className={`w-12 h-10 rounded-xl font-bold text-sm transition-all ${
                          newWakeMinute === m ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' : 
                          disabled ? 'opacity-20 cursor-not-allowed' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddPeriod}
          disabled={isTimesEqual()}
          className="w-full py-3 md:py-4 bg-blue-500/80 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:shadow-none text-sm md:text-base"
        >
          Adicionar Período
        </button>
      </div>

      {/* List of periods */}
      <div className="space-y-3">
        {value.map((period) => (
          <div key={period.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                {formatTimeString(period.sleepHour || 0, period.sleepMinute || 0)}
              </div>
              <div className="h-px w-4 bg-gray-200" />
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center font-black">
                {formatTimeString(period.wakeHour || 0, period.wakeMinute || 0)}
              </div>
              <div className="ml-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duração</p>
                <p className="text-sm font-bold text-gray-700">{formatDuration(period.tempoTotal || '00:00')}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveSleep(period.id!)}
              className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {value.length === 0 && (
          <p className="text-center py-8 text-gray-300 font-medium italic">Nenhum período registrado.</p>
        )}
      </div>
    </div>
  );
}
