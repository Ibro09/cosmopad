import React, { useMemo, useState } from "react";
import { ArrowRight, RefreshCw, Search } from "lucide-react";
import { TokenWorldCard } from "./TokenWorldCard";
import { useLiveTokens } from "./useLiveTokens";
import type { Token } from "./useLiveTokens";

interface ExploreCosmosProps {
  onTokenClick?: (token: Token) => void;
  onExplore?: () => void;
  onLaunch?: () => void;
}

export const ExploreCosmos: React.FC<ExploreCosmosProps> = ({
  onTokenClick,
  onExplore,
  onLaunch,
}) => {
  const [search, setSearch] = useState("");
  const {
    tokens,
    loading,
    refreshing,
    error,
    missingCount,
    lastUpdated,
    trackedCount,
  } = useLiveTokens();

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tokens;
    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query),
    );
  }, [search, tokens]);

  return (
    <section
      id="explore-cosmos"
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[15%] top-[15%] h-[500px] w-[500px] rounded-full bg-emerald-600/[0.045] blur-[140px]" />
        <div className="absolute right-[5%] top-[35%] h-[600px] w-[600px] rounded-full bg-green-700/[0.04] blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-6 pt-24 sm:px-10 md:flex-row md:items-end md:justify-between lg:px-12">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            The Living Universe
          </span>
          <h2 className="mt-3 text-4xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Explore
            <br />
            The Cosmos
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            Live token worlds on Robinhood Chain. Discover new planets, watch them evolve, and explore the communities that orbit them.
          </p>
        </div>

        <label className="flex w-full items-center border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md transition-colors focus-within:border-white/30 md:w-auto">
          <Search className="mr-3 h-4 w-4 text-neutral-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="SEARCH WORLD"
            aria-label="Search tokens by name, symbol, or contract address"
            className="w-full bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] text-white outline-none placeholder:text-neutral-600 md:w-48"
          />
        </label>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-6 pt-7 text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:px-10 lg:px-12">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          Robinhood Chain · {trackedCount} tracked worlds
        </span>
        <span className="flex items-center gap-2 normal-case tracking-normal">
          {lastUpdated && (
            <span>Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
          )}
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`}
            aria-label={refreshing ? "Updating token data" : "Refreshes every 30 seconds"}
          />
        </span>
      </div>

      {missingCount > 0 && (
        <p className="relative z-10 mx-auto mt-4 w-full max-w-[1440px] px-6 text-xs text-neutral-400 sm:px-10 lg:px-12">
          Market data is not available yet for {missingCount} tracked token
          {missingCount === 1 ? "" : "s"}.
        </p>
      )}

      {error && (
        <div
          role="status"
          className="relative z-10 mx-auto mt-5 w-full max-w-[1440px] px-6 sm:px-10 lg:px-12"
        >
          <span className="block border border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-100/80">
            {tokens.length > 0
              ? `Could not refresh token data. Showing the last successful update. ${error}`
              : `Live token data is temporarily unavailable. ${error}`}
          </span>
        </div>
      )}

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-6 py-10 sm:px-10 md:grid-cols-2 lg:grid-cols-3 lg:px-12">
        {loading && tokens.length === 0 && (
          <p className="col-span-full py-20 text-center text-sm text-neutral-400">
            Finding live worlds on Robinhood Chain…
          </p>
        )}
        {!loading && !error && filteredTokens.length === 0 && (
          <p className="col-span-full py-20 text-center text-sm text-neutral-400">
            No live worlds match “{search}”.
          </p>
        )}
        {filteredTokens.map((token) => (
          <TokenWorldCard
            key={token.address}
            token={token}
            onClick={() => onTokenClick?.(token)}
          />
        ))}
      </div>

      <p className="relative z-10 mx-auto w-full max-w-[1440px] px-6 text-center text-[10px] leading-relaxed text-neutral-600 sm:px-10 lg:px-12">
        Market data refreshes every 30 seconds via DexScreener. Holder counts
        aren’t provided by this data source.
      </p>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] justify-center px-6 pb-24 pt-8 sm:px-10 lg:px-12">
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onExplore}
            className="group inline-flex items-center gap-3 border border-white/40 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white hover:text-black"
          >
            Explore The Full Universe
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button
            onClick={onLaunch}
            className="inline-flex items-center gap-3 border border-white/15 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-white/40 hover:text-white"
          >
            Launch a World
          </button>
        </div>
      </div>
    </section>
  );
};
