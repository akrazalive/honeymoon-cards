import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { X, Heart, Share2, MapPin } from "lucide-react";
import type { Destination } from "../data/destinations";
import ParticleBurst from "./ParticleBurst";

interface RevealModalProps {
  destination: Destination | null;
  onClose: () => void;
}

type Phase = "idle" | "ripping" | "tumbling" | "landing" | "revealed";

const RevealModal: React.FC<RevealModalProps> = ({ destination, onClose }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [burstActive, setBurstActive] = useState(false);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ripRef = useRef<HTMLDivElement>(null);

  const isOpen = destination !== null;

  // Reset and start animation sequence when destination changes
  useEffect(() => {
    if (!destination) {
      setPhase("idle");
      setBurstActive(false);
      return;
    }

    // Small delay so modal mounts first
    const t = setTimeout(() => runSequence(), 100);
    return () => clearTimeout(t);
  }, [destination]);

  const runSequence = () => {
    if (!envelopeRef.current || !cardRef.current) return;

    const tl = gsap.timeline();

    // Phase 1: Envelope shakes / rips
    setPhase("ripping");
    tl.fromTo(
      envelopeRef.current,
      { scale: 0.6, opacity: 0, rotateY: -30 },
      { scale: 1, opacity: 1, rotateY: 0, duration: 0.4, ease: "back.out(1.7)" }
    )
      .to(envelopeRef.current, {
        x: -8,
        rotation: -3,
        duration: 0.07,
        repeat: 7,
        yoyo: true,
        ease: "none",
      })
      // Phase 2: Tumbling — thrown from plane effect
      .call(() => {
        setPhase("tumbling");
        setBurstActive(true);
        setTimeout(() => setBurstActive(false), 900);
      })
      .to(envelopeRef.current, {
        y: -60,
        x: 40,
        rotation: 720,
        scale: 0.3,
        opacity: 0,
        duration: 0.55,
        ease: "power3.in",
      })
      // Phase 3: Card lands
      .call(() => setPhase("landing"))
      .fromTo(
        cardRef.current,
        {
          y: -200,
          x: 60,
          rotation: -180,
          scale: 0.4,
          opacity: 0,
        },
        {
          y: 0,
          x: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: "back.out(1.4)",
        }
      )
      // Phase 4: Revealed — subtle bounce settle
      .to(cardRef.current, {
        y: -6,
        duration: 0.2,
        ease: "power1.out",
      })
      .to(cardRef.current, {
        y: 0,
        duration: 0.15,
        ease: "bounce.out",
      })
      .call(() => setPhase("revealed"));
  };

  if (!destination) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 cursor-pointer"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Modal container */}
          <div className="relative z-10 w-full max-w-md">
            {/* Close button */}
            <motion.button
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "revealed" ? 1 : 0 }}
              transition={{ delay: 0.3 }}
            >
              <X size={28} />
            </motion.button>

            {/* Envelope / ripping element */}
            <div
              ref={envelopeRef}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: phase === "ripping" || phase === "tumbling" ? 1 : 0 }}
            >
              <div
                className="relative w-64 h-40 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
                  border: "2px solid rgba(212,175,55,0.4)",
                  boxShadow: "0 0 40px rgba(212,175,55,0.3)",
                }}
              >
                {/* Rip line */}
                <div
                  ref={ripRef}
                  className="absolute top-1/2 left-0 right-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)",
                    transform: "translateY(-50%)",
                  }}
                />
                <span className="text-4xl">✉️</span>
                <ParticleBurst active={burstActive} accentColor={destination.accentColor} />
              </div>
            </div>

            {/* Revealed card */}
            <div
              ref={cardRef}
              style={{ opacity: phase === "landing" || phase === "revealed" ? 1 : 0 }}
            >
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${destination.accentColor}40`,
                }}
              >
                {/* Country image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={destination.imageUrl}
                    alt={destination.country}
                    className="w-full h-full object-cover"
                    style={{ filter: "brightness(0.85)" }}
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9) 100%)",
                    }}
                  />

                  {/* Emoji badge */}
                  <motion.div
                    className="absolute top-4 right-4 text-4xl"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={phase === "revealed" ? { scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  >
                    {destination.emoji}
                  </motion.div>

                  {/* Location pin */}
                  <motion.div
                    className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(8px)",
                      border: `1px solid ${destination.accentColor}60`,
                      color: destination.accentColor,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={phase === "revealed" ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 }}
                  >
                    <MapPin size={12} />
                    Honeymoon Destination
                  </motion.div>

                  {/* Country name on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <motion.h2
                      className="font-playfair text-4xl font-bold text-white mb-1"
                      style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={phase === "revealed" ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.15, duration: 0.5 }}
                    >
                      {destination.country}
                    </motion.h2>
                    <motion.p
                      className="text-sm text-white/70 italic font-playfair"
                      initial={{ opacity: 0, y: 10 }}
                      animate={phase === "revealed" ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.25, duration: 0.5 }}
                    >
                      "{destination.tagline}"
                    </motion.p>
                  </div>
                </div>

                {/* Card body */}
                <div
                  className="p-6"
                  style={{ background: "linear-gradient(135deg, #111827, #1f2937)" }}
                >
                  <motion.p
                    className="text-white/80 text-sm leading-relaxed mb-5"
                    initial={{ opacity: 0 }}
                    animate={phase === "revealed" ? { opacity: 1 } : {}}
                    transition={{ delay: 0.4 }}
                  >
                    {destination.caption}
                  </motion.p>

                  {/* Action buttons */}
                  <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={phase === "revealed" ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${destination.accentColor}, ${destination.accentColor}cc)`,
                        color: "#fff",
                        boxShadow: `0 4px 20px ${destination.accentColor}50`,
                      }}
                    >
                      <Heart size={16} />
                      Save Destination
                    </button>
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                      }}
                    >
                      <Share2 size={16} />
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RevealModal;
