import { motion } from "motion/react";
import { useState } from "react";

// All images from /public/images/ — no import issues
const CATEGORIES = [
  {
    id: "burgers",
    name: "Burgers",
    count: 12,
    emoji: "🍔",
    image: "/images/burger2.png",
    gradient: "from-orange-500/20 to-red-500/10",
    accent: "#f97316",
    tag: "Fan Favourite",
  },
  {
    id: "pizza",
    name: "Pizza",
    count: 8,
    emoji: "🍕",
    image: "/images/pizza1.png",
    gradient: "from-red-500/20 to-rose-500/10",
    accent: "#ef4444",
    tag: "Bestseller",
  },
  {
    id: "chicken",
    name: "Fried Chicken",
    count: 10,
    emoji: "🍗",
    image: "/images/chicken1.png",
    gradient: "from-yellow-500/20 to-amber-500/10",
    accent: "#eab308",
    tag: "Crispy & Hot",
  },
  {
    id: "kebabs",
    name: "Kebabs & Grills",
    count: 7,
    emoji: "🥙",
    image: "/images/kebab1.png",
    gradient: "from-amber-500/20 to-orange-500/10",
    accent: "#f59e0b",
    tag: "Charcoal Grilled",
  },
  {
    id: "pasta",
    name: "Pasta",
    count: 9,
    emoji: "🍝",
    image: "/images/pasta1.png",
    gradient: "from-lime-500/20 to-green-500/10",
    accent: "#84cc16",
    tag: "Italian Kitchen",
  },
  {
    id: "sides",
    name: "Sides & Fries",
    count: 15,
    emoji: "🍟",
    image: "/images/fries1.png",
    gradient: "from-yellow-400/20 to-amber-400/10",
    accent: "#facc15",
    tag: "Perfect Add-ons",
  },
  {
    id: "rolls",
    name: "Rolls & Wraps",
    count: 6,
    emoji: "🌯",
    image: "/images/chickenroll1.png",
    gradient: "from-teal-500/20 to-cyan-500/10",
    accent: "#14b8a6",
    tag: "Quick Bites",
  },
  {
    id: "starters",
    name: "Starters",
    count: 11,
    emoji: "🥟",
    image: "/images/springroll1.png",
    gradient: "from-purple-500/20 to-violet-500/10",
    accent: "#a855f7",
    tag: "Crispy Bites",
  },
  {
    id: "desserts",
    name: "Desserts",
    count: 7,
    emoji: "🍰",
    image: "/images/truffle_dish.png",
    gradient: "from-pink-500/20 to-rose-500/10",
    accent: "#ec4899",
    tag: "Sweet Treats",
  },
];

export function Categories() {
  const [activeId, setActiveId] = useState<string>("burgers");

  return (
    <section className="py-28 bg-cream relative z-10 overflow-hidden font-sans select-none">
      {/* Background Watermark */}
      <div className="absolute bottom-[5%] right-0 text-gray-900/[0.012] text-[18vw] font-serif font-black uppercase pointer-events-none select-none leading-none">
        Flavors
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-orange-500" />
              <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">Categories</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-warm-ink leading-[1.05] tracking-tight">
              Browse <span className="font-extrabold italic text-orange-500">Gourmet</span>
            </h2>
            <p className="text-gray-500 text-base max-w-md mt-3">
              Eight curated divisions of premium food — each crafted with chef-grade ingredients.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-sans font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse" />
            {CATEGORIES.length} categories available
          </div>
        </motion.div>

        {/* Category Grid — Bento style spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeId === cat.id;
            const isFeatured = cat.id === "burgers";
            return (
              <motion.div
                key={cat.id}
                onClick={() => setActiveId(cat.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: idx * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                style={isActive ? {
                  background: `radial-gradient(circle at center, ${cat.accent}2a 0%, #0d0a08 100%)`,
                  boxShadow: `0 20px 40px -15px ${cat.accent}44`,
                  borderColor: `${cat.accent}44`
                } : undefined}
                className={`group relative rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col gap-6 overflow-hidden ${
                  isFeatured
                    ? "col-span-2 sm:col-span-2 sm:row-span-2 p-8 justify-between min-h-[320px] sm:min-h-[380px]"
                    : "p-5"
                } ${
                  isActive
                    ? "shadow-xl"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100"
                }`}
              >
                {/* Noise/Grain Overlay on Active Card */}
                {isActive && <div className="noise-overlay opacity-[0.02]" />}

                {/* Tag badge */}
                <div
                  className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/10 text-white/70" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {cat.tag}
                </div>

                {/* Food image */}
                <div className={`relative w-full flex items-center justify-center overflow-visible ${
                  isFeatured ? "h-36 sm:h-44 md:h-52 mt-4" : "h-24"
                }`}>
                  <motion.img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className={`${isFeatured ? "h-36 sm:h-44 md:h-52" : "h-24"} w-auto object-contain`}
                    style={{
                      filter: isActive
                        ? `drop-shadow(0 12px 24px ${cat.accent}55)`
                        : "drop-shadow(0 6px 12px rgba(0,0,0,0.08))",
                      willChange: "transform",
                    }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>

                {/* Label */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <span className={isFeatured ? "text-2xl" : "text-lg"}>{cat.emoji}</span>
                    <h3
                      className={`font-serif font-extrabold leading-tight ${
                        isFeatured ? "text-xl sm:text-2xl" : "text-base"
                      } ${
                        isActive ? "text-white" : "text-warm-ink"
                      }`}
                    >
                      {cat.name}
                    </h3>
                  </div>
                  <p
                    className={`font-bold font-sans tracking-wider uppercase ${isFeatured ? "text-xs mt-2" : "text-[11px] mt-1.5"}`}
                    style={{ color: isActive ? cat.accent : "#9ca3af" }}
                  >
                    {cat.count} Items
                  </p>
                </div>

                {/* Bottom accent bar on active */}
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                    style={{ background: cat.accent }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
