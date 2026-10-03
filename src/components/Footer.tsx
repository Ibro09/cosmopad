import React from "react";
import { ArrowUpRight, Twitter } from "lucide-react";

const links = [
  { label: "EXPLORE", href: "/explore" },
  { label: "LAUNCH", href: "/launch" },
  { label: "HOW IT WORKS", href: "/how-it-works" },
];

export const Footer: React.FC = () => (
  <footer
    id="cosmopad-footer"
    className="border-t border-neutral-900 bg-black py-8 text-[11px] uppercase tracking-[0.16em] text-neutral-400"
  >
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-6 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-12">
      <a href="/" className="flex items-center gap-2 text-white no-underline">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="font-bold tracking-[0.22em]">COSMOPAD</span>
      </a>

      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-7 gap-y-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-neutral-400 no-underline transition-colors hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a
        href="https://x.com/ponsdotfamily"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-neutral-300 no-underline transition-colors hover:text-emerald-300"
        aria-label="PonsFamily on X"
      >
        <Twitter className="h-3.5 w-3.5" />
        X
        <ArrowUpRight className="h-3 w-3 text-neutral-500" />
      </a>
    </div>
    <div className="mx-auto mt-7 w-full max-w-[1440px] border-t border-neutral-900 px-6 pt-5 text-[9px] tracking-[0.14em] text-neutral-600 sm:px-10 lg:px-12">
      © 2026 COSMOPAD · EVERY TOKEN A WORLD
    </div>
  </footer>
);
