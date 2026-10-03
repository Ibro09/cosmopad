import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDot,
  Orbit,
  Rocket,
  Sparkles,
  Wallet,
} from "lucide-react";

const launchSteps = [
  {
    number: "01",
    icon: Wallet,
    title: "Connect",
    description: "Bring your wallet to the launchpad and get ready to create.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Create",
    description: "Give your token a name, a symbol, and a world of its own.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch",
    description: "Send your idea into the cosmos and invite your community in.",
  },
];

const journeyStages = [
  { name: "Dust", note: "A new idea takes shape.", icon: Sparkles },
  { name: "Planet", note: "A community begins to grow.", icon: CircleDot },
  { name: "Orbit", note: "A world finds its momentum.", icon: Orbit },
  { name: "Star", note: "A thriving ecosystem shines.", icon: Sparkles },
];

export const LaunchpadIntro: React.FC = () => (
 <section
  id="launchpad"
  className="relative overflow-hidden bg-black text-white"
>
  <span id="starship" className="absolute top-0" aria-hidden="true" />

  {/* Very subtle green atmospheric glow */}
  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.025] blur-[140px]" />

  {/* Subtle green edge lines */}
  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

  <div className="relative mx-auto grid w-full max-w-[1440px] gap-14 px-6 py-24 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12 lg:py-32">

    {/* LEFT */}
    <div className="max-w-xl">

      <span className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400/70">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        THE COSMOPAD LAUNCHPAD
      </span>

      <h2 className="text-4xl font-extrabold uppercase leading-[0.98] tracking-tight sm:text-5xl md:text-6xl">
        Your idea.
        <br />
        Your token.
        <br />
        <span className="text-white/80">Your world.</span>
      </h2>

      <p className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-400 sm:text-base">
        CosmoPad gives creators a place to launch a token and communities a
        place to gather around it. Start with an idea, bring people
        together, and let your world grow.
      </p>

      <a
        href="/launch"
        className="group relative mt-8 inline-flex items-center gap-3 border border-emerald-400/50 bg-transparent px-6 py-3.5 text-xs font-bold uppercase tracking-[0.17em] text-emerald-300 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-400 hover:text-black"
      >
        Create a token
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>

      
    </div>

    {/* RIGHT */}
    <div className="relative">

      {/* Outer green frame glow */}
      <div className="pointer-events-none absolute -inset-px bg-emerald-400/[0.04] blur-sm" />

      <div
        className="
          relative
          border border-emerald-400/20
          bg-black
          p-5
          sm:p-7
        "
      >

        {/* Header */}
        <div className="mb-7 flex items-center justify-between border-b border-emerald-400/10 pb-4">

          <div>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-600">
              YOUR LAUNCH SEQUENCE
            </span>

            <span className="mt-1 block text-sm font-semibold text-white">
              From idea to orbit
            </span>
          </div>

          <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            READY
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-3">

          {launchSteps.map(
            ({ number, icon: Icon, title, description }, index) => (
              <div
                className="
                  group
                  flex items-center gap-4
                  border border-white/[0.08]
                  bg-black
                  p-4
                  transition-all duration-300
                  hover:border-emerald-400/30
                  hover:bg-emerald-400/[0.015]
                  sm:p-5
                "
                key={number}
              >

                {/* Number */}
                <span className="w-7 shrink-0 font-mono text-[10px] text-neutral-700">
                  {number}
                </span>

                {/* Icon */}
                <span
                  className="
                    grid h-10 w-10 shrink-0 place-items-center
                    border border-emerald-400/20
                    bg-black
                    text-emerald-400/80
                    transition-colors
                    group-hover:border-emerald-400/40
                    group-hover:text-emerald-300
                  "
                >
                  <Icon className="h-4 w-4" />
                </span>

                {/* Text */}
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm font-semibold text-white">
                    {title}
                  </strong>

                  <span className="mt-1 block text-xs leading-relaxed text-neutral-600">
                    {description}
                  </span>
                </span>

                {/* Arrow */}
                <ArrowRight
                  className={`
                    h-4 w-4 shrink-0 transition-transform
                    group-hover:translate-x-1
                    ${
                      index === launchSteps.length - 1
                        ? "text-emerald-400"
                        : "text-neutral-800"
                    }
                  `}
                />
              </div>
            )
          )}

        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-[9px] uppercase tracking-[0.15em] text-neutral-700">
          <span>BUILT FOR THE COMMUNITY</span>

          <span className="text-emerald-400/60">
            COSMOPAD
          </span>
        </div>

      </div>
    </div>
  </div>
</section>
);

export const TokenJourney: React.FC = () => (
  <section
      id="token-journey"
      className="relative overflow-hidden bg-black text-white"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-950/20 blur-[130px]" />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300/80">
            THE WORLD-BUILDING JOURNEY
          </span>
          <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl md:text-5xl">
            Every launch has a trajectory.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-400">
            The CosmoPad universe is made to grow with its tokens and
            communities—from a first spark to a world of its own.
          </p>
        </div>

        <div className="relative mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-white/10 via-emerald-300/40 to-white/10 lg:block" />
          {journeyStages.map(({ name, note, icon: Icon }, index) => (
            <article
              className="relative border border-white/[0.08] bg-[#070908] p-5 transition-colors hover:border-emerald-300/25 sm:p-6"
              key={name}
            >
              <div className="relative z-10 mb-7 flex items-center justify-between">
                <span className="grid h-16 w-16 place-items-center rounded-full border border-emerald-300/20 bg-black text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] text-neutral-600">
                  0{index + 1}
                </span>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300/70">
                PHASE 0{index + 1}
              </span>
              <h3 className="mt-2 text-xl font-bold uppercase tracking-wide text-white">
                {name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                {note}
              </p>
            </article>
          ))}
        </div>
      </div>
  </section>
);

export const LaunchpadCTA: React.FC = () => (
  <section
      id="launch-world"
      className="relative overflow-hidden border-y border-emerald-300/10  text-white"
    >
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center px-6 py-20 text-center sm:px-10 lg:px-12 lg:py-24">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300/80">
          READY WHEN YOU ARE
        </span>
        <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl md:text-5xl">
          Put your idea into orbit.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400">
          The next world in the cosmos could start with you.
        </p>
          <button
        id="hero-explore-btn"
       
        className="group relative inline-flex items-center gap-3 px-8 py-3.5 border border-white/80 hover:border-white text-xs md:text-[13px] font-bold uppercase tracking-[0.2em] text-white hover:text-black transition-all duration-300 overflow-hidden cursor-pointer mt-10"
      >
        <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
        <span>EXPLORE COSMOS</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      </div>
  </section>
);
