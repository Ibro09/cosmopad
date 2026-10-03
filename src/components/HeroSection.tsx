import React from "react";
import { ChevronDown, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import marsHeroImg from "../assets/images/spacex_mars_hero_1789201662230.jpg";

interface HeroSectionProps {
  onExplore: () => void;
  onOpenRobinhood?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onOpenRobinhood,
}) => {
  return (
    <section
      id="hero"
      className="relative w-full min-h-screen h-screen flex flex-col justify-between overflow-hidden bg-black text-white select-none"
    >
      {/* Background Video: Dynamic Aerospace / Orbital Motion */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <video
          id="hero-background-video"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          ref={(video) => {
            if (video) {
              video.muted = true;
              video.play().catch(() => {});
            }
          }}
          className="
  w-full h-full
  object-cover
  object-center
  scale-[0.85]
  sm:scale-95
  md:scale-100
  lg:scale-105
  transition-transform duration-1000 ease-out
  brightness-[0.85]
  contrast-[1.05]
">
          <source
            src="/herovideo.mp4"
            type="video/mp4"
          />
          {/* Fallback image */}
        </video>
        {/* Subtle gradient vignette to guarantee text legibility and blend smoothly into pure black */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent w-full md:w-3/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* Top Spacer for fixed navbar */}
      <div className="h-28" />

   {/* Main Content Area */}
<div className="relative z-10 mx-auto my-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12">
  <div className="max-w-2xl lg:max-w-3xl">

    {/* Main Display Headline */}
    <h1
      id="hero-heading"
      className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-extrabold uppercase tracking-tight leading-[0.95] text-white"
      style={{ letterSpacing: "-0.02em" }}
    >
      ENTER
      <br />
      THE
      <br />
      COSMOS
    </h1>

    {/* Subtitle */}
    <p
      id="hero-subtext"
      className="mt-6 md:mt-8 text-neutral-200 text-sm sm:text-base md:text-[17px] font-normal leading-relaxed max-w-xl tracking-wide"
    >
      Discover a living onchain universe where every token becomes a world.
      Watch new planets form, enter orbit, and evolve into stars as their
      communities and markets grow.
    </p>

    {/* Action Buttons */}
    <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">

      <button
        id="hero-explore-btn"
        onClick={onExplore}
        className="group relative inline-flex items-center gap-3 px-8 py-3.5 border border-white/80 hover:border-white text-xs md:text-[13px] font-bold uppercase tracking-[0.2em] text-white hover:text-black transition-all duration-300 overflow-hidden cursor-pointer"
      >
        <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
        <span>EXPLORE COSMOS</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>

      <button
        id="hero-launch-btn"
        onClick={onOpenRobinhood}
        className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-xs md:text-[13px] font-bold uppercase tracking-[0.18em] text-neutral-200 hover:text-white transition-colors cursor-pointer"
      >
        <span>LAUNCH A WORLD</span>
      </button>

    </div>
  </div>
</div>
      {/* Bottom Scroll Indicator */}
      <div className="relative z-10 pb-8 flex flex-col items-center justify-center">
        <a
          href="#starship"
          aria-label="Scroll to next section"
          className="group flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Scroll To Portfolio
          </span>
          <ChevronDown className="w-6 h-6 animate-bounce text-white/70 group-hover:text-white" />
        </a>
      </div>
    </section>
  );
};
