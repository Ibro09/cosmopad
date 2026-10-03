import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, ShieldCheck, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { UPCOMING_LAUNCHES } from '../data/orbixData';
import { LaunchMission } from '../types';

interface UpcomingLaunchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpcomingLaunchesModal: React.FC<UpcomingLaunchesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ORBILAUNCH 9' | 'ORBISTAR HEAVY' | 'ORBIHEAVY'>('ALL');
  const [activeMission, setActiveMission] = useState<LaunchMission>(UPCOMING_LAUNCHES[0]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 7,
    hours: 6,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer for next mission
  useEffect(() => {
    if (!isOpen) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = activeMission.targetDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeMission]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMissions = UPCOMING_LAUNCHES.filter((m) => {
    if (selectedFilter === 'ALL') return true;
    return m.vehicle.toUpperCase() === selectedFilter;
  });

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div
      id="upcoming-launches-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
    >
      <div
        id="upcoming-launches-dialog"
        className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Launch Cadence & RWA Revenue Pipeline
              </h3>
              <p className="text-[10px] text-neutral-400 tracking-wider">
                Operational flight pipeline generating value for wrapped space assets on Robinhood Chain
              </p>
            </div>
          </div>

          <button
            id="close-upcoming-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Featured Next Launch Banner */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-950/80 border-b border-l border-emerald-500/30 text-[10px] uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> REVENUE EVENT
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-white/10 text-[11px] font-semibold tracking-wider text-neutral-300">
                    {activeMission.vehicle}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono tracking-wider">
                    {activeMission.booster}
                  </span>
                  {activeMission.estimatedContractValue && (
                    <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" />
                      {activeMission.estimatedContractValue}
                    </span>
                  )}
                </div>
                <h4 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">
                  {activeMission.name}
                </h4>
                <p className="text-neutral-300 text-xs md:text-sm leading-relaxed max-w-xl">
                  {activeMission.description}
                </p>
                {activeMission.assetBackingImpact && (
                  <div className="p-3 bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase block font-bold">
                      RWA ASSET IMPACT
                    </span>
                    {activeMission.assetBackingImpact}
                  </div>
                )}
              </div>

              {/* Countdown Clock */}
              <div className="bg-black/60 border border-neutral-800 p-5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] tracking-[0.25em] font-semibold text-neutral-400 uppercase mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-400" /> COUNTDOWN TO LAUNCH
                </span>
                <div className="flex items-baseline justify-center gap-1.5 font-mono font-bold tracking-tight text-white">
                  {timeLeft.days > 0 && (
                    <>
                      <span className="text-2xl sm:text-3xl text-emerald-400">T-{timeLeft.days}d</span>
                      <span className="text-neutral-500 text-lg font-normal">:</span>
                    </>
                  )}
                  {timeLeft.days === 0 && (
                    <span className="text-2xl sm:text-3xl text-emerald-400">T-</span>
                  )}
                  <span className="text-2xl sm:text-3xl">
                    {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] tracking-wider text-neutral-400 mt-2 font-mono uppercase">
                  {timeLeft.days > 0 && <span>{timeLeft.days} Days</span>}
                  <span>{padZero(timeLeft.hours)}h</span>
                  <span>{padZero(timeLeft.minutes)}m</span>
                  <span>{padZero(timeLeft.seconds)}s</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-300 mt-2">
                  {activeMission.dateString}
                </span>

                <div className="mt-4 w-full py-2 bg-neutral-800/80 border border-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  CONFIRMED LAUNCH WINDOW
                </div>
              </div>
            </div>

            {/* Launch Parameters Grid */}
            <div className="mt-6 pt-6 border-t border-neutral-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 uppercase text-[10px] tracking-wider block mb-1">Launch Site</span>
                <span className="text-neutral-200 font-medium block truncate" title={activeMission.site}>
                  {activeMission.site.split(',')[0]}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] tracking-wider block mb-1">Target Orbit</span>
                <span className="text-neutral-200 font-medium block">{activeMission.orbit}</span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] tracking-wider block mb-1">Recovery Plan</span>
                <span className="text-neutral-200 font-medium block truncate" title={activeMission.recovery}>
                  {activeMission.recovery}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] tracking-wider block mb-1">Asset Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ONCHAIN
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Flight Manifest Table & Filters */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                Scheduled Fleet Missions
              </h5>

              {/* Vehicle Filter Buttons */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 border border-neutral-800 text-xs overflow-x-auto">
                {(['ALL', 'ORBILAUNCH 9', 'ORBISTAR HEAVY', 'ORBIHEAVY'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      const matched = UPCOMING_LAUNCHES.filter((m) => filter === 'ALL' || m.vehicle.toUpperCase() === filter);
                      if (matched.length > 0 && !matched.some(m => m.id === activeMission.id)) {
                        setActiveMission(matched[0]);
                      }
                    }}
                    className={`px-3 py-1 font-semibold tracking-wider text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                      selectedFilter === filter
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-neutral-900 border border-neutral-800 bg-neutral-950">
              {filteredMissions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => setActiveMission(mission)}
                  className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors ${
                    activeMission.id === mission.id
                      ? 'bg-white/5 border-l-2 border-l-emerald-400'
                      : 'hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                        {mission.vehicle}
                      </span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {mission.dateString}
                      </span>
                    </div>
                    <div className="text-base font-bold text-white uppercase tracking-tight">
                      {mission.name}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      {mission.site}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {mission.estimatedContractValue && (
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        {mission.estimatedContractValue}
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono uppercase">
                      {mission.orbit}
                    </span>
                    <span className="text-[11px] px-3 py-1 border border-neutral-700 text-neutral-300">
                      {mission.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/40 flex flex-col sm:flex-row items-center justify-between text-neutral-400 text-xs gap-3">
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>TOTAL MISSIONS: <strong className="text-white">400+</strong></span>
            <span>LANDINGS: <strong className="text-white">360+</strong></span>
            <span>SETTLEMENT: <strong className="text-emerald-400">ROBINHOOD CHAIN</strong></span>
          </div>
          <span className="text-neutral-500 text-[11px]">
            Verifiable OrbiX Aerospace Equity & Warrants SPV
          </span>
        </div>
      </div>
    </div>
  );
};
