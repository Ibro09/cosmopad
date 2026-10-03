import {
  bytesToHex,
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatEther,
  formatUnits,
  getAddress,
  http,
  parseAbi,
  parseUnits,
  parseEventLogs,
  type Address,
  type Abi,
  type Hex,
  type Hash,
} from "viem";
import type {
  ConfirmedLaunch,
  LaunchDraft,
  PonsTokenDetails,
  PonsTokenLiveState,
  StoredLaunch,
} from "../components/launchTypes";

export const PONS_FACTORY_ADDRESS =
  "0x7ed598bcef8bd9edd8c97a195c6d13f40801ec7e" as const;
export const PONS_NATIVE_PAIR_TOKEN =
  "0x0000000000000000000000000000000000000000" as const;

export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: "https://explorer.mainnet.chain.robinhood.com",
    },
  },
});

export const ponsFactoryAbi = parseAbi([
  "function launchConfigCount() view returns (uint256)",
  "function getLaunchConfig(uint256 id) view returns ((uint256 supply, uint256 curveFeeBps, uint256 phantomQuote, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, bool enabled))",
  "function launchEnabled() view returns (bool)",
  "function launchFee() view returns (uint256)",
  "function getLaunchedToken(address token) view returns ((address token, address curve, address deployer, address creatorFeeRecipient, address pairToken, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, uint16 creatorTaxBps, bool buybackEnabled, uint8 phase, uint256 sweptQuote, uint256 sweptTokens, uint256 sweptAt, bool exists))",
  "function previewLaunchEconomics(uint256 launchConfigId, address pairToken) view returns (bytes32)",
  "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)",
]);

const tokenDetailsAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
]);

const curveDetailsAbi = parseAbi([
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function phantomQuote() view returns (uint256)",
]);

const curveTradeAbi = parseAbi([
  "function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)",
  "function sell(uint256 tokensIn, uint256 minQuoteOut, address recipient) returns (uint256 quoteOut)",
  "function isNativeQuote() view returns (bool)",
  "function pairToken() view returns (address)",
]);

const tradeTokenAbi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

export interface PonsTradeInfo {
  isNativeQuote: boolean;
  quoteToken: Address;
  quoteSymbol: string;
  quoteDecimals: number;
  quoteBalance: bigint | null;
  tokenBalance: bigint | null;
}

export type PonsTradeSide = "buy" | "sell";

export interface PonsTradeResult {
  hash: Hash;
  amountOut: bigint;
}

interface CreatorFeeSettings {
  creatorFeeRecipient: Address;
  creatorTaxBps: number;
}

interface Eip1193Provider {
  request: (args: {
    method: string;
    params?: readonly unknown[];
  }) => Promise<unknown>;
}

const loadSavedTokenMetadata = async (token: Address) => {
  try {
    const response = await fetch(`/api/token-launches/${token}`);
    if (response.status === 404) {
      return { launch: null, notice: null };
    }
    if (response.status === 503) {
      return {
        launch: null,
        notice:
          "Saved CosmoPad metadata is unavailable; on-chain details are still shown.",
      };
    }
    if (!response.headers.get("content-type")?.includes("application/json")) {
      return {
        launch: null,
        notice:
          "Saved token details are temporarily unavailable because the metadata API did not return JSON. Restart the CosmoPad API server; on-chain details are still shown.",
      };
    }
    if (!response.ok) {
      return {
        launch: null,
        notice: `Saved token details could not be loaded (HTTP ${response.status}); on-chain details are still shown.`,
      };
    }
    return {
      launch: (await response.json()) as StoredLaunch,
      notice: null,
    };
  } catch (cause) {
    return {
      launch: null,
      notice:
        cause instanceof Error
          ? `Saved metadata could not be loaded: ${cause.message}`
          : "Saved metadata could not be loaded; on-chain details are still shown.",
    };
  }
};

const launchTokenAbi: Abi = [
  {
    type: "function",
    name: "launchToken",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "logo", type: "string" },
          { name: "description", type: "string" },
          {
            name: "socials",
            type: "tuple",
            components: [
              { name: "twitter", type: "string" },
              { name: "telegram", type: "string" },
              { name: "discord", type: "string" },
              { name: "website", type: "string" },
              { name: "farcaster", type: "string" },
            ],
          },
          { name: "creatorFeeRecipient", type: "address" },
          { name: "creatorTaxBps", type: "uint16" },
          { name: "buybackEnabled", type: "bool" },
          { name: "expectedEconomics", type: "bytes32" },
          { name: "salt", type: "bytes32" },
        ],
      },
      { name: "launchConfigId", type: "uint256" },
      { name: "pairToken", type: "address" },
    ],
    outputs: [
      { name: "token", type: "address" },
      { name: "curve", type: "address" },
    ],
  },
];

export interface OpenLaunchConfig {
  id: number;
  supply: bigint;
  curveFeeBps: bigint;
  phantomQuote: bigint;
  graduationThreshold: bigint;
  poolFee: number;
  tickSpacing: number;
  enabled: boolean;
}

const rpcTransport = http();
const publicClient = createPublicClient<
  typeof rpcTransport,
  typeof robinhoodChain,
  undefined
>({
  chain: robinhoodChain,
  transport: rpcTransport,
});

export const loadPonsTokenDetails = async (
  token: Address,
): Promise<PonsTokenDetails> => {
  const launch = await publicClient.readContract({
    authorizationList: undefined,
    address: PONS_FACTORY_ADDRESS,
    abi: ponsFactoryAbi,
    functionName: "getLaunchedToken",
    args: [token],
  });
  if (!launch.exists) {
    throw new Error("This token was not launched through PonsFamily.");
  }

  const readCurveQuoteReserve = async () => {
    const [reserves, phantomQuote] = await Promise.all([
      publicClient.readContract({
        authorizationList: undefined,
        address: launch.curve,
        abi: curveDetailsAbi,
        functionName: "getReserves",
      }),
      publicClient.readContract({
        authorizationList: undefined,
        address: launch.curve,
        abi: curveDetailsAbi,
        functionName: "phantomQuote",
      }),
    ]);
    return reserves[0] > phantomQuote ? reserves[0] - phantomQuote : 0n;
  };

  const [name, symbol, decimals, totalSupply, curveQuoteReserve, metadata] =
    await Promise.all([
      publicClient.readContract({
        authorizationList: undefined,
        address: token,
        abi: tokenDetailsAbi,
        functionName: "name",
      }),
      publicClient.readContract({
        authorizationList: undefined,
        address: token,
        abi: tokenDetailsAbi,
        functionName: "symbol",
      }),
      publicClient.readContract({
        authorizationList: undefined,
        address: token,
        abi: tokenDetailsAbi,
        functionName: "decimals",
      }),
      publicClient.readContract({
        authorizationList: undefined,
        address: token,
        abi: tokenDetailsAbi,
        functionName: "totalSupply",
      }),
      readCurveQuoteReserve(),
      loadSavedTokenMetadata(token),
    ]);

  return {
    token,
    name,
    symbol,
    decimals,
    totalSupply,
    curve: launch.curve,
    deployer: launch.deployer,
    creatorFeeRecipient: launch.creatorFeeRecipient,
    pairToken: launch.pairToken,
    graduationThreshold: launch.graduationThreshold,
    curveQuoteReserve,
    phase: launch.phase,
    creatorTaxBps: launch.creatorTaxBps,
    buybackEnabled: launch.buybackEnabled,
    launchedAt: metadata.launch?.launchedAt ?? null,
    transactionHash: metadata.launch?.transactionHash ?? null,
    description: metadata.launch?.description ?? "",
    logo: metadata.launch?.logo ?? "",
    socials: metadata.launch?.socials ?? null,
    metadataNotice: metadata.notice,
  };
};

export const loadPonsTokenLiveState = async (
  token: Address,
): Promise<PonsTokenLiveState> => {
  const launch = await publicClient.readContract({
    authorizationList: undefined,
    address: PONS_FACTORY_ADDRESS,
    abi: ponsFactoryAbi,
    functionName: "getLaunchedToken",
    args: [token],
  });
  if (!launch.exists) {
    throw new Error("This token is no longer registered with PonsFamily.");
  }
  if (launch.phase !== 0) {
    return {
      phase: launch.phase,
      curveQuoteReserve: 0n,
      graduationThreshold: launch.graduationThreshold,
    };
  }

  const nativeQuote =
    launch.pairToken.toLowerCase() === PONS_NATIVE_PAIR_TOKEN;
  const [reserves, phantomQuote, decimals, totalSupply, quoteSymbol, quoteDecimals] =
    await Promise.all([
      publicClient.readContract({
        authorizationList: undefined,
        address: launch.curve,
        abi: curveDetailsAbi,
        functionName: "getReserves",
      }),
      publicClient.readContract({
        authorizationList: undefined,
        address: launch.curve,
        abi: curveDetailsAbi,
        functionName: "phantomQuote",
      }),
      publicClient.readContract({
        authorizationList: undefined,
        address: token,
        abi: tokenDetailsAbi,
        functionName: "decimals",
      }),
      publicClient.readContract({
        authorizationList: undefined,
        address: token,
        abi: tokenDetailsAbi,
        functionName: "totalSupply",
      }),
      nativeQuote
        ? Promise.resolve("ETH")
        : publicClient.readContract({
            authorizationList: undefined,
            address: launch.pairToken,
            abi: tradeTokenAbi,
            functionName: "symbol",
          }),
      nativeQuote
        ? Promise.resolve(18)
        : publicClient.readContract({
            authorizationList: undefined,
            address: launch.pairToken,
            abi: tradeTokenAbi,
            functionName: "decimals",
          }),
    ]);

  const priceNative =
    reserves[1] > 0n
      ? Number(formatUnits(reserves[0], quoteDecimals)) /
        Number(formatUnits(reserves[1], decimals))
      : undefined;
  const curveQuoteReserve =
    reserves[0] > phantomQuote ? reserves[0] - phantomQuote : 0n;
  const marketCapNative =
    priceNative !== undefined
      ? priceNative * Number(formatUnits(totalSupply, decimals))
      : undefined;

  return {
    phase: launch.phase,
    curveQuoteReserve,
    graduationThreshold: launch.graduationThreshold,
    priceNative:
      priceNative !== undefined && Number.isFinite(priceNative)
        ? priceNative
        : undefined,
    marketCapNative:
      marketCapNative !== undefined && Number.isFinite(marketCapNative)
        ? marketCapNative
        : undefined,
    liquidityNative:
      Number.isFinite(Number(formatUnits(curveQuoteReserve, quoteDecimals)))
        ? Number(formatUnits(curveQuoteReserve, quoteDecimals)) * 2
        : undefined,
    quoteSymbol,
    quoteDecimals,
  };
};

export const loadPonsTradeInfo = async (
  curve: Address,
  token: Address,
  account: Address | null,
): Promise<PonsTradeInfo> => {
  const [isNativeQuote, quoteToken] = await Promise.all([
    publicClient.readContract({
      authorizationList: undefined,
      address: curve,
      abi: curveTradeAbi,
      functionName: "isNativeQuote",
    }),
    publicClient.readContract({
      authorizationList: undefined,
      address: curve,
      abi: curveTradeAbi,
      functionName: "pairToken",
    }),
  ]);
  const [quoteSymbol, quoteDecimals, quoteBalance, tokenBalance] =
    isNativeQuote
      ? await Promise.all([
          Promise.resolve("ETH"),
          Promise.resolve(18),
          account
            ? publicClient.getBalance({ address: account })
            : Promise.resolve(null),
          account
            ? publicClient.readContract({
              authorizationList: undefined,
              address: token,
                abi: tradeTokenAbi,
                functionName: "balanceOf",
                args: [account],
              })
            : Promise.resolve(null),
        ])
      : await Promise.all([
          publicClient.readContract({
            authorizationList: undefined,
            address: quoteToken,
            abi: tradeTokenAbi,
            functionName: "symbol",
          }),
          publicClient.readContract({
            authorizationList: undefined,
            address: quoteToken,
            abi: tradeTokenAbi,
            functionName: "decimals",
          }),
          account
            ? publicClient.readContract({
                authorizationList: undefined,
                address: quoteToken,
                abi: tradeTokenAbi,
                functionName: "balanceOf",
                args: [account],
              })
            : Promise.resolve(null),
          account
            ? publicClient.readContract({
                authorizationList: undefined,
                address: token,
                abi: tradeTokenAbi,
                functionName: "balanceOf",
                args: [account],
              })
            : Promise.resolve(null),
        ]);

  return {
    isNativeQuote,
    quoteToken,
    quoteSymbol,
    quoteDecimals,
    quoteBalance,
    tokenBalance,
  };
};

export const tradePonsToken = async (
  provider: Eip1193Provider,
  account: Address,
  curve: Address,
  token: Address,
  side: PonsTradeSide,
  amountIn: bigint,
): Promise<PonsTradeResult> => {
  if (amountIn <= 0n) throw new Error("Enter an amount greater than zero.");

  const [isNativeQuote, quoteToken] = await Promise.all([
    publicClient.readContract({
      authorizationList: undefined,
      address: curve,
      abi: curveTradeAbi,
      functionName: "isNativeQuote",
    }),
    publicClient.readContract({
      authorizationList: undefined,
      address: curve,
      abi: curveTradeAbi,
      functionName: "pairToken",
    }),
  ]);
  const walletClient = createWalletClient({
    account,
    chain: robinhoodChain,
    transport: custom(provider),
  });
  const ensureAllowance = async (
    asset: Address,
    spender: Address,
    allowance: bigint,
  ) => {
    if (allowance >= amountIn) return;
    const approveAndWait = async (amount: bigint) => {
      const approvalHash = await walletClient.writeContract({
        chain: robinhoodChain,
        account,
        address: asset,
        abi: tradeTokenAbi,
        functionName: "approve",
        args: [spender, amount],
      });
      const approvalReceipt = await publicClient.waitForTransactionReceipt({
        hash: approvalHash,
      });
      if (approvalReceipt.status !== "success") {
        throw new Error("Token approval did not succeed.");
      }
    };
    if (allowance > 0n) await approveAndWait(0n);
    await approveAndWait(amountIn);
    const approvedAmount = await publicClient.readContract({
      authorizationList: undefined,
      address: asset,
      abi: tradeTokenAbi,
      functionName: "allowance",
      args: [account, spender],
    });
    if (approvedAmount < amountIn) {
      throw new Error("The token did not approve enough allowance for this trade.");
    }
  };

  if (side === "buy") {
    if (isNativeQuote) {
      const balance = await publicClient.getBalance({ address: account });
      if (balance < amountIn) {
        throw new Error("Not enough ETH for this buy; additional ETH is required for gas.");
      }
    } else {
      const [balance, allowance] = await Promise.all([
        publicClient.readContract({
          authorizationList: undefined,
          address: quoteToken,
          abi: tradeTokenAbi,
          functionName: "balanceOf",
          args: [account],
        }),
        publicClient.readContract({
          authorizationList: undefined,
          address: quoteToken,
          abi: tradeTokenAbi,
          functionName: "allowance",
          args: [account, curve],
        }),
      ]);
      if (balance < amountIn) {
        throw new Error("Your quote-token balance is too low for this buy.");
      }
      await ensureAllowance(quoteToken, curve, allowance);
    }

    const simulation = await publicClient.simulateContract({
      authorizationList: undefined,
      account,
      address: curve,
      abi: curveTradeAbi,
      functionName: "buy",
      args: [amountIn, 0n, account],
      ...(isNativeQuote ? { value: amountIn } : {}),
    });
    if (simulation.result <= 0n) {
      throw new Error("The curve quoted zero tokens for this buy.");
    }
    const minTokensOut = (simulation.result * 9900n) / 10000n;
    const hash = await walletClient.writeContract({
      chain: robinhoodChain,
      account,
      address: curve,
      abi: curveTradeAbi,
      functionName: "buy",
      args: [amountIn, minTokensOut, account],
      ...(isNativeQuote ? { value: amountIn } : {}),
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error("The buy transaction did not succeed.");
    }
    return { hash, amountOut: simulation.result };
  }

  const [tokenBalance, allowance] = await Promise.all([
    publicClient.readContract({
      authorizationList: undefined,
      address: token,
      abi: tradeTokenAbi,
      functionName: "balanceOf",
      args: [account],
    }),
    publicClient.readContract({
      authorizationList: undefined,
      address: token,
      abi: tradeTokenAbi,
      functionName: "allowance",
      args: [account, curve],
    }),
  ]);
  if (tokenBalance < amountIn) {
    throw new Error("Your token balance is too low for this sell.");
  }
  await ensureAllowance(token, curve, allowance);

  const simulation = await publicClient.simulateContract({
    authorizationList: undefined,
    account,
    address: curve,
    abi: curveTradeAbi,
    functionName: "sell",
    args: [amountIn, 0n, account],
  });
  if (simulation.result <= 0n) {
    throw new Error("The curve quoted zero quote tokens for this sell.");
  }
  const minQuoteOut = (simulation.result * 9900n) / 10000n;
  const hash = await walletClient.writeContract({
    chain: robinhoodChain,
    account,
    address: curve,
    abi: curveTradeAbi,
    functionName: "sell",
    args: [amountIn, minQuoteOut, account],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("The sell transaction did not succeed.");
  }
  return { hash, amountOut: simulation.result };
};

const formatEthAmount = (amount: bigint) => {
  const [integer, fraction] = formatEther(amount).split(".");
  const trimmedFraction = fraction?.replace(/0+$/, "");
  return trimmedFraction ? `${integer}.${trimmedFraction}` : integer;
};

const isInsufficientFundsError = (error: unknown) => {
  const visited = new Set<object>();
  let current = error;
  while (typeof current === "object" && current !== null && !visited.has(current)) {
    visited.add(current);
    if (
      "message" in current &&
      typeof current.message === "string" &&
      /insufficient funds|exceeds the balance|gas \* price \+ value/i.test(
        current.message,
      )
    ) {
      return true;
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
};

export const checkPonsLaunchBalance = async (
  account: Address,
  launchFee?: bigint,
) => {
  const fee =
    launchFee ??
    (await publicClient.readContract({
      authorizationList: undefined,
      address: PONS_FACTORY_ADDRESS,
      abi: ponsFactoryAbi,
      functionName: "launchFee",
    }));
  const balance = await publicClient.getBalance({ address: account });
  if (balance < fee) {
    throw new Error(
      `This wallet has ${formatEthAmount(balance)} ETH, below the PonsFamily launch fee of ${formatEthAmount(fee)} ETH. Add ETH to Robinhood Chain; extra ETH is also needed for gas.`,
    );
  }
};

export const loadPonsLaunchOptions = async () => {
  const [enabled, fee, count] = await Promise.all([
    publicClient.readContract({
      authorizationList: undefined,
      address: PONS_FACTORY_ADDRESS,
      abi: ponsFactoryAbi,
      functionName: "launchEnabled",
    }),
    publicClient.readContract({
      authorizationList: undefined,
      address: PONS_FACTORY_ADDRESS,
      abi: ponsFactoryAbi,
      functionName: "launchFee",
    }),
    publicClient.readContract({
      authorizationList: undefined,
      address: PONS_FACTORY_ADDRESS,
      abi: ponsFactoryAbi,
      functionName: "launchConfigCount",
    }),
  ]);

  if (!enabled) throw new Error("PonsFamily has temporarily paused launches.");
  if (count > 100n) {
    throw new Error("PonsFamily returned an invalid launch config count.");
  }

  const configs = await Promise.all(
    Array.from({ length: Number(count) }, async (_, id) => {
      const config = await publicClient.readContract({
        authorizationList: undefined,
        address: PONS_FACTORY_ADDRESS,
        abi: ponsFactoryAbi,
        functionName: "getLaunchConfig",
        args: [BigInt(id)],
      });
      return { id, ...config };
    }),
  );

  return {
    fee,
    configs: configs.filter((config) => config.enabled),
  };
};

export const loadCreatorFeeSettings = async (): Promise<CreatorFeeSettings> => {
  const response = await fetch("/api/launch-config", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "Creator fee settings API did not return JSON. Restart the CosmoPad API server.",
    );
  }
  const data = (await response.json()) as Partial<CreatorFeeSettings> & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? "Could not load creator fee settings.");
  }
  if (
    typeof data.creatorFeeRecipient !== "string" ||
    !/^0x[a-fA-F0-9]{40}$/.test(data.creatorFeeRecipient) ||
    data.creatorTaxBps !== 200
  ) {
    throw new Error("The server returned invalid creator fee settings.");
  }
  return {
    creatorFeeRecipient: getAddress(data.creatorFeeRecipient),
    creatorTaxBps: data.creatorTaxBps,
  };
};

interface Eip1193Provider {
  request: (args: {
    method: string;
    params?: readonly unknown[];
  }) => Promise<unknown>;
}

export const launchPonsToken = async (
  provider: Eip1193Provider,
  account: Address,
  draft: LaunchDraft,
): Promise<ConfirmedLaunch> => {
  const [chainId, launchesEnabled, config] = await Promise.all([
    provider.request({ method: "eth_chainId" }),
    publicClient.readContract({
      authorizationList: undefined,
      address: PONS_FACTORY_ADDRESS,
      abi: ponsFactoryAbi,
      functionName: "launchEnabled",
    }),
    publicClient.readContract({
      authorizationList: undefined,
      address: PONS_FACTORY_ADDRESS,
      abi: ponsFactoryAbi,
      functionName: "getLaunchConfig",
      args: [BigInt(draft.launchConfigId)],
    }),
  ]);

  if (typeof chainId !== "string" || Number.parseInt(chainId, 16) !== 4663) {
    throw new Error("Switch your wallet to Robinhood Chain before launching.");
  }
  if (!launchesEnabled) {
    throw new Error("PonsFamily has temporarily paused launches.");
  }
  if (!config.enabled) {
    throw new Error("That launch configuration is no longer available.");
  }

  const expectedEconomics = await publicClient.readContract({
    authorizationList: undefined,
    address: PONS_FACTORY_ADDRESS,
    abi: ponsFactoryAbi,
    functionName: "previewLaunchEconomics",
    args: [BigInt(draft.launchConfigId), PONS_NATIVE_PAIR_TOKEN],
  });
  const launchFee = await publicClient.readContract({
    authorizationList: undefined,
    address: PONS_FACTORY_ADDRESS,
    abi: ponsFactoryAbi,
    functionName: "launchFee",
  });
  await checkPonsLaunchBalance(account, launchFee);
  const creatorFeeSettings = await loadCreatorFeeSettings();
  const walletClient = createWalletClient({
    account,
    chain: robinhoodChain,
    transport: custom(provider),
  });
  const params = {
    name: draft.name.trim(),
    symbol: draft.symbol.trim(),
    logo: draft.logo,
    description: draft.description.trim(),
    socials: draft.socials,
    creatorFeeRecipient: creatorFeeSettings.creatorFeeRecipient,
    creatorTaxBps: creatorFeeSettings.creatorTaxBps,
    buybackEnabled: false,
    expectedEconomics,
    salt: bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(32))) as Hex,
  } as const;

  let transactionHash: Hex;
  try {
    const simulation = await publicClient.simulateContract({
      account,
      address: PONS_FACTORY_ADDRESS,
      abi: launchTokenAbi,
      functionName: "launchToken",
      args: [params, BigInt(draft.launchConfigId), PONS_NATIVE_PAIR_TOKEN],
      value: launchFee,
    });
    transactionHash = await walletClient.writeContract(simulation.request);
  } catch (cause) {
    if (isInsufficientFundsError(cause)) {
      throw new Error(
        "This wallet cannot cover the PonsFamily launch fee and Robinhood Chain gas. Add ETH to the connected wallet and try again.",
      );
    }
    throw cause;
  }
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
  });
  if (receipt.status !== "success") {
    throw new Error(`Token launch transaction reverted: ${transactionHash}`);
  }

  const launchEvents = parseEventLogs({
    abi: ponsFactoryAbi,
    logs: receipt.logs.filter(
      (log) => log.address.toLowerCase() === PONS_FACTORY_ADDRESS,
    ),
    eventName: "TokenLaunched",
    strict: false,
  });
  const event = launchEvents[0];
  if (!event || event.args.deployer.toLowerCase() !== account.toLowerCase()) {
    throw new Error(
      `Launch confirmed, but its token address could not be read. Transaction: ${transactionHash}`,
    );
  }

  return { token: event.args.token, transactionHash };
};
