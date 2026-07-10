import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

// Public image URLs — no space-in-path issues
const truffleImg = "/images/truffle_dish.png";
const chefPortrait = "/images/chef_portrait.png";

export function ChefsSpecial({ onReserve }: { onReserve: () => void }) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // 3D Parallax Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 120, mass: 0.9 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["7deg", "-7deg"]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-7deg", "7deg"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized pointer coordinates (-0.5 to 0.5)
    const pointerX = (e.clientX - rect.left) / width - 0.5;
    const pointerY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(pointerX);
    y.set(pointerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section id="chefs-section" className="relative w-full py-28 bg-dark-radial-right overflow-hidden font-sans border-y border-white/5 select-none text-cream">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow bloom centered behind the chef's dish on the right */}
      <motion.div
        animate={{
          scale: [0.96, 1.04, 0.96],
          opacity: [0.12, 0.16, 0.12]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)"
        }}
      />

      {/* Editorial Watermark background */}
      <div className="absolute top-[10%] left-[-5%] text-white/[0.012] text-[18vw] font-serif font-black uppercase pointer-events-none select-none">
        Masterpiece
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
         {/* Left Column: Magazine Typography details */}
         <div className="w-full lg:w-5/12 order-2 lg:order-1">
            <motion.div
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-10 bg-orange-500"></div>
                <h3 className="text-orange-500 font-bold tracking-[0.25em] uppercase text-xs">Chef's Signature</h3>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-cream leading-[1.05] tracking-tight">
                Truffle
                <br />
                <span className="font-extrabold italic text-orange-500">Symphony</span>
              </h2>
              
              <p className="text-cream/70 text-base md:text-lg leading-relaxed max-w-md">
                A delicate balance of earthy shaved black truffles, wild forest mushrooms, and aged Parmigiano-Reggiano, 
                curated personally by Executive Chef Mario. A masterpiece of modern gastronomy.
              </p>
              
              {/* Chef Signature Flourish - Dancing Script Used Sparingly */}
              <div className="flex items-center gap-4 pt-2">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-orange-500/20 shrink-0">
                  <img src={chefPortrait} className="w-full h-full object-cover" alt="Chef Mario" loading="lazy" decoding="async" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-cream/40 font-mono font-bold">Gastronomy Lead</p>
                  <p className="font-cursive text-2xl text-orange-500 mt-0.5 select-none leading-none">Mario Batali</p>
                </div>
              </div>

              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onReserve}
                  data-cursor="Book"
                  className="px-8 py-4 bg-cream text-warm-ink font-bold rounded-full hover:bg-white shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm"
                >
                  Reserve This Dish — ₹1200
                </motion.button>
              </div>
            </motion.div>
         </div>

         {/* Right Column: 3D Parallax image block */}
         <div className="w-full lg:w-7/12 order-1 lg:order-2 relative flex items-center justify-center">
           <div 
             ref={imageContainerRef}
             onMouseMove={handleMouseMove}
             onMouseLeave={handleMouseLeave}
             className="relative w-full max-w-lg aspect-[4/5] rounded-[2.5rem] overflow-visible cursor-default"
             style={{ perspective: "1000px" }}
           >
              {/* Dynamic 3D Card wrapper */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
                className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/10 bg-white/5"
              >
                 {/* Radial Volumetric light falloff effect overlay */}
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.25)_0%,_rgba(26,20,16,0.35)_100%)] z-10 pointer-events-none mix-blend-overlay" />
                 
                 <img 
                   src={truffleImg} 
                   alt="Chefs Special Truffle Symphony" 
                   className="w-full h-full object-cover scale-105" 
                   loading="lazy"
                   decoding="async"
                   style={{ transform: "translateZ(-20px)" }}
                 />
              </motion.div>

              {/* Offset Caption Card - Revealing via polygon clip-path reveal */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { clipPath: "polygon(0 0, 0 100%, 0 100%, 0 0)" },
                  visible: { 
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 } 
                  }
                }}
                className="absolute -bottom-8 -left-6 md:-left-12 w-72 md:w-80 bg-warm-ink p-8 rounded-3xl border border-white/5 shadow-2xl z-30 select-none text-left"
                style={{ transform: "translateZ(40px)" }}
              >
                 <h4 className="font-serif font-black text-orange-500 mb-2 text-xl italic">Mushroom Truffle Platter</h4>
                 <p className="text-cream/70 text-xs md:text-sm leading-relaxed">
                   Wild chanterelle and porcini mushrooms, local black truffle shavings, aged parmesan fonduta, and aged Modena balsamic drizzle.
                 </p>
              </motion.div>
           </div>
         </div>
      </div>
    </section>
  );
}
