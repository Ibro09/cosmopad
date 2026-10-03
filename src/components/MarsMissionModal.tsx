import React, { useEffect } from 'react';
import { X, Compass, Flame, RefreshCw, Landmark, ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import marsHeroImg from '../assets/images/spacex_mars_hero_1789201662230.jpg';

interface MarsMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStarship: () => void;
}

export const MarsMissionModal: React.FC<MarsMissionModalProps> = ({
  isOpen,
  onClose,
  onOpenStarship,
}) => {
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

  return (
    <div
      id="mars-mission-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
    >
      <div
        id="mars-mission-dialog"
        className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
              Space RWA • Interplanetary Asset Horizon
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Hero Banner */}
          <div className="relative h-64 sm:h-80 overflow-hidden border border-neutral-800">
            <img
              src={marsHeroImg}
              alt="Mars horizon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-orange-400">
                DEEP SPACE MACRO HORIZON
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mt-1">
                Interplanetary Logistics Economy
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
                Interplanetary exploration represents the ultimate economic frontier for tokenized space assets. Through long-dated warrants and private equity stakes, Space RWA token holders capture asymmetric upside from lunar cargo contracts, orbital propellant stations, and deep space transport infrastructure.
              </p>
            </div>
          </div>

          {/* Architecture Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="p-2.5 bg-neutral-800/80 w-fit text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                1. Orbital Depots & Fuel
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                In-space cryogenic propellant transfer creates recurring commercial billing events for orbital logistics providers, creating sticky high-margin infrastructure cashflows.
              </p>
            </div>

            <div className="p-4 bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="p-2.5 bg-neutral-800/80 w-fit text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                2. Artemis Lunar Landers
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Securitized economic rights in multi-billion dollar NASA Human Landing System (HLS) contract milestones and lunar surface infrastructure delivery.
              </p>
            </div>

            <div className="p-4 bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="p-2.5 bg-neutral-800/80 w-fit text-emerald-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                3. Full Reusability
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                100% reusable launch architecture slashes cost per kilogram to orbit by 95%, expanding total addressable space market capitalization exponentially.
              </p>
            </div>

            <div className="p-4 bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="p-2.5 bg-neutral-800/80 w-fit text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                4. Robinhood Chain Liquidity
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Tradable onchain exposure to multi-decade interplanetary expansion, allowing investors to enter or exit positions with 24/7 liquidity rather than decade lockups.
              </p>
            </div>
          </div>

          {/* Key Mission Metrics */}
          <div className="border border-neutral-800 bg-neutral-900/30 p-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 mb-4">
              Long-Term Economic & Asset Projections
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border border-neutral-800/80 p-3 bg-black/40">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                  ESTIMATED SPACE TAM
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">$1.8 TRILLION</div>
                <div className="text-[10px] text-neutral-400 mt-1">Projected by 2035</div>
              </div>

              <div className="border border-neutral-800/80 p-3 bg-black/40">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                  LAUNCH COST GOAL
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">&lt; $100 / KG</div>
                <div className="text-[10px] text-neutral-400 mt-1">Fully Reusable Starship</div>
              </div>

              <div className="border border-neutral-800/80 p-3 bg-black/40">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                  TOKEN WRAPPER
                </div>
                <div className="text-xl font-bold font-mono text-white mt-1">sSHIP</div>
                <div className="text-[10px] text-neutral-400 mt-1">Robinhood Chain Native</div>
              </div>

              <div className="border border-neutral-800/80 p-3 bg-black/40">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                  ASSET BACKING
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">1:1 VERIFIED</div>
                <div className="text-[10px] text-neutral-400 mt-1">Delaware Series SPV</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/40 flex items-center justify-between text-neutral-400 text-xs">
          <span>Starship is the anchor heavy-lift asset of the Space RWA protocol.</span>
          <button
            onClick={() => {
              onClose();
              onOpenStarship();
            }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-neutral-200 cursor-pointer"
          >
            <span>VIEW STARSHIP ASSET SPECS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
