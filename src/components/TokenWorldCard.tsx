import React from "react";
import { ExternalLink } from "lucide-react";
import type { Token } from "./useLiveTokens";

const formatUsd = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPrice = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return `$${value.toLocaleString("en-US", { maximumSignificantDigits: 5 })}`;
};

const formatPercent = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

export const TokenWorldCard: React.FC<{
  token: Token;
  onClick: () => void;
  actionLabel?: string;
}> = ({ token, onClick, actionLabel = "View market" }) => {
  const hasChange = token.priceChange24h !== undefined;
  const positiveChange = (token.priceChange24h ?? 0) >= 0;

  return (
    <article className="group relative isolate overflow-hidden border border-white/10 bg-[#080b13] transition-all duration-500 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_38%,rgba(38,120,78,0.13),transparent_56%),linear-gradient(180deg,#0b100d_0%,#080b09_62%,#060806_100%)]" />

      <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
        <div className="min-w-0">
          <span className="block truncate text-lg font-bold tracking-wide text-white">
            ${token.symbol}
          </span>
          <span className="mt-0.5 block truncate text-[10px] tracking-wide text-neutral-400">
            {token.name}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1.5 border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Live
          </span>
          {hasChange && (
            <span className={`text-[10px] font-semibold ${positiveChange ? "text-emerald-300" : "text-rose-300"}`}>
              {formatPercent(token.priceChange24h)} <span className="text-neutral-500">24H</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative flex h-[190px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(1px_1px_at_14%_27%,rgba(255,255,255,0.55)_50%,transparent),radial-gradient(1px_1px_at_82%_23%,rgba(184,201,255,0.65)_50%,transparent),radial-gradient(1px_1px_at_72%_78%,rgba(255,255,255,0.45)_50%,transparent),radial-gradient(1px_1px_at_28%_82%,rgba(255,255,255,0.4)_50%,transparent)]" />
        <div className="absolute h-36 w-64 rotate-[-16deg] rounded-[50%] border border-white/[0.13] transition-transform duration-700 group-hover:rotate-[-10deg] group-hover:scale-105" />
        <div className="absolute h-28 w-52 rotate-[24deg] rounded-[50%] border border-white/[0.07]" />
        <div className="absolute h-32 w-32 rounded-full bg-emerald-400/[0.1] blur-2xl transition-all duration-500 group-hover:bg-emerald-300/[0.2]" />

        <button
          type="button"
          onClick={onClick}
          aria-label={`View ${token.name} ${actionLabel.toLowerCase()}`}
          className="relative z-10 grid h-[104px] w-[104px] place-items-center overflow-hidden rounded-full border border-white/25 bg-[#111a14] text-2xl font-bold text-white shadow-[inset_-12px_-12px_24px_rgba(0,0,0,0.7),0_0_38px_rgba(74,222,128,0.16)] transition duration-500 group-hover:scale-105 group-hover:border-emerald-200/60"
        >
          {token.image && (
            <img
              src={token.image}
              alt={`${token.name} token`}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
          <span className="relative z-10 drop-shadow-md">{token.symbol.slice(0, 1)}</span>
          <span className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/50" />
        </button>

        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[8px] uppercase tracking-[0.16em] text-neutral-500">
          <span>{token.networkLabel ?? "ROBINHOOD CHAIN"}</span>
          <span className="font-mono">{token.address.slice(0, 6)}…{token.address.slice(-4)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-white/[0.07]">
        <Metric
          label="Market Cap"
          value={formatUsd(token.marketCap)}
        />
        <Metric
          label="Price"
          value={formatPrice(token.priceUsd)}
          align="right"
        />
        <Metric label="24H Volume" value={formatUsd(token.volume24h)} />
        <Metric
          label="Liquidity"
          value={formatUsd(token.liquidity)}
          align="right"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-3.5">
        <span className="text-[9px] text-neutral-500">Holders unavailable</span>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-neutral-300 transition-colors hover:text-white"
        >
          {actionLabel} <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
};

const Metric: React.FC<{
  label: string;
  value: string;
  align?: "left" | "right";
}> = ({ label, value, align = "left" }) => (
  <div className={`border-b border-white/[0.05] px-5 py-3 ${align === "right" ? "text-right" : ""}`}>
    <span className="block text-[8px] font-medium uppercase tracking-[0.18em] text-neutral-500">
      {label}
    </span>
    <span className="mt-1 block text-sm font-semibold tracking-wide text-neutral-100">
      {value}
    </span>
  </div>
);
