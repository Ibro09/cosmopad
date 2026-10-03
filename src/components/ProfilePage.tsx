import React, { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Wallet } from "lucide-react";
import { TokenWorldCard } from "./TokenWorldCard";
import type { StoredLaunch } from "./launchTypes";

interface ProfilePageProps {
  address: string;
  chainId: string | null;
  onExplore: () => void;
  onLaunch: () => void;
  onViewToken: (address: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  address,
  chainId,
  onExplore,
  onLaunch,
  onViewToken,
}) => {
  const [copied, setCopied] = useState(false);
  const [launches, setLaunches] = useState<StoredLaunch[]>([]);
  const [launchesLoading, setLaunchesLoading] = useState(true);
  const [launchesError, setLaunchesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadLaunches = async () => {
      try {
        const response = await fetch(
          `/api/user-launches?owner=${encodeURIComponent(address)}`,
          { signal: controller.signal, headers: { Accept: "application/json" } },
        );
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "Could not load your launches.");
        }
        const data = (await response.json()) as StoredLaunch[];
        if (!Array.isArray(data)) {
          throw new Error("The saved launch list is invalid.");
        }
        setLaunches(data);
        setLaunchesError(null);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setLaunchesError(
          cause instanceof Error ? cause.message : "Could not load your launches.",
        );
      } finally {
        if (!controller.signal.aborted) setLaunchesLoading(false);
      }
    };
    void loadLaunches();
    return () => controller.abort();
  }, [address]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-6 pb-20 pt-28 text-white sm:px-10 md:px-16 lg:px-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[12%] h-[420px] w-[420px] rounded-full bg-emerald-600/[0.05] blur-[140px]" />
        <div className="absolute right-[10%] top-[42%] h-[460px] w-[460px] rounded-full bg-green-700/[0.035] blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1040px]">
        <div className="border-b border-white/10 pb-6">
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300/75">
            YOUR SPACE STATION
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Profile
          </h1>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-neutral-500">
            Your connected wallet is your home base in the CosmoPad universe.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="border border-white/10 bg-[#080b09] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center border border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-neutral-500">
                  Connected wallet
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-200">
                  Wallet connected
                </p>
              </div>
            </div>

            <div className="mt-7 border border-white/[0.08] bg-black/40 p-4">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-neutral-500">
                Wallet address
              </span>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="break-all text-xs text-neutral-100 sm:text-sm">
                  {address}
                </code>
                <button
                  type="button"
                  onClick={() => void copyAddress()}
                  aria-label={copied ? "Wallet address copied" : "Copy wallet address"}
                  className="grid h-9 w-9 shrink-0 place-items-center border border-white/10 text-neutral-400 transition-colors hover:border-emerald-300/40 hover:text-emerald-200"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-b border-white/[0.07] py-3 text-xs">
              <span className="text-neutral-500">Network</span>
              <span className="font-mono text-neutral-200">
                {chainId?.toLowerCase() === "0x1237"
                  ? "Robinhood Chain"
                  : chainId
                    ? chainId.toUpperCase()
                    : "Unavailable"}
              </span>
            </div>
          </article>

          <article className="flex flex-col justify-between border border-white/10 bg-[#080b09] p-5 sm:p-7">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Explore your universe
              </span>
              <h2 className="mt-3 text-xl font-semibold text-white">
                Your next world starts here.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Browse live PonsFamily launches or head to the launchpad to
                start a token world.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onExplore}
                className="border border-white/15 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-200 transition-colors hover:border-white/35 hover:text-white"
              >
                Explore worlds
              </button>
              <button
                type="button"
                onClick={onLaunch}
                className="inline-flex items-center gap-2 border border-emerald-300/50 bg-emerald-300 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-emerald-200"
              >
                Launch a world <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </article>
        </div>

        <div className="mt-12">
          <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300/75">
                YOUR WORLDS
              </span>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Launched tokens
              </h2>
            </div>
            <span className="text-[9px] uppercase tracking-[0.14em] text-neutral-500">
              {launches.length} saved
            </span>
          </div>
          {launchesError && (
            <p role="alert" className="mt-5 border border-amber-300/20 bg-amber-300/[0.04] p-4 text-xs text-amber-100">
              {launchesError}
            </p>
          )}
          {launchesLoading ? (
            <p className="py-16 text-center text-xs text-neutral-500">
              Loading your launched worlds…
            </p>
          ) : launches.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3">
              {launches.map((launch) => (
                <div key={launch.token}>
                  <TokenWorldCard
                    token={{
                      address: launch.token,
                      name: launch.name,
                      symbol: launch.symbol,
                      image: launch.logo || undefined,
                      networkLabel: "PONS FAMILY",
                      url: `https://dexscreener.com/robinhood/${launch.token}`,
                    }}
                    actionLabel="Token details"
                    onClick={() => onViewToken(launch.token)}
                  />
                  <p className="mt-2 text-right text-[9px] text-neutral-600">
                    Launched {new Date(launch.launchedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-b border-white/[0.07] py-16 text-center">
              <p className="text-sm text-neutral-300">No tokens launched yet.</p>
              <p className="mt-2 text-xs text-neutral-600">
                Worlds you launch through CosmoPad appear here.
              </p>
              <button
                type="button"
                onClick={onLaunch}
                className="mt-5 border border-emerald-300/45 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-200 transition-colors hover:bg-emerald-300 hover:text-black"
              >
                Launch a world
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
