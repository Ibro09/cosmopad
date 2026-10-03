import { useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import {
  launchPonsToken,
  tradePonsToken,
  type PonsTradeResult,
  type PonsTradeSide,
} from "../services/ponsLaunch";
import type {
  ConfirmedLaunch,
  LaunchDraft,
} from "./launchTypes";

interface Eip1193Provider {
  request: (args: {
    method: string;
    params?: readonly unknown[];
  }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (...args: unknown[]) => void,
  ) => void;
}

export interface DiscoveredWallet {
  id: string;
  name: string;
  icon?: string;
  provider: Eip1193Provider;
}

interface Eip6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface Eip6963AnnounceEvent extends Event {
  detail: {
    info: Eip6963ProviderInfo;
    provider: Eip1193Provider;
  };
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    dispatchEvent: (event: Event) => boolean;
  }
}

const getAccounts = (value: unknown) =>
  Array.isArray(value)
    ? value.filter(
        (account): account is Address =>
          typeof account === "string" && /^0x[a-fA-F0-9]{40}$/.test(account),
      )
    : [];

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    if (error.code === 4001) return "Wallet connection was cancelled.";
    if (error.code === -32002) {
      return "A wallet connection request is already pending.";
    }
  }
  return error instanceof Error ? error.message : "Could not connect wallet.";
};

export interface WalletState {
  address: Address | null;
  chainId: string | null;
  connecting: boolean;
  ready: boolean;
  error: string | null;
  wallets: DiscoveredWallet[];
  pendingAccounts: string[];
  connect: () => Promise<void>;
  selectAccount: (account: Address) => Promise<void>;
  launchToken: (draft: LaunchDraft) => Promise<ConfirmedLaunch>;
  tradeToken: (
    curve: Address,
    token: Address,
    side: PonsTradeSide,
    amountIn: bigint,
  ) => Promise<PonsTradeResult>;
  disconnect: () => Promise<void>;
}

const ROBINHOOD_CHAIN_ID = "0x1237";
const isRobinhoodMainnet = (chainId: unknown) =>
  typeof chainId === "string" &&
  Number.parseInt(chainId, 16) === 4663;

const ROBINHOOD_CHAIN = {
  chainId: ROBINHOOD_CHAIN_ID,
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://explorer.mainnet.chain.robinhood.com"],
};

const SAVED_WALLET_ID = "cosmopad.walletId";
const SAVED_WALLET_ACCOUNT = "cosmopad.walletAccount";

export const useWallet = (): WalletState => {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAccounts, setPendingAccounts] = useState<Address[]>([]);
  const selectedProvider = useRef<Eip1193Provider | null>(null);
  const selectedWalletId = useRef<string | null>(null);
  const walletsRef = useRef<DiscoveredWallet[]>([]);

  useEffect(() => {
    let active = true;
    let restoreTimer: number | undefined;
    const found = new Map<string, DiscoveredWallet>();
    const publishWallets = () => {
      if (active) {
        const discovered = Array.from(found.values());
        walletsRef.current = discovered;
        setWallets(discovered);
      }
    };
    const scheduleWalletRestore = () => {
      window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(async () => {
        if (!active || selectedProvider.current) return;

        const providers = Array.from(found.entries()).filter(
          ([, wallet], index, entries) =>
            entries.findIndex(
              ([, candidate]) => candidate.provider === wallet.provider,
            ) === index,
        );
        const savedWalletId = window.localStorage.getItem(SAVED_WALLET_ID);
        const savedAccount = window.localStorage.getItem(SAVED_WALLET_ACCOUNT);
        const results = await Promise.all(
          providers.map(async ([id, wallet]) => ({
            id,
            wallet,
            accounts: getAccounts(
              await wallet.provider
                .request({ method: "eth_accounts" })
                .catch(() => []),
            ),
          })),
        );

        if (!active || selectedProvider.current) return;
        const accountMatches = savedAccount
          ? results.filter(({ accounts }) =>
              accounts.some(
                (account) =>
                  account.toLowerCase() === savedAccount.toLowerCase(),
              ),
            )
          : [];
        const rememberedProvider = savedWalletId
          ? found.get(savedWalletId)?.provider
          : undefined;
        const savedProvider = results.find(
          ({ wallet }) => wallet.provider === rememberedProvider,
        );
        const selected =
          savedProvider && savedProvider.accounts.length > 0
            ? savedProvider
            : accountMatches.length === 1
              ? accountMatches[0]
              : !savedWalletId && !savedAccount
                ? results.filter(({ accounts }) => accounts.length === 1)
                    .length === 1
                  ? results.find(({ accounts }) => accounts.length === 1)
                  : undefined
                : undefined;
        if (!selected) return;

        const selectedId =
          selected === savedProvider && savedWalletId
            ? savedWalletId
            : selected.id;
        const account =
          selected.accounts.find(
            (candidate) =>
              candidate.toLowerCase() === savedAccount?.toLowerCase(),
          ) ?? (selected.accounts.length === 1 ? selected.accounts[0] : null);
        selectedProvider.current = selected.wallet.provider;
        selectedWalletId.current = selectedId;
        window.localStorage.setItem(SAVED_WALLET_ID, selectedId);
        if (account) {
          setAddress(account);
          window.localStorage.setItem(SAVED_WALLET_ACCOUNT, account);
          setPendingAccounts([]);
        } else if (savedProvider === selected) {
          setPendingAccounts(selected.accounts);
        }
      }, 250);
    };
    const register = (
      wallet: DiscoveredWallet,
      setAsLegacyDefault = false,
    ) => {
      const existing = found.get(wallet.id);
      if (existing) return;
      const sameProvider = Array.from(found.entries()).find(
        ([, discovered]) => discovered.provider === wallet.provider,
      );
      if (sameProvider) {
        const [existingId, discovered] = sameProvider;
        if (
          discovered.name === "Browser wallet" &&
          wallet.name !== discovered.name
        ) {
          found.set(existingId, {
            ...discovered,
            name: wallet.name,
            icon: wallet.icon,
          });
          publishWallets();
        }
        if (window.localStorage.getItem(SAVED_WALLET_ID) === wallet.id) {
          found.set(wallet.id, discovered);
        } else if (
          window.localStorage.getItem(SAVED_WALLET_ID) === existingId
        ) {
          found.set(existingId, discovered);
        }
        scheduleWalletRestore();
        return;
      }
      found.set(wallet.id, wallet);
      if (setAsLegacyDefault) found.set("injected", wallet);
      publishWallets();

      const provider = wallet.provider;
      if (provider.on) {
        provider.on("accountsChanged", (...args: unknown[]) => {
          if (selectedProvider.current !== provider) return;
          const accounts = getAccounts(args[0]);
          const savedAccount = window.localStorage.getItem(
            SAVED_WALLET_ACCOUNT,
          );
          const nextAccount =
            accounts.find(
              (account) =>
                account.toLowerCase() === savedAccount?.toLowerCase(),
            ) ?? accounts[0];
          setAddress(nextAccount ?? null);
          if (nextAccount) {
            window.localStorage.setItem(SAVED_WALLET_ACCOUNT, nextAccount);
          } else {
            window.localStorage.removeItem(SAVED_WALLET_ACCOUNT);
            window.localStorage.removeItem(SAVED_WALLET_ID);
            selectedWalletId.current = null;
          }
          if (accounts.length === 0) {
            selectedProvider.current = null;
          }
          setError(null);
        });
        provider.on("chainChanged", (...args: unknown[]) => {
          if (selectedProvider.current === provider) {
            const nextChainId = typeof args[0] === "string" ? args[0] : null;
            setChainId(nextChainId);
            setError(
              nextChainId && !isRobinhoodMainnet(nextChainId)
                ? "Switch your wallet to Robinhood Chain mainnet to use CosmoPad."
                : null,
            );
          }
        });
      }

      scheduleWalletRestore();

      void provider
        .request({ method: "eth_chainId" })
        .then((chain) => {
          if (
            active &&
            selectedProvider.current === provider &&
            typeof chain === "string"
          ) {
            setChainId(chain);
          }
        })
        .catch(() => {
          // Wallet discovery should not surface errors before the user connects.
        })
        .finally(() => {
          if (active) setReady(true);
        });
    };
    const handleAnnouncement = (event: Event) => {
      const { info, provider } = (event as Eip6963AnnounceEvent).detail;
      if (!info?.uuid || !info.name || !provider) return;
      register({
        id: info.uuid,
        name: info.name,
        icon: info.icon,
        provider,
      });
    };
    window.addEventListener("eip6963:announceProvider", handleAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const injected = window.ethereum;
    if (injected) {
      const injectedProviders = (
        injected as Eip1193Provider & { providers?: Eip1193Provider[] }
      ).providers;
      const candidates = injectedProviders?.length
        ? injectedProviders
        : [injected];
      candidates.forEach((provider, index) => {
        register(
          {
            id: index === 0 ? "injected" : `injected-${index}`,
            name: "Browser wallet",
            provider,
          },
          index === 0,
        );
      });
    }
    const readyTimer = window.setTimeout(() => {
      if (active) setReady(true);
    }, 600);

    return () => {
      active = false;
      window.clearTimeout(readyTimer);
      window.clearTimeout(restoreTimer);
      window.removeEventListener(
        "eip6963:announceProvider",
        handleAnnouncement,
      );
    };
  }, []);

  const requestRobinhoodNetwork = useCallback(
    async (provider: Eip1193Provider) => {
      const currentChainId = await provider.request({ method: "eth_chainId" });
      if (!isRobinhoodMainnet(currentChainId)) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ROBINHOOD_CHAIN_ID }],
          });
        } catch (cause) {
          const errorCode =
            typeof cause === "object" && cause !== null && "code" in cause
              ? cause.code
              : undefined;
          if (errorCode !== 4902) throw cause;
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [ROBINHOOD_CHAIN],
          });
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ROBINHOOD_CHAIN_ID }],
          });
        }
      }

      const confirmedChainId = await provider.request({
        method: "eth_chainId",
      });
      if (!isRobinhoodMainnet(confirmedChainId)) {
        throw new Error(
          "Your wallet must be connected to Robinhood Chain mainnet to use CosmoPad.",
        );
      }
    },
    [],
  );

  const connect = useCallback(async () => {
    const candidates = walletsRef.current;
    const selectedWallet =
      candidates.find((wallet) => wallet.id === selectedWalletId.current) ??
      candidates.find(
        (wallet) => wallet.id === window.localStorage.getItem(SAVED_WALLET_ID),
      ) ??
      candidates.find((wallet) =>
        /metamask/i.test(`${wallet.name} ${wallet.id}`),
      ) ?? candidates[0];
    const provider = selectedWallet?.provider ?? window.ethereum;
    if (!provider) {
      setError(
        "No compatible wallet was found. Install a browser wallet and try again.",
      );
      return;
    }

    setConnecting(true);
    setError(null);
    setPendingAccounts([]);
    try {
      let accounts: Address[] = [];
      try {
        await provider.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        accounts = getAccounts(
          await provider.request({ method: "eth_accounts" }),
        );
      } catch (cause) {
        const errorCode =
          typeof cause === "object" && cause !== null && "code" in cause
            ? cause.code
            : undefined;
        if (errorCode === 4001) throw cause;
        if (errorCode !== 4200 && errorCode !== -32601) throw cause;
      }

      if (accounts.length === 0) {
        accounts = getAccounts(
          await provider.request({ method: "eth_requestAccounts" }),
        );
      }
      if (accounts.length === 0) {
        throw new Error("The wallet did not return an account.");
      }

      selectedProvider.current = provider;
      selectedWalletId.current = selectedWallet?.id ?? "injected";
      window.localStorage.setItem(
        SAVED_WALLET_ID,
        selectedWalletId.current,
      );
      if (accounts.length > 1) {
        setPendingAccounts(accounts);
        return;
      }

      await requestRobinhoodNetwork(provider);
      setAddress(accounts[0]);
      window.localStorage.setItem(SAVED_WALLET_ACCOUNT, accounts[0]);
      setChainId(ROBINHOOD_CHAIN_ID);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setConnecting(false);
    }
  }, [requestRobinhoodNetwork]);

  const selectAccount = useCallback(
    async (account: Address) => {
      if (!pendingAccounts.includes(account)) {
        setError("Select an account returned by your wallet.");
        return;
      }
      const provider = selectedProvider.current;
      if (!provider) {
        setError("Reconnect your wallet to choose an account.");
        setPendingAccounts([]);
        return;
      }

      setConnecting(true);
      setError(null);
      try {
        await requestRobinhoodNetwork(provider);
        setAddress(account);
        window.localStorage.setItem(SAVED_WALLET_ACCOUNT, account);
        setChainId(ROBINHOOD_CHAIN_ID);
        setPendingAccounts([]);
      } catch (cause) {
        setError(getErrorMessage(cause));
      } finally {
        setConnecting(false);
      }
    },
    [pendingAccounts, requestRobinhoodNetwork],
  );

  const launchToken = useCallback(
    async (draft: LaunchDraft) => {
      const provider = selectedProvider.current;
      if (!provider || !address) {
        throw new Error("Connect your wallet before launching a token.");
      }
      await requestRobinhoodNetwork(provider);
      setChainId(ROBINHOOD_CHAIN_ID);
      setError(null);
      return launchPonsToken(provider, address, draft);
    },
    [address, requestRobinhoodNetwork],
  );

  const tradeToken = useCallback(
    async (
      curve: Address,
      token: Address,
      side: PonsTradeSide,
      amountIn: bigint,
    ) => {
      const provider = selectedProvider.current;
      if (!provider || !address) {
        throw new Error("Connect your wallet before trading.");
      }
      await requestRobinhoodNetwork(provider);
      setChainId(ROBINHOOD_CHAIN_ID);
      setError(null);
      return tradePonsToken(provider, address, curve, token, side, amountIn);
    },
    [address, requestRobinhoodNetwork],
  );

  const disconnect = useCallback(async () => {
    const provider = selectedProvider.current;
    selectedProvider.current = null;
    selectedWalletId.current = null;
    setAddress(null);
    setChainId(null);
    setError(null);
    setPendingAccounts([]);
    window.localStorage.removeItem(SAVED_WALLET_ID);
    window.localStorage.removeItem(SAVED_WALLET_ACCOUNT);

    if (!provider) return;

    try {
      await provider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (cause) {
      const errorCode =
        typeof cause === "object" && cause !== null && "code" in cause
          ? cause.code
          : undefined;
      if (errorCode === 4200 || errorCode === -32601) {
        setError(
          "Disconnected from CosmoPad. To revoke site access completely, remove CosmoPad in your wallet settings.",
        );
      } else {
        setError(getErrorMessage(cause));
      }
    }
  }, []);

  return {
    address,
    chainId,
    connecting,
    ready,
    error,
    wallets,
    connect,
    pendingAccounts,
    selectAccount,
    launchToken,
    tradeToken,
    disconnect,
  };
};
