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
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dormiu */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">Dormiu</label>
            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
              <div className="text-center py-1">
                <span className="text-xl font-semibold text-blue-600">{formatTimeString(newSleepHour, newSleepMinute)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none -mx-1">
                  {HOURS.map((h) => (
                    <button
                      key={`sleep-h-${h}`}
                      onClick={() => handleSleepHourChange(h)}
                      className={`flex-shrink-0 w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                        newSleepHour === h ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                      className={`w-12 h-10 rounded-lg font-medium text-sm transition-all ${
                        newSleepMinute === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">Acordou</label>
            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
              <div className="text-center py-1">
                <span className="text-xl font-semibold text-blue-600">{formatTimeString(newWakeHour, newWakeMinute)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none -mx-1">
                  {HOURS.map((h) => {
                    const disabled = h < newSleepHour;
                    return (
                      <button
                        key={`wake-h-${h}`}
                        disabled={disabled}
                        onClick={() => setNewWakeHour(h)}
                        className={`flex-shrink-0 w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                          newWakeHour === h ? 'bg-blue-600 text-white' : 
                          disabled ? 'opacity-20 cursor-not-allowed' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                        className={`w-12 h-10 rounded-lg font-medium text-sm transition-all ${
                          newWakeMinute === m ? 'bg-blue-600 text-white' : 
                          disabled ? 'opacity-20 cursor-not-allowed' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Adicionar Período
        </button>
      </div>

      {/* List of periods */}
      <div className="space-y-2">
        {value.map((period) => (
          <div key={period.id} className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              {/* Top Left: Dormiu */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Dormiu</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium border border-blue-100 text-center">
                  {formatTimeString(period.sleepHour || 0, period.sleepMinute || 0)}
                </span>
              </div>
              
              {/* Top Right: Delete Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleRemoveSleep(period.id!)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all h-fit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* Bottom Left: Acordou */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Acordou</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium border border-blue-100 text-center">
                  {formatTimeString(period.wakeHour || 0, period.wakeMinute || 0)}
                </span>
              </div>
              
              {/* Bottom Right: Duration */}
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-gray-500">Duração</span>
                <span className="text-sm font-semibold text-gray-900">{formatDuration(period.tempoTotal || '00:00')}</span>
              </div>
            </div>
          </div>
        ))}
        {value.length === 0 && (
          <p className="text-center py-6 text-gray-400 text-sm">Nenhum período registrado.</p>
        )}
      </div>
    </div>
  );
}
