import React, { useEffect, useRef } from "react";

interface ParticleCanvasProps {
  active: boolean;
  accentColor: string;
  /** Center of burst in viewport coords */
  originX: number;
  originY: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  rotation: number;
  rotSpeed: number;
  shape: "circle" | "rect" | "star";
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = angle + (2 * Math.PI) / 10;
    if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
    else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
    ctx.lineTo(x + (r * 0.4) * Math.cos(innerAngle), y + (r * 0.4) * Math.sin(innerAngle));
  }
  ctx.closePath();
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  active,
  accentColor,
  originX,
  originY,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const accent = accentColor.startsWith("#") ? hexToRgb(accentColor) : { r: 212, g: 175, b: 55 };
  const gold = { r: 212, g: 175, b: 55 };
  const white = { r: 255, g: 255, b: 255 };

  const colorPalette = [
    `rgb(${accent.r},${accent.g},${accent.b})`,
    `rgb(${gold.r},${gold.g},${gold.b})`,
    `rgb(${white.r},${white.g},${white.b})`,
    `rgba(${accent.r},${accent.g},${accent.b},0.7)`,
    "#ffe066",
    "#fff5cc",
  ];

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn 120 particles from origin
    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      const shapes: Particle["shape"][] = ["circle", "rect", "star"];
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4, // slight upward bias
        size: 3 + Math.random() * 9,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.018,
        gravity: 0.18 + Math.random() * 0.12,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    // Also spawn shockwave rings (drawn separately)
    particlesRef.current = particles;

    let shockwaveRadius = 0;
    let shockwaveAlpha = 0.8;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Shockwave ring
      if (shockwaveAlpha > 0) {
        shockwaveRadius += 18;
        shockwaveAlpha -= 0.04;
        ctx.beginPath();
        ctx.arc(originX, originY, shockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,175,55,${shockwaveAlpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Second ring slightly behind
        if (shockwaveRadius > 30) {
          ctx.beginPath();
          ctx.arc(originX, originY, shockwaveRadius - 25, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${shockwaveAlpha * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Particles
      let alive = false;
      for (const p of particlesRef.current) {
        if (p.alpha <= 0) continue;
        alive = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98; // air resistance
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          drawStar(ctx, 0, 0, p.size / 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (alive || shockwaveAlpha > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
};

export default ParticleCanvas;
