import { useEffect, useRef, useState } from "react";
import type { Token } from "./useLiveTokens";
import type { StoredLaunch } from "./launchTypes";
import { loadPonsTokenLiveState } from "../services/ponsLaunch";
import type { Address } from "viem";

const PAGE_SIZE = 30;
const MAX_RESULTS = 100;
const REFRESH_INTERVAL = 30_000;

export type PonsSort = "marketCap" | "newest" | "volume";
export type ExploreSort = "all" | PonsSort;

interface PonsLaunch {
  token: string;
  name?: string | null;
  symbol?: string | null;
  logo?: string | null;
  launchedAt?: string | null;
  priceUsd?: number | null;
  marketCapUsd?: number | null;
  realMcapUsd?: number | null;
  liquidityUsd?: number | null;
}

interface PonsLaunchResponse {
  active?: {
    items?: PonsLaunch[];
    total?: number;
  };
}

interface DexScreenerPair {
  chainId: string;
  url: string;
  baseToken: { address: string };
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  marketCap?: number;
  info?: { imageUrl?: string };
}

interface DexScreenerResponse {
  pairs?: DexScreenerPair[] | null;
}

interface EthUsdResponse {
  priceUsd?: number;
}

interface PonsTokensState {
  tokens: Token[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  marketDataError: string | null;
  savedLaunchesError: string | null;
  lastUpdated: number | null;
  total: number;
}

const readJsonResponse = async <T>(
  response: Response,
  source: string,
): Promise<T> => {
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      `${source} did not return JSON. Restart the CosmoPad API and Vite servers to apply the current API proxy.`,
    );
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`${source} returned invalid JSON.`);
  }
};

const normalizeImageUrl = (image?: string | null) => {
  if (!image) return undefined;
  if (image.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${image.slice("ipfs://".length).replace(/^ipfs\//, "")}`;
  }
  return image;
};

const toToken = (launch: PonsLaunch): Token | undefined => {
  if (!launch.token || !/^0x[a-fA-F0-9]{40}$/.test(launch.token)) {
    return undefined;
  }

  return {
    address: launch.token,
    name: launch.name?.trim() || "Unknown world",
    symbol: launch.symbol?.trim() || "TOKEN",
    image: normalizeImageUrl(launch.logo),
    marketCap: launch.realMcapUsd ?? launch.marketCapUsd ?? undefined,
    priceUsd: launch.priceUsd ?? undefined,
    liquidity: launch.liquidityUsd ?? undefined,
    launchedAt: launch.launchedAt ?? undefined,
    networkLabel: "PONS FAMILY",
    url: `https://dexscreener.com/robinhood/${launch.token}`,
  };
};

const launchToToken = (launch: StoredLaunch): Token => ({
  address: launch.token,
  name: launch.name,
  symbol: launch.symbol,
  image: normalizeImageUrl(launch.logo),
  launchedAt: launch.launchedAt,
  networkLabel: "COSMOPAD LAUNCH",
  url: `https://dexscreener.com/robinhood/${launch.token}`,
});

const getLaunchTimestamp = (token: Token) => {
  const timestamp = token.launchedAt ? Date.parse(token.launchedAt) : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const sortTokens = (tokens: Token[], sort: ExploreSort) => {
  const sorted = [...tokens];
  sorted.sort((left, right) => {
    if (sort === "all") {
      const leftIsCosmo = left.networkLabel === "COSMOPAD LAUNCH";
      const rightIsCosmo = right.networkLabel === "COSMOPAD LAUNCH";
      if (leftIsCosmo !== rightIsCosmo) return leftIsCosmo ? -1 : 1;
    }
    if (sort === "newest") {
      return getLaunchTimestamp(right) - getLaunchTimestamp(left);
    }
    if (sort === "volume") {
      return (right.volume24h ?? -1) - (left.volume24h ?? -1);
    }
    if (left.marketCap === undefined || right.marketCap === undefined) {
      if (left.marketCap !== undefined) return -1;
      if (right.marketCap !== undefined) return 1;
      return (
        (right.marketCapNative ?? -1) - (left.marketCapNative ?? -1)
      );
    }
    return (
      right.marketCap - left.marketCap
    );
  });
  return sorted;
};

const loadDexPairs = async (
  tokens: Token[],
  signal: AbortSignal,
): Promise<DexScreenerPair[]> => {
  const chunks = [];
  for (let index = 0; index < tokens.length; index += PAGE_SIZE) {
    chunks.push(tokens.slice(index, index + PAGE_SIZE));
  }
  const responses = await Promise.all(
    chunks.map(async (chunk) => {
      const addresses = chunk.map((token) => token.address).join(",");
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${addresses}`,
        {
          signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );
      if (!response.ok) {
        throw new Error(`Market data request failed (${response.status}).`);
      }
      return readJsonResponse<DexScreenerResponse>(response, "DexScreener");
    }),
  );
  return responses.flatMap((data) => {
    if (data.pairs !== null && data.pairs !== undefined && !Array.isArray(data.pairs)) {
      throw new Error("DexScreener returned invalid market data.");
    }
    return data.pairs ?? [];
  });
};

export const usePonsTokens = (
  sort: ExploreSort,
  page: number,
): PonsTokensState => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);
  const [savedLaunchesError, setSavedLaunchesError] = useState<string | null>(
    null,
  );
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const lastQueryKey = useRef("");

  useEffect(() => {
    let disposed = false;
    let activeController: AbortController | undefined;
    const queryKey = `${sort}:${page}`;

    const loadTokens = async () => {
      if (activeController) return;
      const controller = new AbortController();
      activeController = controller;
      const isNewQuery = lastQueryKey.current !== queryKey;
      if (!disposed) {
        if (isNewQuery) {
          lastQueryKey.current = queryKey;
          setTokens([]);
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);
        if (isNewQuery) {
          setMarketDataError(null);
          setSavedLaunchesError(null);
        }
      }

      try {
        const upstreamSort = sort === "all" ? "marketCap" : sort;
        const pageCount = Math.ceil(MAX_RESULTS / PAGE_SIZE);
        const feedPages = await Promise.all(
          Array.from({ length: pageCount }, async (_, index) => {
            const feedPage = index + 1;
            const pageSize = Math.min(
              PAGE_SIZE,
              MAX_RESULTS - index * PAGE_SIZE,
            );
            const params = new URLSearchParams({
              explore: "1",
              sort: upstreamSort,
              age: "all",
              page: String(feedPage),
              pageSize: String(pageSize),
              graduatedPage: "1",
              graduatedPageSize: "0",
              includeGraduated: "0",
              version: "all",
              v: "22",
            });
            const response = await fetch(`/api/pons-launches?${params}`, {
              signal: controller.signal,
              cache: "no-store",
              headers: { Accept: "application/json" },
            });
            if (!response.ok) {
              throw new Error(`PonsFamily request failed (${response.status}).`);
            }
            return readJsonResponse<PonsLaunchResponse>(
              response,
              "PonsFamily launch feed",
            );
          }),
        );
        const allLaunches = feedPages.flatMap((data) => {
          if (!Array.isArray(data.active?.items)) {
            throw new Error("PonsFamily returned an invalid launch list.");
          }
          return data.active.items;
        });
        const launches = allLaunches
          .map(toToken)
          .filter((token): token is Token => token !== undefined);
        let savedLaunches: StoredLaunch[] = [];
        let savedLaunchesError: string | null = null;
        try {
          const savedResponse = await fetch(
            "/api/user-launches?scope=explore",
            {
              signal: controller.signal,
              cache: "no-store",
              headers: { Accept: "application/json" },
            },
          );
          if (!savedResponse.ok) {
            const failure = (await readJsonResponse<{ error?: string }>(
              savedResponse,
              "CosmoPad launch API",
            ).catch(() => null)) as
              | { error?: string }
              | null;
            throw new Error(
              failure?.error ?? "Could not load CosmoPad launches.",
            );
          }
          const savedData = await readJsonResponse<StoredLaunch[]>(
            savedResponse,
            "CosmoPad launch API",
          );
          if (!Array.isArray(savedData)) {
            throw new Error("CosmoPad returned an invalid saved launch list.");
          }
          savedLaunches = savedData;
        } catch (cause) {
          if (controller.signal.aborted || disposed) return;
          savedLaunchesError =
            cause instanceof Error
              ? cause.message
              : "Could not load CosmoPad launches.";
        }

        const combinedByAddress = new Map(
          launches.map((token) => [token.address.toLowerCase(), token]),
        );
        for (const launch of savedLaunches) {
          const key = launch.token.toLowerCase();
          const saved = launchToToken(launch);
          const live = combinedByAddress.get(key);
          combinedByAddress.set(key, live ? { ...live, ...saved } : saved);
        }
        const combined = Array.from(combinedByAddress.values());

        let marketError: string | null = null;
        try {
          const pairs = await loadDexPairs(combined, controller.signal);
          const enriched = combined.map((token) => {
            const pair = pairs
              .filter(
                (candidate) =>
                  candidate.chainId === "robinhood" &&
                  candidate.baseToken.address.toLowerCase() ===
                    token.address.toLowerCase(),
              )
              .sort(
                (left, right) =>
                  (right.liquidity?.usd ?? 0) - (left.liquidity?.usd ?? 0),
              )[0];
            const dexPrice = Number(pair?.priceUsd);
            return {
              ...token,
              image: pair?.info?.imageUrl ?? token.image,
              priceUsd:
                token.priceUsd ??
                (Number.isFinite(dexPrice) ? dexPrice : undefined),
              marketCap: token.marketCap ?? pair?.marketCap,
              volume24h: pair?.volume?.h24,
              liquidity: token.liquidity ?? pair?.liquidity?.usd,
              priceChange24h: pair?.priceChange?.h24,
              url: pair?.url ?? token.url,
            };
          });
          combined.splice(0, combined.length, ...enriched);
        } catch (cause) {
          if (controller.signal.aborted || disposed) return;
          marketError =
            cause instanceof Error
              ? cause.message
              : "Could not load supplementary market data.";
        }

        const onChainLaunches = combined.filter(
          (token) => token.networkLabel === "COSMOPAD LAUNCH",
        );
        const onChainResults = await Promise.allSettled(
          onChainLaunches.map((token) =>
            loadPonsTokenLiveState(token.address as Address),
          ),
        );
        const onChainByAddress = new Map(
          onChainLaunches.flatMap((token, index) => {
            const result = onChainResults[index];
            return result?.status === "fulfilled"
              ? [[token.address.toLowerCase(), result.value] as const]
              : [];
          }),
        );
        const failedOnChainReads = onChainResults.filter(
          (result) => result.status === "rejected",
        ).length;
        if (failedOnChainReads > 0) {
          marketError = [
            marketError,
            `Could not refresh on-chain values for ${failedOnChainReads} CosmoPad launch${failedOnChainReads === 1 ? "" : "es"}.`,
          ]
            .filter(Boolean)
            .join(" ");
        }
        const withOnChainData = combined.map((token) => {
          const state = onChainByAddress.get(token.address.toLowerCase());
          if (!state) return token;
          return {
            ...token,
            priceNative: token.priceNative ?? state.priceNative,
            marketCapNative:
              token.marketCapNative ?? state.marketCapNative,
            liquidityNative: token.liquidityNative ?? state.liquidityNative,
            quoteSymbol: token.quoteSymbol ?? state.quoteSymbol,
            quoteDecimals: state.quoteDecimals,
          };
        });
        const needsEthUsd = withOnChainData.some(
          (token) =>
            token.quoteSymbol?.toUpperCase() === "ETH" &&
            (token.priceNative !== undefined ||
              token.marketCapNative !== undefined ||
              token.liquidityNative !== undefined),
        );
        let ethUsdPrice: number | undefined;
        if (needsEthUsd) {
          try {
            const response = await fetch("/api/eth-usd", {
              signal: controller.signal,
              cache: "no-store",
              headers: { Accept: "application/json" },
            });
            if (!response.ok) {
              throw new Error(`ETH/USD request failed (${response.status}).`);
            }
            const data = await readJsonResponse<EthUsdResponse>(
              response,
              "ETH/USD price API",
            );
            if (
              typeof data.priceUsd !== "number" ||
              !Number.isFinite(data.priceUsd) ||
              data.priceUsd <= 0
            ) {
              throw new Error("The ETH/USD endpoint returned an invalid price.");
            }
            ethUsdPrice = data.priceUsd;
          } catch (cause) {
            if (controller.signal.aborted || disposed) return;
            marketError = [
              marketError,
              cause instanceof Error
                ? cause.message
                : "Could not load the live ETH/USD price.",
            ]
              .filter(Boolean)
              .join(" ");
          }
        }
        const valuedTokens = withOnChainData.map((token) => {
          if (
            token.quoteSymbol?.toUpperCase() !== "ETH" ||
            ethUsdPrice === undefined
          ) {
            return token;
          }
          return {
            ...token,
            priceUsd:
              token.priceUsd ??
              (token.priceNative !== undefined
                ? token.priceNative * ethUsdPrice
                : undefined),
            marketCap:
              token.marketCap ??
              (token.marketCapNative !== undefined
                ? token.marketCapNative * ethUsdPrice
                : undefined),
            liquidity:
              token.liquidity ??
              (token.liquidityNative !== undefined
                ? token.liquidityNative * ethUsdPrice
                : undefined),
          };
        });

        const sorted = sortTokens(valuedTokens, sort).slice(0, MAX_RESULTS);
        const start = (page - 1) * PAGE_SIZE;
        if (!disposed) {
          setTokens(sorted.slice(start, start + PAGE_SIZE));
          setMarketDataError(marketError);
          setSavedLaunchesError(savedLaunchesError);
          const feedTotal = Number(feedPages[0]?.active?.total);
          setTotal(
            Math.min(
              MAX_RESULTS,
              Math.max(
                Number.isFinite(feedTotal) ? feedTotal : launches.length,
                combined.length,
              ),
            ),
          );
          setLastUpdated(Date.now());
        }
      } catch (cause) {
        if (controller.signal.aborted || disposed) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load PonsFamily launch data.",
        );
      } finally {
        if (activeController === controller) activeController = undefined;
        if (!disposed) {
          setRefreshing(false);
          setLoading(false);
        }
      }
    };

    void loadTokens();
    const intervalId = window.setInterval(loadTokens, REFRESH_INTERVAL);
    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      activeController?.abort();
    };
  }, [page, sort]);

  return {
    tokens,
    loading,
    refreshing,
    error,
    marketDataError,
    savedLaunchesError,
    lastUpdated,
    total,
  };
};
