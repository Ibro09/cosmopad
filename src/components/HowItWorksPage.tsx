import React from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CircleDot,
  Compass,
  Orbit,
  Rocket,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";

interface HowItWorksPageProps {
  onExplore: () => void;
  onLaunch: () => void;
}

const sections = [
  { id: "overview", label: "Overview" },
  { id: "token-journey", label: "A token's journey" },
  { id: "launch-world", label: "Launch a world" },
  { id: "explore-trade", label: "Explore & trade" },
  { id: "live-data", label: "The living cosmos" },
  { id: "risks", label: "Understand the risks" },
];

const stages = [
  {
    name: "Dust",
    note: "A new token enters the cosmos. This is the beginning of its on-chain story.",
    icon: Sparkles,
  },
  {
    name: "Planet",
    note: "As a community gathers and activity develops, the world begins to take shape.",
    icon: CircleDot,
  },
  {
    name: "Orbit",
    note: "A token that reaches its launch program's graduation milestone moves into orbit.",
    icon: Orbit,
  },
  {
    name: "Star",
    note: "A thriving world can become a bright point in the wider CosmoPad universe.",
    icon: Activity,
  },
];

const steps = [
  {
    title: "Connect your wallet",
    description:
      "Connect a compatible EVM wallet and use Robinhood Chain mainnet. Your wallet stays in your control and must approve each transaction.",
    icon: Wallet,
  },
  {
    title: "Give your world an identity",
    description:
      "Choose a token name and ticker, add a description and image, and include any social links you want your community to find.",
    icon: Sparkles,
  },
  {
    title: "Review and launch",
    description:
      "Check the launch details and the transaction in your wallet before approving. Once confirmed on-chain, open the token page to follow its details.",
    icon: Rocket,
  },
];

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onExplore,
  onLaunch,
}) => (
  <div className="relative min-h-screen overflow-hidden bg-black pb-20 pt-28 text-white sm:pt-32">
    <div className="pointer-events-none absolute left-1/2 top-32 h-80 w-[min(90vw,900px)] -translate-x-1/2 rounded-full bg-emerald-400/[0.045] blur-[120px]" />
    <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent" />

    <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <div className="grid gap-12 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-20">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="border border-white/[0.08] bg-white/[0.02] p-5">
            <span className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
              <BookMarkIcon />
              COSMOPAD GUIDE
            </span>
            <nav aria-label="How it works sections" className="mt-5 grid gap-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-center gap-3 border-l border-white/10 px-3 py-2.5 text-xs text-neutral-400 transition-colors hover:border-emerald-300/70 hover:text-white"
                >
                  <span className="font-mono text-[9px] text-neutral-700 group-hover:text-emerald-300/70">
                    0{index + 1}
                  </span>
                  {section.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 border-t border-white/[0.08] pt-4">
              <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-600">
                NETWORK
              </span>
              <p className="mt-1 text-xs text-neutral-300">
                Robinhood Chain · Mainnet
              </p>
            </div>
          </div>
        </aside>

        <article className="min-w-0">
          <header id="overview" className="scroll-mt-28 border-b border-white/10 pb-10 sm:pb-14">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.23em] text-emerald-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />
              THE COSMOPAD FIELD GUIDE
            </div>
            <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-[0.98] tracking-tight sm:text-5xl md:text-6xl">
              How it works
              <span className="mt-3 block text-emerald-200/85">
                Where tokens become worlds.
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-neutral-400 sm:text-base">
              You don't just launch a token on CosmoPad. You send it into the
              cosmos. Each token is represented as a world whose story unfolds
              through on-chain activity, community, and the milestones it
              reaches.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onLaunch}
                className="inline-flex items-center gap-2 border border-emerald-300/60 bg-emerald-300/[0.06] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200 transition-colors hover:bg-emerald-300 hover:text-black"
              >
                Launch a world <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-200 transition-colors hover:border-white/40 hover:text-white"
              >
                Explore the cosmos <Compass className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          <section id="token-journey" className="scroll-mt-28 border-b border-white/10 py-10 sm:py-14">
            <SectionEyebrow>01 / THE TOKEN JOURNEY</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              Dust → Planet → Orbit → Star
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-400">
              A token's world changes as it moves through the ecosystem. Market
              activity gives the world its mass, holders form its population,
              liquidity is its atmosphere, and trading brings it to life.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stages.map(({ name, note, icon: Icon }, index) => (
                <div
                  key={name}
                  className="border border-white/[0.09] bg-white/[0.02] p-5 transition-colors hover:border-emerald-300/25"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center border border-emerald-300/20 bg-emerald-300/[0.04] text-emerald-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] text-neutral-600">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.12em]">
                    {name}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-neutral-500">
                    {note}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-neutral-600">
              Stages describe the CosmoPad world-building model. Graduation and
              other milestones depend on the token's launch program and
              on-chain state; they do not predict future performance.
            </p>
          </section>

          <section id="launch-world" className="scroll-mt-28 border-b border-white/10 py-10 sm:py-14">
            <SectionEyebrow>02 / CREATE A WORLD</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              From idea to on-chain token
            </h2>
            <div className="mt-7 space-y-3">
              {steps.map(({ title, description, icon: Icon }, index) => (
                <div
                  key={title}
                  className="flex gap-4 border border-white/[0.08] bg-white/[0.02] p-4 sm:gap-5 sm:p-5"
                >
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center border border-emerald-300/20 text-emerald-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    {index < steps.length - 1 && (
                      <span className="h-5 w-px bg-white/10" />
                    )}
                  </div>
                  <div className="pb-2">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
                      STEP 0{index + 1}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-xs leading-6 text-neutral-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-l-2 border-emerald-300/40 bg-emerald-300/[0.035] px-4 py-3 text-xs leading-6 text-neutral-400">
              Launching and trading are on-chain actions. Always verify the
              network, token details, and transaction costs in your wallet
              before signing.
            </div>
          </section>

          <section id="explore-trade" className="scroll-mt-28 border-b border-white/10 py-10 sm:py-14">
            <SectionEyebrow>03 / FIND YOUR PLACE</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              Explore, inspect, and trade
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-400">
              Explore is your map of token worlds. Open a world to view its
              available token information and activity, then use its token page
              to buy or sell when trading is available. Connect your wallet
              before submitting a transaction; the wallet will show the final
              request for your approval.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <InfoTile
                title="Discover worlds"
                description="Browse launches and use the available filters to find tokens by the ordering that matters to you."
                icon={Compass}
              />
              <InfoTile
                title="Review before trading"
                description="Check the token address, live details, trade amount, and wallet transaction before confirming."
                icon={ArrowRight}
              />
            </div>
            <button
              type="button"
              onClick={onExplore}
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200 transition-colors hover:text-white"
            >
              Open Explore <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </section>

          <section id="live-data" className="scroll-mt-28 border-b border-white/10 py-10 sm:py-14">
            <SectionEyebrow>04 / THE LIVING COSMOS</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              Worlds are powered by activity
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-400">
              CosmoPad brings token worlds and market information together so
              you can follow how the ecosystem changes. On-chain transactions
              are recorded on Robinhood Chain; displayed market values and
              indexed activity can depend on available network and market data
              sources, and may update at different times.
            </p>
            <div className="mt-6 flex items-start gap-4 border border-emerald-300/15 bg-emerald-300/[0.025] p-5">
              <Activity className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
              <p className="text-xs leading-6 text-neutral-400">
                A growing world is a visual way to follow a token's journey—not
                a guarantee of liquidity, value, project quality, or future
                results.
              </p>
            </div>
          </section>

          <section id="risks" className="scroll-mt-28 py-10 sm:py-14">
            <SectionEyebrow>05 / BEFORE YOU ENTER</SectionEyebrow>
            <h2 className="mt-3 flex items-center gap-3 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              Understand the risks
            </h2>
            <div className="mt-5 flex gap-4 border border-amber-200/15 bg-amber-200/[0.025] p-5">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200/80" />
              <div className="space-y-3 text-xs leading-6 text-neutral-400">
                <p>
                  Creator fees are 2% and are sent to CosmoPad's configured
                  fee-recipient wallet. Review the fee and recipient details
                  before approving a launch transaction.
                </p>
                <p>
                  Tokens can be volatile, lose value, or become difficult to
                  trade. A token's world, market cap, volume, holder count, and
                  other displayed metrics can change and may be incomplete or
                  delayed.
                </p>
                <p>
                  Smart-contract interactions can be irreversible, and wallet
                  transactions may incur network fees. Review the project and
                  transaction details independently; only use funds you can
                  afford to lose.
                </p>
              </div>
            </div>
          </section>

          <footer className="border-t border-white/10 pt-7">
            <p className="text-lg font-bold uppercase tracking-tight">
              Every token has a journey.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              CosmoPad is the universe where they happen.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onLaunch}
                className="inline-flex items-center gap-2 bg-emerald-300 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-emerald-200"
              >
                Launch a world <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-200 transition-colors hover:border-white/40 hover:text-white"
              >
                Explore the cosmos
              </button>
            </div>
          </footer>
        </article>
      </div>
    </div>
  </div>
);

const SectionEyebrow: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300/70">
    {children}
  </span>
);

const InfoTile: React.FC<{
  title: string;
  description: string;
  icon: typeof Compass;
}> = ({ title, description, icon: Icon }) => (
  <div className="border border-white/[0.08] bg-white/[0.02] p-5">
    <Icon className="h-4 w-4 text-emerald-200" />
    <h3 className="mt-4 text-xs font-bold uppercase tracking-[0.12em]">
      {title}
    </h3>
    <p className="mt-2 text-xs leading-6 text-neutral-500">{description}</p>
  </div>
);

const BookMarkIcon: React.FC = () => (
  <span className="grid h-4 w-4 place-items-center border border-emerald-300/30">
    <span className="h-1 w-1 rounded-full bg-emerald-300" />
  </span>
);
