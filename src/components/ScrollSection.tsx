import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ScrollSectionProps {
  id: string;
  imageSrc: string;
  category: string;
  title: string;
  subtitle: string;
  primaryBtnText: string;
  onPrimaryClick: () => void;
  secondaryBtnText?: string;
  onSecondaryClick?: () => void;
  align?: 'left' | 'bottom-left' | 'center';
}

export const ScrollSection: React.FC<ScrollSectionProps> = ({
  id,
  imageSrc,
  category,
  title,
  subtitle,
  primaryBtnText,
  onPrimaryClick,
  secondaryBtnText,
  onSecondaryClick,
}) => {
  return (
    <section
      id={id}
      className="relative w-full min-h-screen h-screen flex flex-col justify-end pb-16 md:pb-24 lg:pb-28 overflow-hidden bg-black text-white select-none border-t border-neutral-900"
    >
      {/* Background Image with Dark Vignettes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-100 hover:scale-[1.02] transition-transform duration-1000 ease-out"
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-[1720px] w-full mx-auto px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl">
          {/* Category Tag */}
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-neutral-300 mb-2.5">
            {category}
          </span>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-tight text-white">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-neutral-200 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
            {subtitle}
          </p>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              onClick={onPrimaryClick}
              className="group relative inline-flex items-center gap-3 px-7 py-3 border border-white/70 hover:border-white text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-black transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
              <span>{primaryBtnText}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {secondaryBtnText && onSecondaryClick && (
              <button
                onClick={onSecondaryClick}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/25 hover:border-white/70 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors cursor-pointer bg-black/40 backdrop-blur-sm"
              >
                <span>{secondaryBtnText}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
