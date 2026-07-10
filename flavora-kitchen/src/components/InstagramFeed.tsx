import { motion } from "motion/react";

interface InstagramPost {
  id: number;
  image: string;
  likes: number;
  caption: string;
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 1,
    image: "/images/burger1.png",
    likes: 247,
    caption: "Tonight's signature plating details 🔥",
  },
  {
    id: 2,
    image: "/images/pizza1.png",
    likes: 189,
    caption: "Wood-fired perfection fresh from the oven 🍕",
  },
  {
    id: 3,
    image: "/images/truffle_dish.png",
    likes: 412,
    caption: "Shaving fresh black winter truffles live 💎",
  },
  {
    id: 4,
    image: "/images/kebab1.png",
    likes: 310,
    caption: "Smoky charcoal flame skewers sizzle 🍢",
  },
  {
    id: 5,
    image: "/images/pasta1.png",
    likes: 195,
    caption: "Velvety Parmigiano cream reduction pour 🍝",
  },
  {
    id: 6,
    image: "/images/combo_deal.png",
    likes: 521,
    caption: "Indulging in the weekend Grand Feast spread 🏆",
  },
];

export function InstagramFeed() {
  return (
    <section className="py-28 bg-[#0d0a08] relative z-10 font-sans overflow-hidden border-b border-white/5 select-none text-cream">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

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
            {/* Behind the scenes tag */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-500 font-mono font-bold uppercase tracking-[0.25em] text-[10px]">
                Behind the Scenes
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.05] tracking-tight">
              Kitchen <span className="font-extrabold italic text-orange-500">Stories</span>
            </h2>
            <p className="text-cream/70 text-base md:text-lg font-normal leading-relaxed max-w-md mx-auto">
              A visual record of our culinary prep, flame grills, and plating artistry.
            </p>
          </motion.div>
        </div>

        {/* Circular Kitchen Windows Horizontal Rail */}
        <div className="relative w-full max-w-6xl mx-auto overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory flex gap-8 pb-8 relative z-10">
          {INSTAGRAM_POSTS.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9, y: 25 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="snap-center shrink-0 w-[240px] md:w-[280px]"
            >
              {/* Circular window outline plate motif */}
              <div className="w-full aspect-square rounded-full border border-white/10 hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group shadow-lg bg-white/5">
                <img
                  src={post.image}
                  alt={`Kitchen stories photo - ${post.caption}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Frosted Glass slide up panel */}
                <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-md border-t border-white/10 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-orange-500 font-bold">Kitchen Prep</span>
                  <p className="text-cream/90 text-xs mt-2 leading-relaxed px-2 font-medium">
                    {post.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
