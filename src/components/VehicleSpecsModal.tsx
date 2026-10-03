import React, { useState, useEffect } from 'react';
import { X, Gauge, Layers, ShieldCheck, CheckCircle2, Coins, Landmark, FileText, ArrowUpRight } from 'lucide-react';
import { VEHICLE_SPECS } from '../data/orbixData';
import { VehicleSpec } from '../types';

interface VehicleSpecsModalProps {
  isOpen: boolean;
  vehicleId: 'starship' | 'falcon9' | 'falcon-heavy' | 'dragon';
  onClose: () => void;
  onSelectVehicle: (id: 'starship' | 'falcon9' | 'falcon-heavy' | 'dragon') => void;
  onOpenProtocol?: () => void;
}

export const VehicleSpecsModal: React.FC<VehicleSpecsModalProps> = ({
  isOpen,
  vehicleId,
  onClose,
  onSelectVehicle,
  onOpenProtocol,
}) => {
  const [unit, setUnit] = useState<'METRIC' | 'IMPERIAL'>('METRIC');
  const [viewTab, setViewTab] = useState<'RWA' | 'TECH'>('RWA');
  const vehicle: VehicleSpec = VEHICLE_SPECS[vehicleId] || VEHICLE_SPECS.starship;

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

  const isMetric = unit === 'METRIC';

  return (
    <div
      id="vehicle-specs-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
    >
      <div
        id="vehicle-specs-dialog"
        className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-white"
      >
        {/* Header with Vehicle Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 bg-neutral-900/70 px-6 py-4 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['starship', 'falcon9', 'falcon-heavy', 'dragon'] as const).map((id) => (
              <button
                key={id}
                onClick={() => onSelectVehicle(id)}
                className={`px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  vehicleId === id
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {VEHICLE_SPECS[id].name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* View Mode Toggle: RWA Economics vs Tech Specs */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 text-xs">
              <button
                onClick={() => setViewTab('RWA')}
                className={`px-3 py-1 font-semibold tracking-wider text-[11px] cursor-pointer ${
                  viewTab === 'RWA' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                RWA ECONOMICS
              </button>
              <button
                onClick={() => setViewTab('TECH')}
                className={`px-3 py-1 font-semibold tracking-wider text-[11px] cursor-pointer ${
                  viewTab === 'TECH' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                ENGINEERING
              </button>
            </div>

            {viewTab === 'TECH' && (
              <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 text-xs">
                <button
                  onClick={() => setUnit('METRIC')}
                  className={`px-2 py-1 font-semibold tracking-wider text-[11px] cursor-pointer ${
                    isMetric ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => setUnit('IMPERIAL')}
                  className={`px-2 py-1 font-semibold tracking-wider text-[11px] cursor-pointer ${
                    !isMetric ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  FT
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Overview */}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-emerald-400">
                TOKENIZED SPACE ASSET • ROBINHOOD CHAIN
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mt-1">
              {vehicle.name}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-medium mt-1">
              {vehicle.tagline}
            </p>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl">
              {vehicle.overview}
            </p>
          </div>

          {/* VIEW TAB 1: RWA ECONOMICS & TOKENIZATION */}
          {viewTab === 'RWA' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Key Financial Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-900/70 border border-neutral-800 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" /> ONCHAIN TOKEN
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {vehicle.rwaEconomics.robinhoodChainToken.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Robinhood Chain Native</div>
                </div>

                <div className="bg-neutral-900/70 border border-neutral-800 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                    <Landmark className="w-3.5 h-3.5 text-neutral-400" /> REVENUE / LAUNCH
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {vehicle.rwaEconomics.commercialValuePerLaunch}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Commercial Contract Value</div>
                </div>

                <div className="bg-neutral-900/70 border border-neutral-800 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                    <FileText className="w-3.5 h-3.5 text-neutral-400" /> INSTRUMENT TYPE
                  </div>
                  <div className="text-xs font-bold text-white mt-1 leading-snug">
                    {vehicle.rwaEconomics.instrumentType}
                  </div>
                </div>

                <div className="bg-neutral-900/70 border border-neutral-800 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" /> LEGAL STRUCTURE
                  </div>
                  <div className="text-xs font-bold text-white mt-1 leading-snug">
                    {vehicle.rwaEconomics.spvJurisdiction}
                  </div>
                </div>
              </div>

              {/* Economic Rights Breakdown Card */}
              <div className="border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> ECONOMIC RIGHTS & WARRANT PROFILE
                  </h4>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 font-mono font-semibold">
                    100% ASSET-BACKED
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {vehicle.rwaEconomics.economicRightsSummary}
                </p>

                <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400">
                  <div>
                    <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">Custodian & Verification</span>
                    <strong className="text-neutral-200 mt-0.5 block">{vehicle.rwaEconomics.custodianVerification}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">Liquidity & Secondary Trading</span>
                    <strong className="text-neutral-200 mt-0.5 block">24/7 onchain settlement on Robinhood Chain with zero gas fee rebates</strong>
                  </div>
                </div>
              </div>

              {/* How Space RWA Acquisition Works */}
              <div className="bg-black/60 border border-neutral-800 p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300">
                  HOW THE SPV ACQUIRES PRIVATE SPACE STAKES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="p-3 bg-neutral-900/40 border border-neutral-800/80">
                    <span className="text-emerald-400 font-mono text-xs font-bold">STEP 01</span>
                    <div className="text-xs font-bold text-white mt-1">Institutional Equity Acquisition</div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Our institutional fund partners purchase direct shares, warrants, or secondary equity in private reusable rocketry leaders through regulated tender offers and private placement agreements.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900/40 border border-neutral-800/80">
                    <span className="text-emerald-400 font-mono text-xs font-bold">STEP 02</span>
                    <div className="text-xs font-bold text-white mt-1">Delaware SPV Wrapping</div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Shares and warrant rights are deposited into a dedicated, bankruptcy-remote Delaware Series SPV with qualified custodian verification and regular third-party audits.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900/40 border border-neutral-800/80">
                    <span className="text-emerald-400 font-mono text-xs font-bold">STEP 03</span>
                    <div className="text-xs font-bold text-white mt-1">Liquid Robinhood Chain Mint</div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Onchain tokens representing verifiable pro-rata economic rights are issued on Robinhood Chain, enabling fractional ownership and instant 24/7 liquidity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 2: TECHNICAL VEHICLE SPECIFICATIONS */}
          {viewTab === 'TECH' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Key Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-neutral-900/60 border border-neutral-800 p-4">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold block">
                    HEIGHT
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {isMetric ? `${vehicle.heightMetric} m` : `${vehicle.heightImperial} ft`}
                  </div>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 p-4">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold block">
                    DIAMETER
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {isMetric ? `${vehicle.diameterMetric} m` : `${vehicle.diameterImperial} ft`}
                  </div>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 p-4">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold block">
                    PAYLOAD TO LEO
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {isMetric
                      ? `${vehicle.payloadLeoMetric} t`
                      : `${vehicle.payloadLeoImperial.toLocaleString()} lb`}
                  </div>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 p-4">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold block">
                    STAGES
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {vehicle.stages}
                  </div>
                </div>
              </div>

              {/* Engine Propulsion Details */}
              <div className="bg-neutral-900/40 border border-neutral-800 p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-neutral-400" /> PROPULSION SYSTEM & ENGINES
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="border border-neutral-800/80 p-4 bg-black/40">
                    <div className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">
                      STAGE 1 BOOSTER
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {vehicle.engines.firstStage.type}
                    </div>
                    <div className="mt-3 text-xs text-neutral-300 font-mono">
                      Engine Count: <strong className="text-white">{vehicle.engines.firstStage.count}</strong>
                    </div>
                    <div className="text-xs text-neutral-300 font-mono">
                      Liftoff Thrust:{' '}
                      <strong className="text-white">
                        {isMetric
                          ? `${vehicle.engines.firstStage.thrustSeaLevelMetric.toLocaleString()} kN`
                          : `${vehicle.engines.firstStage.thrustSeaLevelImperial.toLocaleString()} lbf`}
                      </strong>
                    </div>
                  </div>

                  <div className="border border-neutral-800/80 p-4 bg-black/40">
                    <div className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">
                      STAGE 2 UPPER STAGE
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {vehicle.engines.secondStage.type}
                    </div>
                    <div className="mt-3 text-xs text-neutral-300 font-mono">
                      Engine Count: <strong className="text-white">{vehicle.engines.secondStage.count}</strong>
                    </div>
                    <div className="text-xs text-neutral-300 font-mono">
                      Vacuum Thrust:{' '}
                      <strong className="text-white">
                        {isMetric
                          ? `${vehicle.engines.secondStage.thrustVacuumMetric.toLocaleString()} kN`
                          : `${vehicle.engines.secondStage.thrustVacuumImperial.toLocaleString()} lbf`}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Innovations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-400" /> KEY ENGINEERING HIGHLIGHTS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vehicle.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 bg-neutral-900/30 border border-neutral-800 text-xs text-neutral-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/40 flex flex-col sm:flex-row items-center justify-between text-neutral-400 text-xs gap-3">
          <span className="font-mono">
            TOTAL FLIGHTS: <strong className="text-white">{vehicle.totalLaunches}</strong> | SUCCESSFUL LANDINGS:{' '}
            <strong className="text-white">{vehicle.totalLandings}</strong> | TOKEN: <strong className="text-emerald-400">{vehicle.rwaEconomics.robinhoodChainToken.split(' ')[0]}</strong>
          </span>
          <div className="flex items-center gap-3">
            {onOpenProtocol && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProtocol();
                }}
                className="px-4 py-1.5 border border-white/40 hover:border-white text-white font-semibold uppercase text-xs tracking-wider transition-colors cursor-pointer"
              >
                PROTOCOL DETAILS
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-1.5 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-neutral-200 cursor-pointer"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
