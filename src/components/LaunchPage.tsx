import React, { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ImagePlus,
  Info,
  Orbit,
  PartyPopper,
  Upload,
  X,
} from "lucide-react";
import { formatEther, formatUnits, type Address } from "viem";
import type {
  ConfirmedLaunch,
  LaunchDraft,
} from "./launchTypes";
import {
  checkPonsLaunchBalance,
  loadCreatorFeeSettings,
  loadPonsLaunchOptions,
  type OpenLaunchConfig,
} from "../services/ponsLaunch";

interface LaunchPageProps {
  onBack: () => void;
  walletAddress: Address | null;
  onConnect: () => Promise<void>;
  onLaunchToken: (draft: LaunchDraft) => Promise<ConfirmedLaunch>;
  onViewToken: (token: Address) => void;
}

const inputClassName =
  "mt-2 w-full border border-white/10 bg-white/[0.035] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-300/55 focus:bg-emerald-300/[0.025]";

const fieldLabelClassName =
  "block text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export const LaunchPage: React.FC<LaunchPageProps> = ({
  onBack,
  walletAddress,
  onConnect,
  onLaunchToken,
  onViewToken,
}) => {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [xProfile, setXProfile] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [tokenImage, setTokenImage] = useState<File | null>(null);
  const [launchAttempted, setLaunchAttempted] = useState(false);
  const [configs, setConfigs] = useState<OpenLaunchConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [launchFeeWei, setLaunchFeeWei] = useState<bigint | null>(null);
  const [creatorFeeRecipient, setCreatorFeeRecipient] = useState<Address | null>(
    null,
  );
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [confirmedLaunch, setConfirmedLaunch] =
    useState<ConfirmedLaunch | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();

  useEffect(() => {
    let active = true;
    void Promise.all([loadPonsLaunchOptions(), loadCreatorFeeSettings()])
      .then(([{ configs: openConfigs, fee }, creatorFeeSettings]) => {
        if (!active) return;
        setConfigs(openConfigs);
        setSelectedConfigId(openConfigs[0]?.id ?? null);
        setLaunchFeeWei(fee);
        setCreatorFeeRecipient(creatorFeeSettings.creatorFeeRecipient);
      })
      .catch((cause: unknown) => {
        if (active) {
          setConfigError(
            cause instanceof Error
              ? cause.message
              : "Could not load PonsFamily launch configurations.",
          );
        }
      })
      .finally(() => {
        if (active) setConfigLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!tokenImage) {
      setImagePreview(undefined);
      return;
    }
    const previewUrl = URL.createObjectURL(tokenImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [tokenImage]);

  const isValid =
    name.trim().length > 0 &&
    ticker.trim().length > 0 &&
    ticker.trim().length <= 10 &&
    selectedConfigId !== null;

  const saveConfirmedLaunch = async (launch: ConfirmedLaunch) => {
    const response = await fetch("/api/user-launches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: walletAddress,
        transactionHash: launch.transactionHash,
      }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(data?.error ?? "Could not save the confirmed launch.");
    }
    setSaveError(null);
  };

  const submitDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLaunchAttempted(true);
    setLaunchError(null);
    setSaveError(null);
    if (!walletAddress) {
      setLaunchError("Connect your wallet before launching a token.");
      return;
    }
    if (!isValid || selectedConfigId === null) return;

    setLaunching(true);
    try {
      await checkPonsLaunchBalance(walletAddress, launchFeeWei ?? undefined);

      const readiness = await fetch("/api/launch-ready", {
        headers: { Accept: "application/json" },
      });
      if (!readiness.ok) {
        const data = (await readiness.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Launch storage is unavailable.");
      }

      let logo = "";
      if (tokenImage) {
        const upload = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": tokenImage.type },
          body: tokenImage,
        });
        if (!upload.ok) {
          const data = (await upload.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "Could not upload the token image.");
        }
        const uploaded = (await upload.json()) as { url: string };
        const publicLogoUrl = new URL(uploaded.url);
        if (
          !["http:", "https:"].includes(publicLogoUrl.protocol) ||
          ["localhost", "127.0.0.1", "::1"].includes(publicLogoUrl.hostname)
        ) {
          throw new Error(
            "The token image URL must be publicly accessible to PonsFamily.",
          );
        }
        logo = publicLogoUrl.toString();
      }

      const launch = await onLaunchToken({
        name: name.trim(),
        symbol: ticker.trim(),
        logo,
        description: description.trim(),
        socials: {
          twitter: xProfile.trim(),
          telegram: telegram.trim(),
          discord: "",
          website: website.trim(),
          farcaster: "",
        },
        launchConfigId: selectedConfigId,
      });
      setConfirmedLaunch(launch);
      setShowCelebration(true);
      try {
        await saveConfirmedLaunch(launch);
      } catch (cause) {
        setSaveError(
          cause instanceof Error
            ? cause.message
            : "Token launched, but it could not be saved to your profile yet.",
        );
      }
    } catch (cause) {
      setLaunchError(
        cause instanceof Error ? cause.message : "Token launch failed.",
      );
    } finally {
      setLaunching(false);
    }
  };

  const retrySaveLaunch = async () => {
    if (!confirmedLaunch) return;
    setLaunching(true);
    try {
      await saveConfirmedLaunch(confirmedLaunch);
    } catch (cause) {
      setSaveError(
        cause instanceof Error
          ? cause.message
          : "Could not save the confirmed launch.",
      );
    } finally {
      setLaunching(false);
    }
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setLaunchError("Use a PNG, JPG, or WEBP token image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setLaunchError("Token images must be 2 MB or smaller.");
      return;
    }
    setLaunchError(null);
    setTokenImage(file);
  };

  return (
    <main className="min-h-screen bg-[#030504] px-4 pb-12 pt-24 text-white sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-[1140px]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.7)]" />
            COSMOPAD LAUNCHPAD
          </span>
        </div>

        <div className="grid overflow-hidden border border-white/10 bg-[#080a09] shadow-[0_25px_100px_rgba(0,0,0,0.45)] lg:grid-cols-[1.12fr_0.88fr]">
          <form onSubmit={(event) => void submitDraft(event)} className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8">
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-emerald-300/75">
                CREATE A NEW WORLD
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Launch token
              </h1>
              <p className="mt-2 max-w-lg text-xs leading-relaxed text-neutral-500">
                Create your token directly on the PonsFamily launchpad from
                Robinhood Chain.
              </p>
            </div>

            <div className="mb-5 border border-white/[0.08] bg-black/30 p-4">
              {configLoading ? (
                <p className="mt-2 text-xs text-neutral-500">
                  Loading live PonsFamily launch options…
                </p>
              ) : configError ? (
                <p role="alert" className="mt-2 text-xs text-amber-200">
                  {configError}
                </p>
              ) : configs.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500">
                  No launch configurations are currently enabled.
                </p>
              ) : (
                <>
                  <p className={fieldLabelClassName}>Token supply</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {formatUnits(configs[0].supply, 18)}
                  </p>
                  {launchFeeWei !== null && (
                    <p className="mt-2 text-[10px] text-neutral-500">
                      Pairing: ETH · PonsFamily launch fee:{" "}
                      <span className="text-neutral-300">
                        {formatEther(launchFeeWei)} ETH
                      </span>
                      <span className="text-neutral-600">
                        {" "}plus Robinhood Chain gas
                      </span>
                    </p>
                  )}
                  {creatorFeeRecipient && (
                    <p className="mt-2 text-[10px] text-neutral-500">
                      Creator fee:{" "}
                      <span className="text-neutral-300">2%</span>
                      {" · "}
                     
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={fieldLabelClassName}>
                Name <span className="text-emerald-300">*</span>
                <input
                  required
                  maxLength={40}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Token name"
                  className={inputClassName}
                />
              </label>
              <label className={fieldLabelClassName}>
                Ticker <span className="text-emerald-300">*</span>
                <input
                  required
                  maxLength={10}
                  value={ticker}
                  onChange={(event) =>
                    setTicker(event.target.value.toUpperCase().replace(/\s/g, ""))
                  }
                  placeholder="SYMBOL"
                  className={`${inputClassName} uppercase`}
                />
              </label>
            </div>

            <label className={`${fieldLabelClassName} mt-5`}>
              Description
              <textarea
                maxLength={280}
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell the cosmos what your token is about"
                className={`${inputClassName} resize-y`}
              />
              <span className="mt-1 block text-right text-[9px] font-normal tracking-normal text-neutral-600">
                {description.length}/280
              </span>
            </label>

            <div className="mt-4">
              <span className={fieldLabelClassName}>Token image</span>
              <label className="mt-2 flex min-h-[72px] cursor-pointer items-center gap-4 border border-dashed border-white/15 bg-white/[0.02] px-3 transition-colors hover:border-emerald-300/35 hover:bg-emerald-300/[0.025]">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden border border-white/10 bg-black text-neutral-500">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Token image preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-neutral-200">
                    {tokenImage?.name ?? "Choose an image"}
                  </span>
                  <span className="mt-1 block text-[10px] text-neutral-600">
                    PNG, JPG, or WEBP
                  </span>
                </span>
                <Upload className="mr-2 h-4 w-4 text-neutral-500" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => handleImage(event.target.files?.[0])}
                />
              </label>
              <p className="mt-2 text-[9px] leading-relaxed text-neutral-600">
                Token images are uploaded publicly so PonsFamily can display
                them.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={fieldLabelClassName}>
                X profile
                <input
                  value={xProfile}
                  onChange={(event) => setXProfile(event.target.value)}
                  placeholder="x.com/handle"
                  className={inputClassName}
                />
              </label>
              <label className={fieldLabelClassName}>
                Telegram
                <input
                  value={telegram}
                  onChange={(event) => setTelegram(event.target.value)}
                  placeholder="t.me/community"
                  className={inputClassName}
                />
              </label>
              <label className={fieldLabelClassName}>
                Website
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://yourworld.xyz"
                  className={inputClassName}
                />
              </label>
            </div>

            {launchAttempted && !isValid && (
              <p role="alert" className="mt-4 text-xs text-amber-200">
                Add a token name and a ticker of up to 10 characters. An enabled supply configuration is also required.
              </p>
            )}
            {launchError && (
              <p role="alert" className="mt-4 text-xs text-amber-200">
                {launchError}
              </p>
            )}
            {saveError && confirmedLaunch && (
              <div role="alert" className="mt-4 border border-amber-300/20 bg-amber-300/[0.04] p-3">
                <p className="text-xs text-amber-100">
                  Token launched successfully, but it has not been saved to
                  Explore or your Profile yet. {saveError}
                </p>
                <button
                  type="button"
                  disabled={launching}
                  onClick={() => void retrySaveLaunch()}
                  className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-200 disabled:opacity-50"
                >
                  Retry saving launch
                </button>
              </div>
            )}
            {confirmedLaunch && !saveError && (
              <div className="mt-4 border border-emerald-300/20 bg-emerald-300/[0.04] p-3">
                <p className="text-xs font-semibold text-emerald-200">
                  Token launched and saved to Explore and your Profile.
                </p>
                <button
                  type="button"
                  onClick={() => onViewToken(confirmedLaunch.token)}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-200 hover:text-white"
                >
                  View token page <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2.5 border border-emerald-300/10 bg-emerald-300/[0.025] p-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/70" />
              <p className="text-[10px] leading-relaxed text-neutral-500">
                Your wallet signs the PonsFamily launch transaction on
                Robinhood Chain. CosmoPad never receives or stores your keys.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[10px] text-neutral-600">
              </span>
              {walletAddress ? (
                <button
                  type="submit"
                  disabled={launching || configLoading || configs.length === 0}
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-emerald-300/70 bg-emerald-300 px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:border-emerald-200 hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-50"
                >
                  {launching ? "Launching…" : "Launch token"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void onConnect()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-emerald-300/70 bg-emerald-300 px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:border-emerald-200 hover:bg-emerald-200"
                >
                  Connect wallet
                </button>
              )}
            </div>
          </form>

          <aside className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden border-t border-white/[0.08] bg-[#0a0d0b] px-5 py-12 lg:border-l lg:border-t-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(16,185,129,0.09),transparent_54%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(1px_1px_at_19%_21%,rgba(255,255,255,0.7)_50%,transparent),radial-gradient(1px_1px_at_78%_29%,rgba(167,243,208,0.8)_50%,transparent),radial-gradient(1px_1px_at_71%_81%,rgba(255,255,255,0.5)_50%,transparent),radial-gradient(1px_1px_at_27%_73%,rgba(255,255,255,0.45)_50%,transparent)]" />
            <div className="relative z-10 mb-5 flex w-full max-w-[350px] items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                TOKEN PREVIEW
              </span>
              <span className="inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
                <Orbit className="h-3 w-3" />
                COSMOPAD
              </span>
            </div>

            <div className="relative z-10 w-full max-w-[350px] overflow-hidden border border-white/[0.12] bg-[#0b0e0c] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-white/[0.08] bg-[radial-gradient(ellipse_at_50%_80%,rgba(16,185,129,0.14),transparent_66%),#070908]">
                <span className="absolute h-32 w-56 rotate-[-18deg] rounded-[50%] border border-emerald-100/15" />
                <span className="absolute h-24 w-44 rotate-[25deg] rounded-[50%] border border-white/[0.08]" />
                <span className="absolute h-24 w-24 rounded-full bg-emerald-400/[0.12] blur-2xl" />
                <span className="relative grid h-[76px] w-[76px] place-items-center overflow-hidden rounded-full border border-emerald-100/30 bg-[#0b1710] text-2xl font-bold text-white shadow-[inset_-10px_-9px_20px_rgba(0,0,0,0.75),0_0_34px_rgba(52,211,153,0.15)]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-emerald-200/80">
                      {ticker.trim().slice(0, 1) || <ImagePlus className="h-6 w-6" />}
                    </span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/45" />
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-white">
                      {name.trim() || "Your token"}
                    </h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300/80">
                      {ticker.trim() ? `$${ticker}` : "TICKER"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 border border-emerald-300/15 bg-emerald-300/[0.04] px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-emerald-200/80">
                    <Check className="h-3 w-3" />
                    Preview
                  </span>
                </div>

                <p className="mt-4 min-h-10 text-xs leading-relaxed text-neutral-400">
                  {description.trim() || "Your token description will appear here."}
                </p>

                <dl className="mt-5 divide-y divide-white/[0.07] border-t border-white/[0.08]">
                  <PreviewRow label="Paired with" value="ETH" />
                  <PreviewRow label="X profile" value={xProfile || "Not added"} />
                  <PreviewRow label="Telegram" value={telegram || "Not added"} />
                  {website && <PreviewRow label="Website" value={website} />}
                  <PreviewRow label="Launch terms" value="Confirmed on PonsFamily" />
                </dl>
              </div>
            </div>

            <p className="relative z-10 mt-5 max-w-[350px] text-center text-[9px] leading-relaxed text-neutral-600">
              A visual preview only. Final token details and launch terms are
              confirmed with the launch provider.
            </p>
          </aside>
        </div>
      </div>
      {showCelebration && confirmedLaunch && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="launch-success-title"
        >
          <div className="launch-celebration relative w-full max-w-md overflow-hidden border border-emerald-300/20 bg-[#080b09] px-6 py-9 text-center shadow-[0_25px_100px_rgba(0,0,0,0.7)] sm:px-10">
            <div className="launch-confetti pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 26 }, (_, index) => (
                <span
                  key={index}
                  className="launch-confetti-piece"
                  style={{
                    left: `${(index * 37 + 9) % 100}%`,
                    animationDelay: `${(index % 9) * -0.17}s`,
                    animationDuration: `${1.2 + (index % 5) * 0.2}s`,
                    backgroundColor: ["#6ee7b7", "#d1fae5", "#ffffff", "#34d399"][
                      index % 4
                    ],
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Close launch success"
              onClick={() => setShowCelebration(false)}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center text-neutral-500 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200 shadow-[0_0_32px_rgba(52,211,153,0.12)]">
              <PartyPopper className="h-6 w-6" />
            </span>
            <p className="relative mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300/75">
              WORLD CREATED
            </p>
            <h2
              id="launch-success-title"
              className="relative mt-2 text-2xl font-semibold tracking-tight text-white"
            >
              Your token is live.
            </h2>
            <p className="relative mt-2 break-all font-mono text-[10px] text-neutral-500">
              {confirmedLaunch.token}
            </p>
            <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onViewToken(confirmedLaunch.token)}
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-emerald-300/60 bg-emerald-300 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-emerald-200"
              >
                View token details <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <a
                href={`https://explorer.mainnet.chain.robinhood.com/tx/${confirmedLaunch.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/15 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-300 transition-colors hover:border-white/30 hover:text-white"
              >
                View transaction <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            {saveError && (
              <p className="relative mt-4 text-[10px] text-amber-200">
                The launch is confirmed on-chain; saved metadata is still
                retrying.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

const PreviewRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-4 py-2.5">
    <dt className="shrink-0 text-[10px] text-neutral-500">{label}</dt>
    <dd className="max-w-[65%] truncate text-right text-[10px] font-medium text-neutral-200">
      {value}
    </dd>
  </div>
);
