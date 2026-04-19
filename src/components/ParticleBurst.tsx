import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface ParticleBurstProps {
  active: boolean;
  accentColor: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const ParticleBurst: React.FC<ParticleBurstProps> = ({ active, accentColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = [accentColor, "#d4af37", "#ffffff", "#f0e6c8"];

  const particles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 10,
    y: 50 + (Math.random() - 0.5) * 10,
    size: Math.random() * 8 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const els = containerRef.current.querySelectorAll(".burst-particle");

    els.forEach((el) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 120;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      gsap.fromTo(
        el,
        { x: 0, y: 0, scale: 1, opacity: 1 },
        {
          x: tx,
          y: ty,
          scale: 0,
          opacity: 0,
          duration: 0.7 + Math.random() * 0.5,
          ease: "power2.out",
          delay: Math.random() * 0.15,
        }
      );
    });
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-visible z-50"
      style={{ borderRadius: "inherit" }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="burst-particle absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBurst;
