import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Radio,
  Wallet,
} from "lucide-react";
import {
  formatUnits,
  parseUnits,
  type Address,
} from "viem";
import type {
  PonsTokenDetails,
  PonsTokenLiveState,
} from "./launchTypes";
import {
  loadPonsTokenDetails,
  loadPonsTokenLiveState,
  loadPonsTradeInfo,
  type PonsTradeInfo,
  type PonsTradeSide,
  type PonsTradeResult,
} from "../services/ponsLaunch";

interface TokenDetailsPageProps {
  address: Address;
  onBack: () => void;
  onProfile?: () => void;
  walletAddress: Address | null;
  walletError: string | null;
  onConnect: () => Promise<void>;
  onTrade: (
    curve: Address,
    token: Address,
    side: PonsTradeSide,
    amountIn: bigint,
  ) => Promise<PonsTradeResult>;
}

interface TokenMarketData {
  priceUsd?: number;
  priceNative?: number;
  marketCapUsd?: number;
  liquidityUsd?: number;
  volume24hUsd?: number;
  quoteSymbol?: string;
}

interface EthUsdResponse {
  priceUsd?: number;
}

const shortAddress = (address: string) =>
  `${address.slice(0, 8)}…${address.slice(-6)}`;

const formatTokenAmount = (amount: bigint, decimals: number) => {
  const formatted = formatUnits(amount, decimals);
  const [integer, fraction] = formatted.split(".");
  const trimmed = fraction?.slice(0, 4).replace(/0+$/, "");
  const groupedInteger = BigInt(integer).toLocaleString("en-US");
  return trimmed ? `${groupedInteger}.${trimmed}` : groupedInteger;
};

const normalizeSocialUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const formatBalance = (amount: bigint, decimals: number) =>
  Number(formatUnits(amount, decimals)).toLocaleString("en-US", {
    maximumSignificantDigits: 8,
  });

const formatUsd = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 0.01 ? 8 : 2,
  }).format(value);
};

const formatMarketPrice = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return `$${value.toLocaleString("en-US", { maximumSignificantDigits: 8 })}`;
};

const loadTokenMarketData = async (
  address: Address,
  signal: AbortSignal,
): Promise<TokenMarketData | null> => {
  const dexMarket = async (): Promise<TokenMarketData | null> => {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      {
        signal,
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) {
      throw new Error(`DexScreener returned HTTP ${response.status}.`);
    }
    const data = (await response.json()) as {
      pairs?: Array<{
        chainId: string;
        baseToken: { address: string };
        priceUsd?: string;
        priceNative?: string;
        marketCap?: number;
        fdv?: number;
        volume?: { h24?: number };
        liquidity?: { usd?: number };
        quoteToken?: { symbol?: string };
      }> | null;
    };
    const pair = (data.pairs ?? [])
      .filter(
        (item) =>
          item.chainId === "robinhood" &&
          item.baseToken.address.toLowerCase() === address.toLowerCase(),
      )
      .sort(
        (left, right) =>
          (right.liquidity?.usd ?? 0) - (left.liquidity?.usd ?? 0),
      )[0];
    if (!pair) return null;
    const priceUsd = Number(pair.priceUsd);
    const priceNative = Number(pair.priceNative);
    return {
      priceUsd: Number.isFinite(priceUsd) ? priceUsd : undefined,
      priceNative: Number.isFinite(priceNative) ? priceNative : undefined,
      marketCapUsd: pair.marketCap ?? pair.fdv,
      liquidityUsd: pair.liquidity?.usd,
      volume24hUsd: pair.volume?.h24,
      quoteSymbol: pair.quoteToken?.symbol,
    };
  };

  const ponsMarket = async (): Promise<TokenMarketData | null> => {
    const response = await fetch(`/api/pons-token/${address}`, {
      signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`PonsFamily returned HTTP ${response.status}.`);
    }
    const data = (await response.json()) as {
      priceUsd?: number | null;
      marketCapUsd?: number | null;
      liquidityUsd?: number | null;
      volume24hUsd?: number | null;
      quoteSymbol?: string | null;
    } | null;
    if (!data) return null;
    return {
      priceUsd: data.priceUsd ?? undefined,
      marketCapUsd: data.marketCapUsd ?? undefined,
      liquidityUsd: data.liquidityUsd ?? undefined,
      volume24hUsd: data.volume24hUsd ?? undefined,
      quoteSymbol: data.quoteSymbol ?? undefined,
    };
  };

  const [dexResult, ponsResult] = await Promise.allSettled([
    dexMarket(),
    ponsMarket(),
  ]);
  const dex = dexResult.status === "fulfilled" ? dexResult.value : null;
  const pons = ponsResult.status === "fulfilled" ? ponsResult.value : null;
  if (dex || pons) {
    return {
      priceUsd: dex?.priceUsd ?? pons?.priceUsd,
      priceNative: dex?.priceNative,
      marketCapUsd: dex?.marketCapUsd ?? pons?.marketCapUsd,
      liquidityUsd: dex?.liquidityUsd ?? pons?.liquidityUsd,
      volume24hUsd: dex?.volume24hUsd ?? pons?.volume24hUsd,
      quoteSymbol: dex?.quoteSymbol ?? pons?.quoteSymbol,
    };
  }
  if (dexResult.status === "rejected" && ponsResult.status === "rejected") {
    throw new Error("Live PonsFamily and market data are both unavailable.");
  }
  return null;
};

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="border-b border-white/[0.07] py-3.5">
    <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
      {label}
    </dt>
    <dd className="mt-1.5 break-all text-xs font-medium text-neutral-200">
      {value}
    </dd>
  </div>
);

const SummaryMetric: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="min-w-0 border border-white/[0.07] bg-black/20 px-3 py-3.5 sm:px-4">
    <span className="block text-[9px] text-neutral-500">{label}</span>
    <span className="mt-1.5 block truncate text-xs font-semibold text-white sm:text-sm">
      {value}
    </span>
  </div>
);

export const TokenDetailsPage: React.FC<TokenDetailsPageProps> = ({
  address,
  onBack,
  onProfile,
  walletAddress,
  walletError,
  onConnect,
  onTrade,
}) => {
  const [details, setDetails] = useState<PonsTokenDetails | null>(null);
  const [liveState, setLiveState] = useState<PonsTokenLiveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [market, setMarket] = useState<TokenMarketData | null>(null);
  const [ethUsdPrice, setEthUsdPrice] = useState<number | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<number | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [tradeSide, setTradeSide] = useState<PonsTradeSide>("buy");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeInfo, setTradeInfo] = useState<PonsTradeInfo | null>(null);
  const [tradeInfoError, setTradeInfoError] = useState<string | null>(null);
  const [tradeSubmitting, setTradeSubmitting] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeResult, setTradeResult] = useState<PonsTradeResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setDetails(null);
    setLiveState(null);
    setLoading(true);
    setError(null);
    void loadPonsTokenDetails(address)
      .then((result) => {
        if (!controller.signal.aborted) setDetails(result);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load this token's details.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [address]);

  useEffect(() => {
    if (!details) return;
    let active = true;
    setTradeInfo(null);
    setTradeInfoError(null);
    void loadPonsTradeInfo(details.curve, details.token, walletAddress)
      .then((result) => {
        if (active) setTradeInfo(result);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setTradeInfoError(
          cause instanceof Error
            ? cause.message
            : "Could not load your live trading balances.",
        );
      });
    return () => {
      active = false;
    };
  }, [details, walletAddress]);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let requestController: AbortController | undefined;
    setMarket(null);
    setEthUsdPrice(null);
    setMarketLoading(true);
    setLiveUpdatedAt(null);
    setLiveError(null);

    const refreshLiveData = async () => {
      requestController = new AbortController();
      const [chainResult, marketResult] = await Promise.allSettled([
        loadPonsTokenLiveState(address),
        loadTokenMarketData(address, requestController.signal),
      ]);
      if (!active) return;

      const errors: string[] = [];
      let nextEthUsdPrice: number | null = null;
      if (chainResult.status === "fulfilled") {
        setLiveState(chainResult.value);
      } else {
        errors.push("On-chain status could not be refreshed.");
      }

      if (marketResult.status === "fulfilled") {
        setMarket(marketResult.value);
      } else {
        errors.push("Market price data could not be refreshed.");
      }

      const chainState =
        chainResult.status === "fulfilled" ? chainResult.value : null;
      const marketData =
        marketResult.status === "fulfilled" ? marketResult.value : null;
      const needsEthUsd =
        chainState?.quoteSymbol?.toUpperCase() === "ETH" &&
        (marketData?.priceUsd === undefined ||
          marketData.marketCapUsd === undefined ||
          marketData.liquidityUsd === undefined);
      if (needsEthUsd) {
        try {
          const response = await fetch("/api/eth-usd", {
            signal: requestController.signal,
            cache: "no-store",
            headers: { Accept: "application/json" },
          });
          if (!response.ok) {
            throw new Error(`ETH/USD request failed (${response.status}).`);
          }
          const data = (await response.json()) as EthUsdResponse;
          if (
            typeof data.priceUsd !== "number" ||
            !Number.isFinite(data.priceUsd) ||
            data.priceUsd <= 0
          ) {
            throw new Error("ETH/USD returned an invalid price.");
          }
          nextEthUsdPrice = data.priceUsd;
        } catch (cause) {
          if (requestController.signal.aborted || !active) return;
          errors.push(
            cause instanceof Error
              ? `ETH/USD conversion is unavailable: ${cause.message}`
              : "ETH/USD conversion is unavailable.",
          );
        }
      }
      if (nextEthUsdPrice !== null) setEthUsdPrice(nextEthUsdPrice);

      setMarketLoading(false);
      setLiveError(errors.length > 0 ? errors.join(" ") : null);
      if (
        chainResult.status === "fulfilled" ||
        marketResult.status === "fulfilled"
      ) {
        setLiveUpdatedAt(Date.now());
      }
      timer = window.setTimeout(() => void refreshLiveData(), 5_000);
    };

    void refreshLiveData();
    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
      requestController?.abort();
    };
  }, [address]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const quoteSymbol = market?.quoteSymbol ?? liveState?.quoteSymbol;
  const currentPriceNative = market?.priceNative ?? liveState?.priceNative;
  const priceUsd =
    market?.priceUsd ??
    (quoteSymbol?.toUpperCase() === "ETH" &&
    currentPriceNative !== undefined &&
    ethUsdPrice !== null
      ? currentPriceNative * ethUsdPrice
      : undefined);
  const marketCapUsd =
    market?.marketCapUsd ??
    (quoteSymbol?.toUpperCase() === "ETH" &&
    liveState?.marketCapNative !== undefined &&
    ethUsdPrice !== null
      ? liveState.marketCapNative * ethUsdPrice
      : undefined);
  const liquidityUsd =
    market?.liquidityUsd ??
    (quoteSymbol?.toUpperCase() === "ETH" &&
    liveState?.liquidityNative !== undefined &&
    ethUsdPrice !== null
      ? liveState.liquidityNative * ethUsdPrice
      : undefined);
  const tradeDecimals =
    tradeSide === "buy"
      ? tradeInfo?.quoteDecimals ?? 18
      : details?.decimals ?? 18;
  const availableBalance =
    tradeSide === "buy"
      ? tradeInfo?.quoteBalance
      : tradeInfo?.tokenBalance;
  let parsedTradeAmount: bigint | null = null;
  if (tradeAmount && tradeInfo && /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(tradeAmount)) {
    try {
      parsedTradeAmount = parseUnits(tradeAmount, tradeDecimals);
    } catch {
      parsedTradeAmount = null;
    }
  }

  const selectTradeSide = (side: PonsTradeSide) => {
    setTradeSide(side);
    setTradeAmount("");
    setTradeError(null);
    setTradeResult(null);
  };

  const setTradePercentage = (percentage: number) => {
    if (availableBalance === null || availableBalance === undefined) return;
    const amount = (availableBalance * BigInt(percentage)) / 100n;
    setTradeAmount(formatUnits(amount, tradeDecimals));
    setTradeError(null);
    setTradeResult(null);
  };

  const submitTrade = async () => {
    if (!walletAddress) {
      try {
        await onConnect();
      } catch (cause) {
        setTradeError(
          cause instanceof Error ? cause.message : "Could not connect wallet.",
        );
      }
      return;
    }
    if (!details || !parsedTradeAmount || parsedTradeAmount <= 0n) {
      setTradeError("Enter a valid amount to trade.");
      return;
    }
    setTradeSubmitting(true);
    setTradeError(null);
    setTradeResult(null);
    try {
      const result = await onTrade(
        details.curve,
        details.token,
        tradeSide,
        parsedTradeAmount,
      );
      setTradeResult(result);
      setTradeAmount("");
      try {
        setTradeInfo(
          await loadPonsTradeInfo(details.curve, details.token, walletAddress),
        );
        setTradeInfoError(null);
      } catch (cause) {
        setTradeInfoError(
          cause instanceof Error
            ? `Trade confirmed, but balances could not be refreshed: ${cause.message}`
            : "Trade confirmed, but balances could not be refreshed.",
        );
      }
    } catch (cause) {
      setTradeError(
        cause instanceof Error ? cause.message : "The trade could not be completed.",
      );
    } finally {
      setTradeSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-5 pb-20 pt-24 text-white sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[18%] top-[12%] h-[420px] w-[420px] rounded-full bg-emerald-600/[0.05] blur-[140px]" />
        <div className="absolute right-[8%] top-[42%] h-[480px] w-[480px] rounded-full bg-green-700/[0.035] blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1040px]">
        <button
          type="button"
          onClick={onBack}
          className="mb-7 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        {loading && (
          <p className="border border-white/10 bg-white/[0.02] py-24 text-center text-xs text-neutral-400">
            Reading token details from Robinhood Chain…
          </p>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="border border-amber-300/20 bg-amber-300/[0.04] p-5 text-xs text-amber-100"
          >
            {error}
          </div>
        )}

        {details && (
          <>
            <header className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#101310] text-2xl font-bold text-emerald-100">
                  {details.logo && (
                    <img
                      src={details.logo}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <span className="relative">{details.symbol.slice(0, 1)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h1 className="truncate text-2xl font-semibold tracking-tight text-white">
                      {details.name}
                    </h1>
                    <span className="text-[10px] font-medium text-neutral-500">
                      ${details.symbol}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-neutral-500">
                    <span>
                      Creator{" "}
                      <a
                        href={`https://explorer.mainnet.chain.robinhood.com/address/${details.deployer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-300 hover:text-emerald-200"
                      >
                        {shortAddress(details.deployer)}
                      </a>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Radio className="h-3 w-3 text-emerald-300/70" />
                      On-chain
                    </span>
                    <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] text-neutral-400">
                      Pons V2
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex min-h-9 items-center rounded-lg border border-white/10 px-3 text-[9px] text-neutral-400">
                  Paired with{" "}
                  <span className="ml-1 font-medium text-neutral-200">
                    {/^0x0{40}$/i.test(details.pairToken)
                      ? "ETH"
                      : shortAddress(details.pairToken)}
                  </span>
                </span>
                <a
                  href={`https://explorer.mainnet.chain.robinhood.com/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-[9px] font-semibold text-neutral-200 transition-colors hover:border-white/30 hover:text-white"
                >
                  Explorer <ExternalLink className="h-3 w-3" />
                </a>
                {onProfile && (
                  <button
                    type="button"
                    onClick={onProfile}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-300/35 px-3 text-[9px] font-semibold text-emerald-200 transition-colors hover:border-emerald-300/60"
                  >
                    <Wallet className="h-3 w-3" />
                    Profile
                  </button>
                )}
              </div>
            </header>

            {details.metadataNotice && (
              <p
                role="status"
                className="mt-5 border border-amber-300/15 bg-amber-300/[0.035] px-4 py-3 text-[10px] text-amber-100/80"
              >
                {details.metadataNotice}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-200/80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                Live data · refreshes every 5 seconds
              </span>
              <span className="text-neutral-600">
                {liveUpdatedAt
                  ? `Updated ${new Date(liveUpdatedAt).toLocaleTimeString()}`
                  : "Fetching current market and on-chain data…"}
              </span>
            </div>
            {liveError && (
              <p role="status" className="mt-2 text-[9px] text-amber-200/80">
                {liveError} Showing the last successfully fetched values.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#101010] p-2 sm:gap-2.5 sm:p-3 lg:grid-cols-3">
              <SummaryMetric
                label="Price"
                value={marketLoading ? "Loading…" : formatMarketPrice(priceUsd)}
              />
              <SummaryMetric
                label="Market cap / FDV"
                value={marketLoading ? "Loading…" : formatUsd(marketCapUsd)}
              />
              <SummaryMetric
                label="Liquidity"
                value={marketLoading ? "Loading…" : formatUsd(liquidityUsd)}
              />
              <SummaryMetric
                label="24H volume"
                value={marketLoading ? "Loading…" : formatUsd(market?.volume24hUsd)}
              />
              <SummaryMetric
                label={`Price in ${quoteSymbol ?? "ETH"}`}
                value={
                  marketLoading
                    ? "Loading…"
                    : currentPriceNative !== undefined
                      ? `${currentPriceNative.toLocaleString("en-US", { maximumSignificantDigits: 8 })} ${quoteSymbol ?? "ETH"}`
                      : "—"
                }
              />
              <SummaryMetric
                label="Total supply"
                value={`${formatTokenAmount(details.totalSupply, details.decimals)} ${details.symbol}`}
              />
            </div>
            {liveState?.marketCapNative !== undefined &&
              market?.marketCapUsd === undefined && (
                <p className="mt-2 text-[9px] leading-5 text-neutral-600">
                  On-chain market cap is estimated from the curve price and
                  total supply; indexed market data may use a different
                  circulating-supply calculation.
                </p>
              )}

            <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <article className="rounded-xl border border-white/10 bg-[#101010] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Trade ${details.symbol}
                    </h2>
                    <p className="mt-1 text-[10px] text-neutral-500">
                      Swap on Robinhood Chain
                    </p>
                  </div>
                  <div className="flex rounded-lg border border-white/10 p-0.5">
                    {(["buy", "sell"] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => selectTradeSide(side)}
                        aria-pressed={tradeSide === side}
                        className={`rounded-md px-3 py-1.5 text-[9px] font-semibold capitalize transition-colors ${
                          tradeSide === side
                            ? "bg-white/10 text-white"
                            : "text-neutral-500 hover:text-neutral-200"
                        }`}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3.5">
                  <div className="flex items-center justify-between gap-3 text-[9px] text-neutral-500">
                    <label htmlFor="token-trade-amount">You pay</label>
                    <span>
                      Balance:{" "}
                      {availableBalance === null || availableBalance === undefined
                        ? "—"
                        : formatBalance(availableBalance, tradeDecimals)}{" "}
                      {tradeSide === "buy"
                        ? tradeInfo?.quoteSymbol ?? "ETH"
                        : details.symbol}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="token-trade-amount"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.0"
                      value={tradeAmount}
                      onChange={(event) => {
                        setTradeAmount(event.target.value);
                        setTradeError(null);
                        setTradeResult(null);
                      }}
                      aria-label={`Amount to ${tradeSide}`}
                      className="min-w-0 flex-1 bg-transparent py-1 text-xl font-medium text-white outline-none placeholder:text-neutral-600"
                    />
                    <span className="rounded-lg border border-white/10 px-3 py-2 text-[9px] font-semibold text-neutral-200">
                      {tradeSide === "buy"
                        ? tradeInfo?.quoteSymbol ?? "ETH"
                        : details.symbol}
                    </span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((percentage) => (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => setTradePercentage(percentage)}
                      disabled={availableBalance === null || availableBalance === undefined}
                      className="min-h-7 rounded-md border border-white/[0.07] text-[8px] text-neutral-500 transition-colors hover:border-white/20 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {percentage === 100 ? "Max" : `${percentage}%`}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[9px]">
                  <span className="text-neutral-500">Estimated receive</span>
                  <span className="text-right text-neutral-300">
                    {tradeResult && tradeInfo
                      ? `${formatBalance(
                          tradeResult.amountOut,
                          tradeSide === "buy"
                            ? details.decimals
                            : tradeInfo.quoteDecimals,
                        )} ${
                          tradeSide === "buy"
                            ? details.symbol
                            : tradeInfo.quoteSymbol
                        } (quoted)`
                      : "Quoted on-chain when submitted"}
                  </span>
                </div>
                <p className="mt-1 text-right text-[8px] text-neutral-600">
                  1% slippage protection · {tradeInfo?.isNativeQuote ? "ETH" : tradeInfo?.quoteSymbol ?? "quote token"} quote
                </p>
                {(tradeError || tradeInfoError || walletError) && (
                  <p role="alert" className="mt-2 text-[9px] text-amber-200/90">
                    {tradeError ?? tradeInfoError ?? walletError}
                  </p>
                )}
                {tradeResult && (
                  <a
                    href={`https://explorer.mainnet.chain.robinhood.com/tx/${tradeResult.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[9px] text-emerald-200 hover:text-emerald-100"
                  >
                    Transaction confirmed <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => void submitTrade()}
                  disabled={
                    tradeSubmitting ||
                    (Boolean(walletAddress) &&
                      (!parsedTradeAmount || parsedTradeAmount <= 0n))
                  }
                  className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 text-[10px] font-semibold text-black transition-colors hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {tradeSubmitting
                    ? "Confirm in wallet and wait…"
                    : walletAddress
                      ? `${tradeSide === "buy" ? "Buy" : "Sell"} $${details.symbol}`
                      : "Connect wallet"}
                </button>
              </article>

              <article className="rounded-xl border border-white/10 bg-[#101010] p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-white">
                  Token details
                </h2>
                {details.description && (
                  <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">
                    {details.description}
                  </p>
                )}
                <dl className="mt-1">
                  <Detail label="Token" value={details.name} />
                 
                  <Detail
                    label="Total supply"
                    value={`${formatTokenAmount(details.totalSupply, details.decimals)} ${details.symbol}`}
                  />
                  <Detail
                    label="Fee recipient"
                    value={shortAddress(details.creatorFeeRecipient)}
                  />
                  <Detail
                    label="Launch date"
                    value={
                      details.launchedAt
                        ? new Date(details.launchedAt).toLocaleString()
                        : "Confirmed on-chain"
                    }
                  />
                </dl>
                <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Contract
                    </span>
                    <button
                      type="button"
                      onClick={() => void copyAddress()}
                      aria-label={copied ? "Token address copied" : "Copy token address"}
                      className="text-neutral-500 transition-colors hover:text-emerald-200"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 break-all font-mono text-[9px] text-neutral-300">
                    {address}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[9px] text-neutral-500">
                  <a
                    href={`https://ponsfamily.com/launchpad?token=${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-200"
                  >
                    View token on Pons <ExternalLink className="ml-0.5 inline h-2.5 w-2.5" />
                  </a>
                  {details.transactionHash && (
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/tx/${details.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-200"
                    >
                      Launch transaction <ExternalLink className="ml-0.5 inline h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </article>
            </div>

            {details.socials && (
              <div className="mt-5 flex flex-wrap gap-2">
                {(
                  [
                    ["X", details.socials.twitter],
                    ["Telegram", details.socials.telegram],
                    ["Discord", details.socials.discord],
                    ["Website", details.socials.website],
                    ["Farcaster", details.socials.farcaster],
                  ] as const
                )
                  .filter(([, url]) => url.trim())
                  .map(([label, url]) => (
                    <a
                      key={label}
                      href={normalizeSocialUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-white/10 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:border-emerald-300/30 hover:text-white"
                    >
                      {label} <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
