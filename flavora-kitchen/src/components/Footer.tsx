import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

function SocialCube({ icon: Icon, index, onClick }: { icon: any; index: number; onClick?: () => void }) {
  // Desynchronize hover spring values per icon
  const stiffness = 220 + index * 40;
  const damping = 18 - index * 2;

  return (
    <motion.div
      onClick={onClick}
      className="relative w-11 h-11 cursor-pointer overflow-hidden rounded-xl border border-white/5 shadow-md bg-white/5"
      whileHover="hover"
    >
      <motion.div
        variants={{
          rest: { y: "0%" },
          hover: { y: "-50%" },
        }}
        initial="rest"
        animate="rest"
        transition={{ type: "spring", stiffness, damping }}
        className="w-full h-[200%]"
      >
        <div className="w-full h-1/2 flex items-center justify-center text-cream/70">
          <Icon className="w-5 h-5" />
        </div>
        <div className="w-full h-1/2 flex items-center justify-center text-white bg-orange-500">
          <Icon className="w-5 h-5" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Footer({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const lenis = useLenis();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      if (lenis) {
        lenis.scrollTo(el, { offset: -80, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="relative bg-dark-radial-center pt-28 pb-12 border-t border-white/5 font-sans text-cream overflow-hidden">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Subtle central glow bloom behind Flavora watermark */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none select-none z-0 animate-pulse"
        style={{
          background: "radial-gradient(ellipse at center, rgba(249, 115, 22, 0.12) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)",
          animationDuration: "8s"
        }}
      />

      {/* 3D Wave Divider deco */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180" style={{ transform: "rotate(180deg) translateY(100%) scaleY(0.5)", perspective: "500px" }}>
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-[calc(100%+1.3px)] h-[120px] fill-current text-white/5" style={{ transform: "rotateX(20deg)" }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Large Ghost Watermark for scale and drama at closing */}
      <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 text-white/[0.015] text-[20vw] font-serif font-black select-none pointer-events-none text-center w-full uppercase tracking-[0.1em] leading-none z-0">
        Flavora
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="space-y-6">
             <div className="text-3xl font-serif font-black text-white">
              Flavora <span className="font-light italic text-orange-500">Kitchen</span>
             </div>
             <p className="text-cream/50 text-sm leading-relaxed max-w-sm">
               Experience dining in three dimensions. We unify culinary mastery and modern visual presentation to celebrate gastronomy.
             </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-3.5 text-cream/60 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => scrollTo("menu-section")}>Menu</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => scrollTo("offers-section")}>Special Offers</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => scrollTo("chefs-section")}>Chef's Corner</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Terms & Legal</h4>
            <ul className="space-y-3.5 text-cream/60 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => triggerToast("Privacy Policy will become active upon official launch.")}>Privacy Policy</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => triggerToast("Terms of Service will become active upon official launch.")}>Terms of Service</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => triggerToast("Dine-in Guidelines will become active upon official launch.")}>Dine-in Guidelines</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Connect</h4>
            <p className="text-cream/50 text-xs mb-4">Join our community online to explore daily kitchen creations.</p>
            
            {/* Social Icons list with delay index desync */}
            <div className="flex space-x-3.5">
              <SocialCube icon={Facebook} index={0} onClick={() => triggerToast("Social page will become active upon official launch.")} />
              <SocialCube icon={Twitter} index={1} onClick={() => triggerToast("Social page will become active upon official launch.")} />
              <SocialCube icon={Instagram} index={2} onClick={() => triggerToast("Social page will become active upon official launch.")} />
              <SocialCube icon={Youtube} index={3} onClick={() => triggerToast("Social page will become active upon official launch.")} />
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-cream/40 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Flavora Kitchen. Structured for modern, immersive web browsers.</p>
          <div className="flex items-center space-x-2">
             <span>Rendered seamlessly at</span>
             <span className="bg-white/5 text-green-400 px-2 py-0.5 rounded text-[10px] font-mono border border-white/5">60 FPS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
