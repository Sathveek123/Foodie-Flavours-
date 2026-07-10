import { motion } from "motion/react";

const PROOFS = [
  { text: "★ 4.9 Google Rating", delay: 0 },
  { text: "25,000+ Orders Delivered", delay: 0.4 },
  { text: "Trusted Since 2018", delay: 0.8 },
  { text: "🏆 Best Fine Dining 2024", delay: 1.2 },
];

export function SocialProofBar() {
  return (
    <div className="w-full bg-[#0d0a08]/50 backdrop-blur-md border-y border-white/5 py-4 select-none z-10 relative font-sans">
      <div className="noise-overlay" />
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-6 md:gap-8 relative z-10">
        {PROOFS.map((proof, idx) => (
          <div key={idx} className="flex items-center gap-6 md:gap-8">
            <motion.div
              animate={{
                y: [-3, 3, -3],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: proof.delay,
              }}
              className="text-[10px] md:text-[11px] font-mono font-bold tracking-widest text-cream/90 uppercase flex items-center shrink-0"
            >
              {proof.text}
            </motion.div>
            
            {idx < PROOFS.length - 1 && (
              <span className="h-3 border-l border-white/10 hidden md:inline-block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
