import React from "react";

interface CardBackProps {
  number: number;
}

/**
 * The face-down card shown in the grid.
 * Uses a dark luxury aesthetic with a gold number.
 */
const CardBack: React.FC<CardBackProps> = ({ number }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-2xl">
      {/* Background gradient */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        }}
      />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 rounded-2xl card-shimmer" />

      {/* Decorative border */}
      <div
        className="absolute inset-[3px] rounded-xl pointer-events-none"
        style={{
          border: "1px solid rgba(212,175,55,0.25)",
        }}
      />

      {/* Corner ornaments */}
      {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
        (pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-4 h-4`}
            style={{
              borderTop: i < 2 ? "2px solid rgba(212,175,55,0.5)" : "none",
              borderBottom: i >= 2 ? "2px solid rgba(212,175,55,0.5)" : "none",
              borderLeft: i % 2 === 0 ? "2px solid rgba(212,175,55,0.5)" : "none",
              borderRight: i % 2 === 1 ? "2px solid rgba(212,175,55,0.5)" : "none",
            }}
          />
        )
      )}

      {/* Center number */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          className="text-5xl font-bold font-playfair"
          style={{
            color: "#d4af37",
            textShadow: "0 0 30px rgba(212,175,55,0.6)",
          }}
        >
          {number}
        </div>
        <div
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: "rgba(212,175,55,0.6)" }}
        >
          Reveal
        </div>
      </div>

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 rounded-2xl opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
};

export default CardBack;
