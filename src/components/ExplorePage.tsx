import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { TokenWorldCard } from "./TokenWorldCard";
import { usePonsTokens, type ExploreSort } from "./usePonsTokens";

interface ExplorePageProps {
  onLaunch: () => void;
  onTokenClick: (address: string) => void;
}

const filters: { label: string; id: ExploreSort }[] = [
  { label: "All", id: "all" },
  { label: "Newly launched", id: "newest" },
  { label: "Market cap", id: "marketCap" },
  { label: "Volume", id: "volume" },
];

const PAGE_SIZE = 30;
const MAX_RESULTS = 100;

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onLaunch,
  onTokenClick,
}) => {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ExploreSort>("all");
  const [page, setPage] = useState(1);
  const {
    tokens,
    loading,
    refreshing,
    error,
    marketDataError,
    savedLaunchesError,
    lastUpdated,
    total,
  } = usePonsTokens(selectedFilter, page);

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tokens;
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query),
    );
  }, [search, tokens]);
  const pageCount = Math.min(
    Math.ceil(MAX_RESULTS / PAGE_SIZE),
    Math.max(1, Math.ceil(total / PAGE_SIZE)),
  );
  const firstResult = (page - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(page * PAGE_SIZE, MAX_RESULTS, total);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-6 pb-20 pt-24 text-white sm:px-10 md:px-16 lg:px-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[14%] top-[15%] h-[480px] w-[480px] rounded-full bg-emerald-600/[0.045] blur-[140px]" />
        <div className="absolute right-[4%] top-[36%] h-[560px] w-[560px] rounded-full bg-green-700/[0.04] blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px]">
        <div className="flex min-h-12 items-center justify-end gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <RefreshCw
              className={`hidden h-3.5 w-3.5 text-neutral-600 sm:block ${refreshing ? "animate-spin text-emerald-400" : ""}`}
              aria-label={refreshing ? "Updating token data" : "Refreshes every 30 seconds"}
            />
            <label className="flex w-[min(52vw,270px)] items-center gap-2 border border-white/10 bg-white/[0.025] px-3 py-2.5 transition-colors focus-within:border-emerald-300/40">
              <Search className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="SEARCH WORLDS"
                aria-label="Search tokens by name, symbol, or contract address"
                className="min-w-0 flex-1 bg-transparent text-[9px] font-semibold uppercase tracking-[0.16em] text-white outline-none placeholder:text-neutral-600"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-white/[0.08] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter tokens">
            {filters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => {
                  setSelectedFilter(filter.id);
                  setPage(1);
                }}
                aria-pressed={selectedFilter === filter.id}
                className={`border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  selectedFilter === filter.id
                    ? "border-emerald-300/50 bg-emerald-300/[0.08] text-emerald-200"
                    : "border-white/10 text-neutral-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          Fees and launch terms are shown by the provider.

        </div>

        {error && (
          <div
            role="status"
            className="mt-5 border border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-100/80"
          >
            {tokens.length > 0
              ? `Could not refresh token data. Showing the last successful update. ${error}`
              : `PonsFamily launch data is temporarily unavailable. ${error}`}
          </div>
        )}
        {marketDataError && (
          <p role="status" className="mt-4 text-xs text-neutral-500">
            Some market metrics could not be refreshed. {marketDataError}
          </p>
        )}
        {savedLaunchesError && (
          <p role="status" className="mt-4 text-xs text-amber-200/80">
            CosmoPad-launched tokens could not be loaded. {savedLaunchesError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading && tokens.length === 0 && (
            <p className="col-span-full py-24 text-center text-sm text-neutral-400">
              Finding live worlds in the PonsFamily launch feed…
            </p>
          )}
          {!loading && filteredTokens.length === 0 && (
            <p className="col-span-full py-24 text-center text-sm text-neutral-400">
              {search
                ? `No live worlds match “${search}”.`
                : "No launched worlds are available right now."}
            </p>
          )}
          {filteredTokens.map((token) => (
            <TokenWorldCard
              key={token.address}
              token={token}
              actionLabel="Token details"
              onClick={() => onTokenClick(token.address)}
            />
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/[0.08] pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Previous token page"
              className="grid h-9 w-9 place-items-center border border-white/10 text-neutral-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-28 text-center text-[9px] uppercase tracking-[0.14em] text-neutral-500">
              {total > 0
                ? `${firstResult}–${lastResult} of ${Math.min(total, MAX_RESULTS)}`
                : "No worlds"}
              <span className="px-1.5 text-neutral-700">·</span>
              Page {page} / {pageCount}
            </span>
            <button
              type="button"
              disabled={page >= pageCount || loading}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              aria-label="Next token page"
              className="grid h-9 w-9 place-items-center border border-white/10 text-neutral-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onLaunch}
              className="border border-emerald-300/50 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200 transition-colors hover:bg-emerald-300 hover:text-black"
            >
              Launch a world
            </button>
          </div>
        </div>
        <p className="mt-5 text-center text-[9px] leading-relaxed text-neutral-600 sm:text-left">
          Live launch data refreshes every 30 seconds. Each page requests up to{" "}
          {PAGE_SIZE} worlds from PonsFamily.
          {lastUpdated
            ? ` Updated ${new Date(lastUpdated).toLocaleTimeString()}.`
            : ""}
        </p>
      </div>
    </section>
  );
};
