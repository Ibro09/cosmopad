import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Coins, Landmark, MapPin, ChevronRight, CheckCircle2, Building2, Lock, ArrowUpRight } from 'lucide-react';

export type CompanySubPage = 'mission' | 'robinhood' | 'starbase' | 'timeline';

interface CompanyPageProps {
  isOpen: boolean;
  initialPage?: CompanySubPage;
  onClose: () => void;
}

export const CompanyPage: React.FC<CompanyPageProps> = ({
  isOpen,
  initialPage = 'mission',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CompanySubPage>(initialPage);

  useEffect(() => {
    if (initialPage) {
      setActiveTab(initialPage);
    }
  }, [initialPage]);

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
      id="company-page-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6 md:p-10 animate-in fade-in duration-200"
    >
      <div
        id="company-page-dialog"
        className="relative w-full max-w-6xl bg-neutral-950 border border-neutral-800 shadow-2xl max-h-[94vh] flex flex-col overflow-hidden text-white"
      >
        {/* Navigation Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 bg-neutral-900/70 px-6 py-4 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-emerald-400 mr-2 shrink-0">
              ORBIX RWA:
            </span>
            {(
              [
                { id: 'mission', label: 'RWA ARCHITECTURE' },
                { id: 'robinhood', label: 'ROBINHOOD CHAIN' },
                { id: 'starbase', label: 'CUSTODY & RESERVES' },
                { id: 'timeline', label: 'ASSET PIPELINE' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            id="close-company-page-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer self-end sm:self-center"
            aria-label="Close Company View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10">
          {/* TAB 1: MISSION & RWA ARCHITECTURE */}
          {activeTab === 'mission' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-emerald-400">
                  REAL WORLD ASSET PROTOCOL
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mt-1">
                  Liquid Space Economy
                </h2>
                <p className="mt-4 text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-3xl">
                  Our project acquires verifiable stakes, warrants, and economic rights in leading private space enterprises and reusable rocket infrastructure, wrapping them into liquid, institutional-grade onchain products native to Robinhood Chain.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-3">
                  <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    01 • Verifiable Acquisition
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase">Stakes & Warrants</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    We secure direct equity allocations, secondary tender shares, and growth warrants in premier private aerospace operators specializing in reusable rocketry and orbital transportation.
                  </p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-3">
                  <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    02 • Legal SPV Wrapper
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase">Bankruptcy-Remote Custody</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Underlying aerospace shares are held in bankruptcy-remote Delaware Series Special Purpose Vehicles (SPVs), managed by SEC-qualified custodians with quarterly independent audits.
                  </p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-3">
                  <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    03 • Liquid Onchain Product
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase">Robinhood Chain Native</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    By minting permissioned RWA tokens on Robinhood Chain, we transform historically illiquid 10-year private equity into 24/7 tradeable, fractionalized liquid digital assets.
                  </p>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 mb-6">
                  Protocol Capital & Asset Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">$350M+</div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                      Private Space Assets Under SPV
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">100%</div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                      Verifiable Onchain Backing
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">400+</div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                      Supported Orbital Flights
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">24/7</div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                      Instant Secondary Settlement
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROBINHOOD CHAIN */}
          {activeTab === 'robinhood' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-emerald-400">
                  BLOCKCHAIN INFRASTRUCTURE
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mt-1">
                  Built on Robinhood Chain
                </h2>
                <p className="mt-4 text-base text-neutral-300 font-normal leading-relaxed max-w-3xl">
                  Robinhood Chain provides the high-throughput, low-latency, and compliant settlement layer required to democratize private aerospace equity for millions of global participants.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Coins className="w-5 h-5" /> Direct Retail Liquidity
                  </div>
                  <h4 className="text-base font-bold text-white uppercase">Fractional Private Equity</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Traditionally, investing in private rocket companies required accreditation, $250k+ minimums, and 7-10 year lockups. On Robinhood Chain, anyone can buy, sell, or hold fractional shares of premier space enterprises starting with as little as $10.
                  </p>
                </div>

                <div className="p-6 bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Landmark className="w-5 h-5" /> Instant Onchain Settlement
                  </div>
                  <h4 className="text-base font-bold text-white uppercase">Sub-Second Finality</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Eliminate weeks of paper-based stock transfer agent paperwork. Robinhood Chain allows peer-to-peer secondary trading with instant cryptographic settlement and automated compliance checks.
                  </p>
                </div>

                <div className="p-6 bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" /> Institutional Security
                  </div>
                  <h4 className="text-base font-bold text-white uppercase">ERC-3643 Compliant RWA Tokens</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Each tokenized asset features built-in identity verification, transfer restrictions for regulatory compliance, and automated dividend distribution logic triggered directly by orbital launch revenues.
                  </p>
                </div>

                <div className="p-6 bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Lock className="w-5 h-5" /> Zero-Gas Execution
                  </div>
                  <h4 className="text-base font-bold text-white uppercase">Frictionless Trading Rails</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Enjoy seamless trading without volatile Ethereum gas fees. Robinhood Chain subsidizes transfers to ensure true democratic access to aerospace investment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTODY & RESERVES */}
          {activeTab === 'starbase' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-emerald-400">
                  LEGAL ARCHITECTURE & AUDIT
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mt-1">
                  Custody & Proof of Reserves
                </h2>
                <p className="mt-4 text-base text-neutral-300 font-normal leading-relaxed max-w-3xl">
                  Every onchain token on Robinhood Chain is 1:1 backed by real, legally enforceable equity shares, warrants, and rights held in regulated trust.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" /> Delaware Series LLC (Bankruptcy-Remote)
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Each target space business stake (Starship, Falcon Fleet, Dragon logistics) is held in an isolated, ring-fenced Series SPV. Creditors of any one asset or manager cannot access the assets of another.
                  </p>
                </div>

                <div className="border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> SEC-Registered Transfer Agents
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Physical and electronic cap table entries are verified by registered institutional transfer agents who cross-reconcile onchain token supply with off-chain stock certificates daily.
                  </p>
                </div>

                <div className="border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" /> Real-Time Proof of Reserves Oracle
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Cryptographic attestation feeds publish automated reserve data directly to Robinhood Chain smart contracts, guaranteeing that token supply never exceeds verified shares.
                  </p>
                </div>

                <div className="border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Big-Four Accounting Audits
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Comprehensive quarterly financial and legal compliance reviews conducted by independent top-tier accounting firms, with audit reports published openly to onchain participants.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSET PIPELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-emerald-400">
                  SPACE RWA ROADMAP
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mt-1">
                  Asset Pipeline & Horizons
                </h2>
                <p className="mt-4 text-base text-neutral-300 font-normal leading-relaxed max-w-3xl">
                  From founding orbital rocketry equity to our pipeline of next-generation space infrastructure warrants.
                </p>
              </div>

              <div className="border-l-2 border-neutral-800 ml-4 space-y-8 pl-6">
                {[
                  {
                    year: 'ACTIVE • 2026',
                    title: 'Robinhood Chain RWA Token Launch (sFALCON & sSHIP)',
                    desc: 'Issuance of fully backed liquid tokens representing secondary equity and warrant tranches in OrbiX reusable launch systems on Robinhood Chain.',
                  },
                  {
                    year: 'PIPELINE • Q3 2026',
                    title: 'Dragon Orbital Logistics & ISS Cargo Cashflow Wrappers',
                    desc: 'Securitization of commercial crew and cargo operational cash flows under multi-year NASA commercial servicing agreements.',
                  },
                  {
                    year: 'PIPELINE • 2027',
                    title: 'Commercial Space Stations & In-Orbit Manufacturing Assets',
                    desc: 'Acquiring strategic stakes and warrants in private space station builders and automated microgravity bio-manufacturing ventures.',
                  },
                  {
                    year: 'FOUNDATIONAL',
                    title: 'Proof-of-Concept SPV Formation & SEC Transfer Agent Integration',
                    desc: 'Structuring bankruptcy-remote Delaware Series LLCs and partnering with institutional qualified custodians.',
                  },
                ].map((event, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 group-hover:bg-white transition-colors" />
                    <span className="text-xs font-mono font-bold text-emerald-400 block tracking-wider">
                      {event.year}
                    </span>
                    <h3 className="text-base font-bold text-white uppercase mt-0.5">{event.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                      {event.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
          <span>ORBIX RWA PROTOCOL • ROBINHOOD CHAIN NATIVE</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-neutral-200 cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
