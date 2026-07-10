import { motion } from "motion/react";
import { ShoppingCart, Menu } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react";
import { useCart } from "../context/CartContext";

export function Navbar({ 
  onOpenCart, 
  onOpenReservation,
  announcementActive = false
}: { 
  onOpenCart: () => void; 
  onOpenReservation: () => void;
  announcementActive?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) {
        if (lenis) {
          lenis.scrollTo(el, { offset: -80, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`fixed left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-warm-ink/90 backdrop-blur-md shadow-2xl shadow-black/10 py-3 border-b border-white/5 top-0"
          : `${announcementActive ? "top-9 md:top-10" : "top-0"} bg-transparent py-6`
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center select-none">
        {/* Animated Self-Drawing SVG Logomark + Text */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-orange-500 stroke-[7] stroke-linecap-round stroke-linejoin-round">
              <motion.path 
                d="M 35 15 C 20 35 20 60 50 85 C 80 60 80 35 65 15 Z" 
                strokeDasharray="300"
                initial={{ strokeDashoffset: 300 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path 
                d="M 50 35 L 50 65" 
                strokeDasharray="50"
                initial={{ strokeDashoffset: 50 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
              />
            </svg>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-2xl font-serif font-extrabold text-white inline-block origin-left tracking-tight"
          >
            Flavora <span className="font-light italic text-orange-500">Kitchen</span>
          </motion.div>
        </div>

        {/* Action Controls & Navigation Link List */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex space-x-2 font-medium font-sans">
            <MagneticLink scrolled={scrolled} onClick={() => scrollToSection("menu-section")}>
              Menu
            </MagneticLink>
            <MagneticLink scrolled={scrolled} onClick={() => scrollToSection("offers-section")}>
              Offers
            </MagneticLink>
            <MagneticLink scrolled={scrolled} onClick={() => scrollToSection("chefs-section")}>
              Chef's Special
            </MagneticLink>
          </div>

          {/* Book Table outline Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenReservation}
            className={`hidden md:block px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm transition-all border cursor-pointer ${
              scrolled
                ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-400"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
            }`}
          >
            Book Table
          </motion.button>

          {/* Cart Icon Button with badge */}
          <motion.button
            id="cart-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-sans font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg border border-warm-ink"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          <button className="md:hidden text-white cursor-pointer p-1">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

function MagneticLink({ children, scrolled, onClick }: { children: React.ReactNode; scrolled: boolean; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    // Shift slightly toward cursor
    setPosition({ x: x * 0.35, y: y * 0.35 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="relative py-2 px-3 cursor-pointer group"
    >
      <span className={`text-sm tracking-wide transition-colors relative z-10 ${scrolled ? "text-cream hover:text-orange-400" : "text-white/80 hover:text-white"}`}>
        {children}
      </span>
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-orange-500/20" />
    </motion.div>
  );
}
