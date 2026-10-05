import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  Unplug,
  Twitter,
  Wallet,
  X,
} from "lucide-react";

interface NavbarProps {
  onExplore: () => void;
  onLaunch: () => void;
  onHowItWorks: () => void;
  onProfile: () => void;
  onConnect: () => Promise<void>;
  onSelectAccount: (account: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  walletAddress: string | null;
  walletConnecting: boolean;
  walletError: string | null;
  walletDetected: boolean;
  pendingAccounts: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  onExplore,
  onLaunch,
  onHowItWorks,
  onProfile,
  onConnect,
  onSelectAccount,
  onDisconnect,
  walletAddress,
  walletConnecting,
  walletError,
  walletDetected,
  pendingAccounts,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  useEffect(() => {
    if (walletAddress) setWalletDialogOpen(false);
  }, [walletAddress]);

  useEffect(() => {
    setWalletDialogOpen(pendingAccounts.length > 1);
  }, [pendingAccounts]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        id="orbix-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-md border-b border-white/10 py-3.5 shadow-2xl"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[1720px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8 lg:gap-12">
            <a
              href="/"
              id="orbix-logo-link"
              className="flex items-center transition-transform hover:opacity-90 active:scale-95"
              aria-label="CosmoPad home"
            >
              <span className="text-sm font-extrabold tracking-[0.2em] text-white sm:text-base">
                COSMOPAD
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <nav
              id="desktop-nav"
              className="hidden lg:flex items-center gap-7 xl:gap-8 text-[13px] tracking-[0.14em] font-semibold text-white/90 ml-20"
            >
              <button
                onClick={onExplore}
                className="hover:text-white transition-colors py-1 border-b-2 border-transparent hover:border-white cursor-pointer"
              >
                EXPLORE
              </button>

              <button
                onClick={onLaunch}
                className="hover:text-white transition-colors py-1 border-b-2 border-transparent hover:border-white cursor-pointer"
              >
                LAUNCH
              </button>
              <button
                onClick={onHowItWorks}
                className="hover:text-white transition-colors py-1 border-b-2 border-transparent hover:border-white cursor-pointer"
              >
                HOW IT WORKS
              </button>
              {walletAddress && (
                <button
                  type="button"
                  id="desktop-nav-profile"
                  onClick={onProfile}
                  className="hover:text-emerald-200 transition-colors py-1 border-b-2 border-transparent hover:border-emerald-300 cursor-pointer"
                >
                  PROFILE
                </button>
              )}
            </nav>
          </div>

          {/* Right Area: LAUNCH MANIFEST & REVENUE PIPELINE */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (walletAddress) onProfile();
                else if (walletDetected) void onConnect();
                else setWalletDialogOpen(true);
              }}
              disabled={walletConnecting}
              className="inline-flex min-h-9 items-center gap-2 border border-white/15 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-100 transition-colors hover:border-emerald-300/45 hover:text-emerald-200 disabled:cursor-wait disabled:opacity-60 sm:min-h-10 sm:px-3.5"
              title={walletAddress ? "Open your profile" : "Connect a wallet"}
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-300" />
              <span>
                {walletConnecting
                  ? "Connecting"
                  : walletAddress
                    ? "Connected"
                    : "Connect wallet"}
              </span>
            </button>
            {walletAddress && (
              <button
                type="button"
                onClick={() => void onDisconnect()}
                aria-label="Disconnect wallet"
                title="Disconnect wallet"
                className="grid h-9 w-9 shrink-0 place-items-center border border-white/10 text-neutral-400 transition-colors hover:border-rose-300/35 hover:text-rose-200 sm:h-10 sm:w-10"
              >
                <Unplug className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              id="upcoming-launches-btn"
              onClick={onLaunch}
              className="group relative hidden sm:flex items-center gap-2 border border-emerald-300/70 px-3.5 md:px-4 py-1.5 md:py-2 text-[11px] md:text-xs font-semibold tracking-[0.14em] uppercase text-emerald-200 bg-emerald-300/[0.06] hover:bg-emerald-300 hover:text-black transition-all duration-300 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-black animate-pulse" />
              <span>LAUNCH A TOKEN</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-neutral-300 focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {walletError && (
        <p
          role="alert"
          className="fixed right-4 top-20 z-[60] max-w-sm border border-amber-300/20 bg-black/95 px-4 py-3 text-xs text-amber-100 shadow-xl sm:right-8"
        >
          {walletError}
        </p>
      )}

      {walletDialogOpen && !walletAddress && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setWalletDialogOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-dialog-title"
            className="w-full max-w-md border border-white/10 bg-[#080b09] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.7)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300/75">
                  COSMOPAD
                </span>
                <h2
                  id="wallet-dialog-title"
                  className="mt-2 text-xl font-semibold text-white"
                >
                  {pendingAccounts.length > 1
                    ? "Choose an account"
                    : "Connect a wallet"}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  {pendingAccounts.length > 1
                    ? "Select the account you want to use with CosmoPad."
                    : "Your wallet will ask you to approve the connection and switch to Robinhood Chain."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWalletDialogOpen(false)}
                aria-label="Close wallet dialog"
                className="grid h-8 w-8 shrink-0 place-items-center border border-white/10 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-2">
              {pendingAccounts.map((account, index) => (
                <button
                  key={account}
                  type="button"
                  disabled={walletConnecting}
                  onClick={() => void onSelectAccount(account)}
                  className="flex min-h-14 items-center gap-3 border border-white/10 bg-white/[0.025] px-4 text-left transition-colors hover:border-emerald-300/40 hover:bg-emerald-300/[0.04] disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="grid h-8 w-8 place-items-center border border-emerald-300/15 bg-emerald-300/[0.05] text-[10px] text-emerald-200">
                    {index + 1}
                  </span>
                  <span className="flex-1 font-mono text-xs text-neutral-100">
                    {account.slice(0, 8)}…{account.slice(-6)}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.13em] text-neutral-500">
                    {walletConnecting ? "Connecting…" : "Select"}
                  </span>
                </button>
              ))}
              {pendingAccounts.length === 0 && !walletDetected && (
                <div className="border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs text-neutral-200">
                    No browser wallets detected.
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                    Install a compatible EVM wallet, then reopen this dialog.
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-200 hover:text-emerald-100"
                  >
                    Get MetaMask
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              )}
              {pendingAccounts.length === 0 && walletDetected && (
                <div className="border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs text-neutral-200">
                    Wallet connection was not completed.
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                    Close this dialog and try connecting again.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setWalletDialogOpen(false);
                      void onConnect();
                    }}
                    className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-200 hover:text-emerald-100"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
            {walletError && (
              <p role="alert" className="mt-4 text-xs text-amber-200">
                {walletError}
              </p>
            )}
            <p className="mt-5 text-[9px] leading-relaxed text-neutral-600">
              CosmoPad only requests access to your public wallet address.
              Transactions require separate wallet approval.
            </p>
          </section>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col pt-24 px-8 pb-12 overflow-y-auto animate-in fade-in duration-200 lg:hidden"
        >
          <div className="flex flex-col space-y-5 text-sm tracking-[0.18em] font-semibold text-white/90">
            <div className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold border-b border-neutral-800 pb-2">
              COSMOPAD LAUNCHPAD
            </div>
            <button
              id="mobile-nav-explore"
              onClick={() => {
                setMobileMenuOpen(false);
                onExplore();
              }}
              className="text-left py-1 hover:text-white text-neutral-300 flex items-center justify-between cursor-pointer"
            >
              EXPLORE
            </button>
            <button
            id="mobile-nav-launch"
            onClick={() => {
              setMobileMenuOpen(false);
              onLaunch();
            }}
              className="text-left py-1 hover:text-white text-neutral-300 flex items-center justify-between cursor-pointer"
            >
              LAUNCH
            </button>
            <button
              id="mobile-nav-how-it-works"
              onClick={() => {
                setMobileMenuOpen(false);
                onHowItWorks();
              }}
              className="text-left py-1 hover:text-white text-neutral-300 flex items-center justify-between cursor-pointer"
            >
              HOW IT WORKS
            </button>

            <button
              id="mobile-nav-connect"
              onClick={() => {
                setMobileMenuOpen(false);
                if (walletAddress) onProfile();
                else if (walletDetected) void onConnect();
                else setWalletDialogOpen(true);
              }}
              disabled={walletConnecting}
              className="flex min-h-[44px] items-center gap-2 border-y border-neutral-800 py-3 text-left text-emerald-200 disabled:opacity-60"
            >
              <Wallet className="h-4 w-4" />
              {walletAddress ? "PROFILE" : "CONNECT WALLET"}
            </button>
            {walletAddress && (
              <button
                type="button"
                id="mobile-nav-profile"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onProfile();
                }}
                className="min-h-[44px] text-left text-neutral-300 hover:text-emerald-200"
              >
                PROFILE · {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </button>
            )}
            {walletAddress && (
              <button
                type="button"
                id="mobile-nav-disconnect"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void onDisconnect();
                }}
                className="flex min-h-[44px] items-center gap-2 text-left text-neutral-400 hover:text-rose-200"
              >
                <Unplug className="h-4 w-4" />
                DISCONNECT WALLET
              </button>
            )}

            <a
              id="mobile-nav-twitter"
              href="https://x.com/CosmoPadX"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center justify-between text-neutral-300 hover:text-white text-xs font-semibold tracking-wider border-t border-neutral-800/80 pt-3 mt-2"
            >
              <span className="flex items-center gap-2">
                <Twitter className="w-4 h-4 fill-current text-white" />
                <span>FOLLOW ON X / TWITTER</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                @OrbiXProtocol
                <ArrowUpRight className="w-3 h-3 text-neutral-500" />
              </span>
            </a>

            <div className="pt-4 border-t border-neutral-800 flex flex-col gap-3">
              <button
                id="mobile-nav-upcoming"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunch();
                }}
                className="w-full border border-white py-3 text-center text-xs tracking-widest uppercase font-bold text-black bg-white cursor-pointer"
              >
                LAUNCH A TOKEN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
