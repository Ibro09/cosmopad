export interface LaunchSocials {
  twitter: string;
  telegram: string;
  discord: string;
  website: string;
  farcaster: string;
}

export interface LaunchDraft {
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: LaunchSocials;
  launchConfigId: number;
}

export interface ConfirmedLaunch {
  token: `0x${string}`;
  transactionHash: `0x${string}`;
}

export interface StoredLaunch {
  token: `0x${string}`;
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: LaunchSocials;
  owner: `0x${string}`;
  transactionHash: `0x${string}`;
  launchConfigId: number;
  launchedAt: string;
}

export interface PonsTokenDetails {
  token: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  curve: `0x${string}`;
  deployer: `0x${string}`;
  creatorFeeRecipient: `0x${string}`;
  pairToken: `0x${string}`;
  graduationThreshold: bigint;
  curveQuoteReserve: bigint;
  phase: number;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  launchedAt: string | null;
  transactionHash: `0x${string}` | null;
  description: string;
  logo: string;
  socials: LaunchSocials | null;
  metadataNotice: string | null;
}

export interface PonsTokenLiveState {
  phase: number;
  curveQuoteReserve: bigint;
  graduationThreshold: bigint;
  priceNative?: number;
  marketCapNative?: number;
  liquidityNative?: number;
  quoteSymbol?: string;
  quoteDecimals?: number;
}
