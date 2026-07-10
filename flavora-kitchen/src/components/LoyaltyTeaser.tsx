import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Gem, Award, Cake } from "lucide-react";

export function LoyaltyTeaser({ 
  triggerToast, 
  onTriggerAuthGate 
}: { 
  triggerToast: (msg: string) => void; 
  onTriggerAuthGate: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D Parallax Springs for membership card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 120, mass: 0.8 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]), springConfig);

  // Shine sweep state
  const [shineX, setShineX] = useState(-100);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized pointer coordinates
    const pointerX = (e.clientX - rect.left) / width - 0.5;
    const pointerY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(pointerX);
    y.set(pointerY);

    // Calculate mouse position percentage for gradient highlights
    const percentX = ((e.clientX - rect.left) / width) * 200 - 100;
    setShineX(percentX);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setShineX(-100);
  };

  return (
    <section className="py-28 bg-cream relative z-10 font-sans select-none overflow-hidden border-b border-warm-ink/5 text-warm-ink">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Loyalty Info */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-orange-500" />
                <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">
                  Flavora Club
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-warm-ink leading-[1.05] tracking-tight">
                Join <span className="font-extrabold italic text-orange-500">Flavora Rewards</span>
              </h2>
              <p className="text-warm-ink/65 text-base md:text-lg leading-relaxed max-w-lg">
                Unlock exclusive dining experiences, prioritize reservation seats, and accumulate reward tokens with every culinary course.
              </p>
            </motion.div>

            {/* Benefit Bullets */}
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/15">
                  <Gem className="text-orange-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-warm-ink text-sm">Earn Points Easily</h3>
                  <p className="text-warm-ink/60 text-xs md:text-sm mt-0.5 leading-relaxed">
                    Earn 1 loyalty reward point for every ₹10 spent on dine-in, delivery, or reservations.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/15">
                  <Award className="text-orange-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-warm-ink text-sm">Exclusive Rewards</h3>
                  <p className="text-warm-ink/60 text-xs md:text-sm mt-0.5 leading-relaxed">
                    Redeem accumulated points to claim signature chef creations, gourmet plates, and sweet lava cakes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/15">
                  <Cake className="text-orange-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-warm-ink text-sm">Birthday Blessings</h3>
                  <p className="text-warm-ink/60 text-xs md:text-sm mt-0.5 leading-relaxed">
                    Receive a free pastry creation of your choosing and double points during your birthday calendar month.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Trigger Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onTriggerAuthGate}
                className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-400 shadow-lg shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm font-sans"
              >
                Join Rewards — It's Free
              </motion.button>
            </div>
          </div>

          {/* Right Column: 3D Membership Card Mockup */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[360px] aspect-[1.586/1] rounded-[2rem] cursor-default"
              style={{ perspective: "1000px" }}
            >
              {/* Rotating Card wrapper */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
                className="w-full h-full rounded-[1.5rem] overflow-hidden shadow-2xl relative border border-white/10 bg-gradient-to-br from-[#1a1410] to-[#3a0c16] flex flex-col justify-between p-6 text-cream"
              >
                {/* Noise texturing */}
                <div className="noise-overlay" />

                {/* Diagonal Highlight Shine Sweep Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none z-20 transition-all duration-300 opacity-30"
                  style={{
                    background: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.7) 52%, transparent 60%)`,
                    transform: `translateX(${shineX}%)`,
                  }}
                />

                {/* Top bar details */}
                <div className="flex justify-between items-start" style={{ transform: "translateZ(30px)" }}>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-orange-500 font-bold">Flavora Club</span>
                    <h4 className="text-sm font-serif font-black tracking-[0.05em] uppercase text-white mt-0.5">Gold Card</h4>
                  </div>
                  {/* Embossed gold foil-like accent mark */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 border border-amber-400 flex items-center justify-center font-bold text-xs text-warm-ink shadow">
                    ★
                  </div>
                </div>

                {/* Gold chip outline details */}
                <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 border border-amber-300/40 relative opacity-85 mt-2" style={{ transform: "translateZ(20px)" }}>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-1 opacity-20">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-warm-ink/30" />
                    ))}
                  </div>
                </div>

                {/* Bottom details card number */}
                <div className="flex justify-between items-end mt-4" style={{ transform: "translateZ(40px)" }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-mono text-cream/40 leading-none">Member Number</p>
                    <p className="font-mono text-xs text-white tracking-widest mt-1">FL-2026-9912</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded border border-amber-500/15 text-[8px] font-mono font-bold uppercase tracking-widest">
                      VIP Gold
                    </span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
