import { useEffect, useState } from "react";

const TOKEN_ADDRESSES = [
  "0x39dBED3a2bd333467115dE45665cC57F813C4571",
  "0x07EBB29a38Fbcb41563817e5E19f2ceC619C90D2",
  "0x7FE995a80075dF3Dc8Ae11A9b82c7FE4202CD87f",
];

const REFRESH_INTERVAL = 30_000;
const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESSES.join(",")}`;

interface DexScreenerPair {
  chainId: string;
  url: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
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

export interface Token {
  address: string;
  name: string;
  symbol: string;
  networkLabel?: string;
  image?: string;
  marketCap?: number;
  priceUsd?: number;
  volume24h?: number;
  liquidity?: number;
  priceChange24h?: number;
  launchedAt?: string;
  priceNative?: number;
  marketCapNative?: number;
  liquidityNative?: number;
  quoteSymbol?: string;
  url: string;
}

const toToken = (
  address: string,
  pairs: DexScreenerPair[],
): Token | undefined => {
  const pair = pairs
    .filter(
      (candidate) =>
        candidate.chainId === "robinhood" &&
        candidate.baseToken.address.toLowerCase() === address.toLowerCase(),
    )
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  if (!pair) return undefined;

  const price = Number(pair.priceUsd);
  return {
    address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    image: pair.info?.imageUrl,
    marketCap: pair.marketCap,
    priceUsd: Number.isFinite(price) ? price : undefined,
    volume24h: pair.volume?.h24,
    liquidity: pair.liquidity?.usd,
    priceChange24h: pair.priceChange?.h24,
    url: pair.url,
  };
};

export interface LiveTokensState {
  tokens: Token[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  missingCount: number;
  lastUpdated: number | null;
  trackedCount: number;
}

export const useLiveTokens = (): LiveTokensState => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingCount, setMissingCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let activeController: AbortController | undefined;

    const loadTokens = async () => {
      if (activeController) return;
      const controller = new AbortController();
      activeController = controller;
      if (!disposed) {
        setRefreshing(true);
        setError(null);
      }

      try {
        const response = await fetch(DEXSCREENER_URL, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Token data request failed (${response.status}).`);
        }

        const data = (await response.json()) as DexScreenerResponse;
        if (!Array.isArray(data.pairs)) {
          throw new Error("The token data provider returned an invalid response.");
        }

        const fetchedTokens = TOKEN_ADDRESSES.map((address) =>
          toToken(address, data.pairs ?? []),
        );
        const availableTokens = fetchedTokens.filter(
          (token): token is Token => token !== undefined,
        );
        if (availableTokens.length === 0) {
          throw new Error(
            "No Robinhood Chain market data was found for these contracts.",
          );
        }

        if (!disposed) {
          setTokens(availableTokens);
          setMissingCount(TOKEN_ADDRESSES.length - availableTokens.length);
          setLastUpdated(Date.now());
        }
      } catch (cause) {
        if (controller.signal.aborted || disposed) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load live token data.",
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
  }, []);

  return {
    tokens,
    loading,
    refreshing,
    error,
    missingCount,
    lastUpdated,
    trackedCount: TOKEN_ADDRESSES.length,
  };
};
