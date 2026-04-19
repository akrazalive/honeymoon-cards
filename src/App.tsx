import React, { useState } from "react";
import { motion } from "framer-motion";
import { destinations, type Destination } from "./data/destinations";
import DestinationCard from "./components/DestinationCard";
import RevealModal from "./components/RevealModal";

const App: React.FC = () => {
  const [selected, setSelected] = useState<Destination | null>(null);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <motion.header
        className="text-center pt-16 pb-10 px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Eyebrow */}
        <motion.p
          className="text-xs tracking-[0.4em] uppercase mb-4"
          style={{ color: "rgba(212,175,55,0.7)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ✦ Exclusive Collection ✦
        </motion.p>

        <h1
          className="font-playfair text-5xl md:text-6xl font-bold mb-4"
          style={{
            background: "linear-gradient(135deg, #d4af37 0%, #f5e6a3 50%, #d4af37 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Honeymoon Destinations
        </h1>

        <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
          Select a card to reveal your dream destination. Each card holds a secret
          escape waiting to be discovered.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px w-24" style={{ background: "rgba(212,175,55,0.3)" }} />
          <span style={{ color: "rgba(212,175,55,0.5)" }}>◆</span>
          <div className="h-px w-24" style={{ background: "rgba(212,175,55,0.3)" }} />
        </div>
      </motion.header>

      {/* Cards grid */}
      <main className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-6">
          {destinations.map((dest, i) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              index={i}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          className="text-center text-white/25 text-xs mt-10 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Tap any card to reveal
        </motion.p>
      </main>

      {/* Reveal modal */}
      <RevealModal destination={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default App;
