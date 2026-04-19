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

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -10,
      scale: 1.03,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const handleClick = () => {
    if (!cardRef.current) return;

    // Quick pulse before opening
    gsap.timeline().to(cardRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.in",
    }).to(cardRef.current, {
      scale: 1.05,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => onSelect(destination),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
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
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Glow ring on hover */}
        <div
          className="absolute -inset-[2px] rounded-[18px] opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background: `linear-gradient(135deg, #d4af37, transparent, #d4af37)`,
            zIndex: -1,
          }}
        />

        <CardBack number={destination.id} />
      </div>
    </motion.div>
  );
};

export default DestinationCard;
