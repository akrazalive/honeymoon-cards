import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { X, Heart, Share2, MapPin } from "lucide-react";
import type { Destination } from "../data/destinations";
import ParticleCanvas from "./ParticleCanvas";
import { playRumble, playBurst, playWhoosh, playRevealChime, playLand } from "../utils/sound";

interface RevealModalProps {
  destination: Destination | null;
  onClose: () => void;
}

type Phase = "idle" | "building" | "ripping" | "exploding" | "tumbling" | "landing" | "revealed";

const RevealModal: React.FC<RevealModalProps> = ({ destination, onClose }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [burstActive, setBurstActive] = useState(false);
  const [burstOrigin, setBurstOrigin] = useState({ x: 0, y: 0 });
  const [flashActive, setFlashActive] = useState(false);

  const packRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ripTopRef = useRef<HTMLDivElement>(null);
  const ripBottomRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = destination !== null;

  useEffect(() => {
    if (!destination) {
      setPhase("idle");
      setBurstActive(false);
      return;
    }
    const t = setTimeout(() => runSequence(), 80);
    return () => clearTimeout(t);
  }, [destination]);

  const runSequence = useCallback(() => {
    if (!packRef.current || !cardRef.current) return;

    const tl = gsap.timeline();

    // ── Phase 1: Pack materialises with energy build ──────────────────────
    setPhase("building");
    playRumble();

    tl.fromTo(
      packRef.current,
      { scale: 0, opacity: 0, rotateY: 90, filter: "blur(20px)" },
      {
        scale: 1,
        opacity: 1,
        rotateY: 0,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "back.out(2)",
      }
    )
    // Glow pulse build-up
    .to(glowRef.current, {
      boxShadow: "0 0 0px 0px rgba(212,175,55,0)",
      duration: 0,
    })
    .to(glowRef.current, {
      boxShadow: "0 0 80px 30px rgba(212,175,55,0.6), 0 0 160px 60px rgba(212,175,55,0.2)",
      duration: 0.35,
      ease: "power2.in",
    })

    // ── Phase 2: Violent shake / ripping ─────────────────────────────────
    .call(() => setPhase("ripping"))
    .to(packRef.current, {
      keyframes: [
        { x: -12, rotation: -5, duration: 0.05 },
        { x: 14, rotation: 6, duration: 0.05 },
        { x: -16, rotation: -7, duration: 0.05 },
        { x: 18, rotation: 8, duration: 0.05 },
        { x: -20, rotation: -9, duration: 0.05 },
        { x: 22, rotation: 10, duration: 0.05 },
        { x: -18, rotation: -8, duration: 0.05 },
        { x: 0, rotation: 0, duration: 0.05 },
      ],
    })
    // Rip lines animate outward
    .fromTo(
      [ripTopRef.current, ripBottomRef.current],
      { scaleX: 0, opacity: 1 },
      { scaleX: 1, opacity: 1, duration: 0.15, ease: "power3.out", stagger: 0.04 },
      "<"
    )

    // ── Phase 3: EXPLOSION ────────────────────────────────────────────────
    .call(() => {
      setPhase("exploding");
      // Get screen center of pack for particle origin
      if (packRef.current) {
        const rect = packRef.current.getBoundingClientRect();
        setBurstOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
      setBurstActive(true);
      setFlashActive(true);
      playBurst();
      setTimeout(() => setFlashActive(false), 120);
      setTimeout(() => setBurstActive(false), 2000);
    })
    // Pack explodes outward — scale up then vanish
    .to(packRef.current, {
      scale: 1.4,
      opacity: 0,
      filter: "blur(30px)",
      duration: 0.2,
      ease: "power4.out",
    })

    // ── Phase 4: Card tumbles in from top — thrown from plane ─────────────
    .call(() => {
      setPhase("tumbling");
      playWhoosh();
    })
    .fromTo(
      cardRef.current,
      {
        y: -window.innerHeight * 0.7,
        x: 120,
        rotation: -270,
        scale: 0.2,
        opacity: 0,
        filter: "blur(8px)",
      },
      {
        y: 30,
        x: 0,
        rotation: 8,
        scale: 1.05,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.65,
        ease: "power3.in",
      }
    )

    // ── Phase 5: Card slams down and settles ──────────────────────────────
    .call(() => {
      setPhase("landing");
      playLand();
      // Screen shake
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          keyframes: [
            { x: -6, y: 4, duration: 0.04 },
            { x: 5, y: -3, duration: 0.04 },
            { x: -4, y: 2, duration: 0.04 },
            { x: 3, y: -1, duration: 0.04 },
            { x: 0, y: 0, duration: 0.04 },
          ],
        });
      }
    })
    .to(cardRef.current, {
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1.2, 0.5)",
    })

    // ── Phase 6: Reveal chime + card glows ───────────────────────────────
    .call(() => {
      setPhase("revealed");
      playRevealChime();
    });
  }, []);

  if (!destination) return null;

  return (
    <>
      {/* Full-screen particle canvas — sits above everything */}
      <ParticleCanvas
        active={burstActive}
        accentColor={destination.accentColor}
        originX={burstOrigin.x}
        originY={burstOrigin.y}
      />

      {/* White flash on explosion */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ background: "white", zIndex: 9998 }}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 cursor-pointer"
              style={{
                background: "radial-gradient(ellipse at center, rgba(10,5,30,0.92) 0%, rgba(0,0,0,0.97) 100%)",
                backdropFilter: "blur(16px)",
              }}
              onClick={phase === "revealed" ? onClose : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Cinematic vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
              }}
            />

            <div className="relative z-10 w-full max-w-sm">
              {/* Close button */}
              <motion.button
                className="absolute -top-12 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                onClick={onClose}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: phase === "revealed" ? 1 : 0, scale: phase === "revealed" ? 1 : 0 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <X size={20} />
              </motion.button>

              {/* ── PACK (pre-explosion) ── */}
              <div
                ref={packRef}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: ["building", "ripping"].includes(phase) ? 1 : 0,
                  perspective: "600px",
                }}
              >
                <div
                  ref={glowRef}
                  className="relative flex items-center justify-center"
                  style={{
                    width: 220,
                    height: 300,
                    borderRadius: 20,
                    background: "linear-gradient(145deg, #1a1a2e 0%, #0f3460 60%, #1a1a2e 100%)",
                    border: "2px solid rgba(212,175,55,0.5)",
                    overflow: "hidden",
                  }}
                >
                  {/* Inner shine */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(212,175,55,0.05) 100%)",
                    }}
                  />

                  {/* Rip line top */}
                  <div
                    ref={ripTopRef}
                    className="absolute left-0 right-0"
                    style={{
                      top: "38%",
                      height: 2,
                      background:
                        "linear-gradient(90deg, transparent, rgba(212,175,55,1), rgba(255,255,255,0.9), rgba(212,175,55,1), transparent)",
                      transformOrigin: "center",
                      filter: "blur(0.5px)",
                      boxShadow: "0 0 8px rgba(212,175,55,0.8)",
                    }}
                  />
                  {/* Rip line bottom */}
                  <div
                    ref={ripBottomRef}
                    className="absolute left-0 right-0"
                    style={{
                      top: "62%",
                      height: 2,
                      background:
                        "linear-gradient(90deg, transparent, rgba(212,175,55,1), rgba(255,255,255,0.9), rgba(212,175,55,1), transparent)",
                      transformOrigin: "center",
                      filter: "blur(0.5px)",
                      boxShadow: "0 0 8px rgba(212,175,55,0.8)",
                    }}
                  />

                  {/* Pack icon */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div
                      className="text-6xl"
                      style={{ filter: "drop-shadow(0 0 20px rgba(212,175,55,0.8))" }}
                    >
                      🎴
                    </div>
                    <div
                      className="text-xs tracking-[0.3em] uppercase font-semibold"
                      style={{ color: "rgba(212,175,55,0.8)" }}
                    >
                      Opening...
                    </div>
                  </div>

                  {/* Corner ornaments */}
                  {[
                    "top-3 left-3 border-t-2 border-l-2",
                    "top-3 right-3 border-t-2 border-r-2",
                    "bottom-3 left-3 border-b-2 border-l-2",
                    "bottom-3 right-3 border-b-2 border-r-2",
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className={`absolute ${cls} w-5 h-5`}
                      style={{ borderColor: "rgba(212,175,55,0.5)" }}
                    />
                  ))}
                </div>
              </div>

              {/* ── REVEALED CARD ── */}
              <div
                ref={cardRef}
                style={{
                  opacity: ["tumbling", "landing", "revealed"].includes(phase) ? 1 : 0,
                  transformOrigin: "center bottom",
                }}
              >
                <div
                  className="relative rounded-3xl overflow-hidden"
                  style={{
                    boxShadow:
                      phase === "revealed"
                        ? `0 40px 100px rgba(0,0,0,0.8), 0 0 80px ${destination.accentColor}50, 0 0 160px ${destination.accentColor}20`
                        : "0 20px 60px rgba(0,0,0,0.6)",
                    transition: "box-shadow 0.8s ease",
                  }}
                >
                  {/* Light leak on reveal */}
                  <AnimatePresence>
                    {phase === "revealed" && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none z-20 rounded-3xl"
                        style={{
                          background: `linear-gradient(135deg, ${destination.accentColor}30 0%, transparent 50%, transparent 100%)`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, times: [0, 0.3, 1] }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Country image */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={destination.imageUrl}
                      alt={destination.country}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.15, filter: "brightness(0.5) saturate(0)" }}
                      animate={
                        phase === "revealed"
                          ? { scale: 1, filter: "brightness(0.9) saturate(1)" }
                          : {}
                      }
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)",
                      }}
                    />

                    {/* Emoji badge */}
                    <motion.div
                      className="absolute top-4 right-4 text-4xl"
                      initial={{ scale: 0, rotate: -45, opacity: 0 }}
                      animate={phase === "revealed" ? { scale: 1, rotate: 0, opacity: 1 } : {}}
                      transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 12 }}
                      style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
                    >
                      {destination.emoji}
                    </motion.div>

                    {/* Location badge */}
                    <motion.div
                      className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${destination.accentColor}70`,
                        color: destination.accentColor,
                      }}
                      initial={{ opacity: 0, x: -30 }}
                      animate={phase === "revealed" ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }}
                    >
                      <MapPin size={11} />
                      Honeymoon Destination
                    </motion.div>

                    {/* Country name */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <motion.h2
                        className="font-playfair text-4xl font-bold text-white leading-tight"
                        style={{ textShadow: "0 2px 30px rgba(0,0,0,0.9)" }}
                        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                        animate={
                          phase === "revealed"
                            ? { opacity: 1, y: 0, filter: "blur(0px)" }
                            : {}
                        }
                        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {destination.country}
                      </motion.h2>
                      <motion.p
                        className="text-sm italic font-playfair mt-1"
                        style={{ color: destination.accentColor }}
                        initial={{ opacity: 0, y: 15 }}
                        animate={phase === "revealed" ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.35, duration: 0.5 }}
                      >
                        "{destination.tagline}"
                      </motion.p>
                    </div>
                  </div>

                  {/* Card body */}
                  <div
                    className="p-5"
                    style={{
                      background:
                        "linear-gradient(160deg, #0f1923 0%, #1a2535 100%)",
                    }}
                  >
                    <motion.p
                      className="text-white/70 text-sm leading-relaxed mb-5"
                      initial={{ opacity: 0, y: 8 }}
                      animate={phase === "revealed" ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      {destination.caption}
                    </motion.p>

                    {/* Divider */}
                    <motion.div
                      className="h-px mb-5"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${destination.accentColor}60, transparent)`,
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={phase === "revealed" ? { scaleX: 1, opacity: 1 } : {}}
                      transition={{ delay: 0.55, duration: 0.6 }}
                    />

                    {/* Action buttons */}
                    <motion.div
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={phase === "revealed" ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.65, duration: 0.5 }}
                    >
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${destination.accentColor} 0%, ${destination.accentColor}bb 100%)`,
                          color: "#fff",
                          boxShadow: `0 6px 24px ${destination.accentColor}55`,
                        }}
                      >
                        <Heart size={15} />
                        Save Destination
                      </button>
                      <button
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:bg-white/15 active:scale-95"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#fff",
                        }}
                      >
                        <Share2 size={15} />
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RevealModal;
