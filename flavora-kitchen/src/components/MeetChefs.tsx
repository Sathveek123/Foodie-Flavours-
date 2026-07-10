import { motion } from "motion/react";

export function MeetChefs() {
  return (
    <section id="chefs-section" className="py-28 bg-cream relative z-10 font-sans select-none overflow-hidden border-b border-warm-ink/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-20 text-center flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 bg-orange-500" />
              <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">
                Culinary Leadership
              </span>
              <span className="h-[1px] w-8 bg-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-warm-ink leading-[1.05] tracking-tight">
              Meet the <span className="font-extrabold italic text-orange-500">Master</span>
            </h2>
            <p className="text-warm-ink/70 text-base md:text-lg font-normal leading-relaxed max-w-md mx-auto">
              Orchestrating our modernist flavor profiles and gastronomic signatures.
            </p>
          </motion.div>
        </div>

        {/* Single Chef Spotlight - Asymmetric Editorial Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          
          {/* Left Column: Chef Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="w-full max-w-[360px] aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white border border-warm-ink/5 p-4 shadow-xl relative group">
              <div className="w-full h-full rounded-[2rem] overflow-hidden relative bg-cream border border-warm-ink/5">
                <img
                  src="/images/chef_portrait.png"
                  alt="Executive Chef Mario Batali"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {/* Experience Tag overlay */}
                <div className="absolute bottom-5 right-5 bg-warm-ink/90 text-cream px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg">
                  15+ Years Experience
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Narrative Story & Philosopy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="space-y-2">
              <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">
                Executive Chef & Culinary Director
              </span>
              <h3 className="text-3xl md:text-4xl font-bold font-serif text-warm-ink tracking-tight">
                Mario Batali
              </h3>
            </div>
            
            <p className="text-warm-ink/75 text-sm md:text-base leading-relaxed font-normal">
              At Flavora Kitchen, culinary tradition meets three-dimensional sensory experience under the guidance of Chef Mario Batali. Over the past 15 years, Mario has directed Michelin-starred kitchens globally, pioneering modernist gastronomy methods that elevate simple ingredients into architectural taste structures.
            </p>
            
            <div className="border-l-2 border-orange-500 pl-4 py-1.5 bg-warm-ink/[0.01]">
              <p className="font-serif italic text-warm-ink/80 text-sm md:text-base leading-relaxed">
                "Modern cooking is not about replacing classic flavours — it is about magnifying their dimensions, making the experience of dining feel entirely alive."
              </p>
            </div>

            <div className="pt-4 flex flex-col items-start gap-1">
              <span className="text-[9px] uppercase font-mono tracking-widest text-warm-ink/40">Gastronomy Lead Signature</span>
              <p className="font-cursive text-3xl text-orange-500 select-none leading-none">
                Mario Batali
              </p>
            </div>
          </motion.div>
          
        </div>

        {/* Handoff Pending Verification Notice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-20 max-w-xl mx-auto bg-white/40 border border-warm-ink/5 rounded-2xl p-5 text-center shadow-sm backdrop-blur-sm"
        >
          <p className="text-[11px] font-mono text-warm-ink/50 uppercase tracking-widest leading-relaxed">
            Note: Additional culinary staff biographies, sous chefs, and pastry artisans are undergoing verification and will be published upon launch.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
