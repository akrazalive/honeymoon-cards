import React, { useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import type { Destination } from "../data/destinations";
import CardBack from "./CardBack";

interface DestinationCardProps {
  destination: Destination;
  index: number;
  onSelect: (destination: Destination) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  index,
  onSelect,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1

    gsap.to(cardRef.current, {
      rotateY: dx * 18,
      rotateX: -dy * 14,
      y: -10,
      scale: 1.04,
      duration: 0.25,
      ease: "power2.out",
      transformPerspective: 800,
    });

    // Move specular highlight
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: dx * 30,
        y: dy * 20,
        opacity: 0.6,
        duration: 0.25,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
      transformPerspective: 800,
    });
    if (glowRef.current) {
      gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
    }
  };

  const handleClick = () => {
    if (!cardRef.current) return;

    // Slam forward then trigger
    gsap.timeline()
      .to(cardRef.current, {
        scale: 0.92,
        rotateY: 0,
        rotateX: 0,
        duration: 0.12,
        ease: "power3.in",
        transformPerspective: 800,
      })
      .to(cardRef.current, {
        scale: 1.08,
        duration: 0.18,
        ease: "power3.out",
        onComplete: () => onSelect(destination),
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: "800px" }}
    >
      <div
        ref={cardRef}
        className="relative cursor-pointer select-none"
        style={{
          width: "100%",
          aspectRatio: "2/3",
          borderRadius: "16px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Specular highlight that follows cursor */}
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 65%)",
            zIndex: 10,
          }}
        />

        {/* Gold border glow on hover — CSS handles this */}
        <div
          className="absolute -inset-[1.5px] rounded-[18px] pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "linear-gradient(135deg, #d4af37, rgba(212,175,55,0.2), #d4af37)",
            zIndex: -1,
          }}
        />

        <CardBack number={destination.id} />
      </div>
    </motion.div>
  );
};

export default DestinationCard;
