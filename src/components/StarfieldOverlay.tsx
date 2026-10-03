import React from "react";

const stars = Array.from({ length: 170 }, (_, index) => ({
  left: `${(index * 47.173 + 7.3) % 100}%`,
  top: `${(index * 71.719 + 11.8) % 100}%`,
  size: index % 13 === 0 ? 2 : 1,
  opacity: index % 5 === 0 ? 0.8 : index % 3 === 0 ? 0.55 : 0.35,
  delay: `${-(index % 19) * 0.37}s`,
}));

export const StarfieldOverlay: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-[35] overflow-hidden opacity-40 mix-blend-screen"
  >
    {stars.map((star, index) => (
      <span
        key={index}
        className="absolute rounded-full bg-white [animation:star-twinkle_4s_ease-in-out_infinite]"
        style={{
          left: star.left,
          top: star.top,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          animationDelay: star.delay,
        }}
      />
    ))}
    <style>{`
      @keyframes star-twinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.95; }
      }
    `}</style>
  </div>
);
