import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Maximize2 } from "lucide-react";

interface GalleryItem {
  id: number;
  image: string;
  caption: string;
  span: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    image: "/images/truffle_dish.png",
    caption: "Truffle Symphony",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    image: "/images/burger1.png",
    caption: "Flamin' Cheeseburger",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    image: "/images/pizza1.png",
    caption: "Pepperoni Feast Pizza",
    span: "col-span-1 row-span-2",
  },
  {
    id: 4,
    image: "/images/pizza2.png",
    caption: "Classic Margherita Pizza",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    image: "/images/pasta1.png",
    caption: "Creamy Alfredo Pasta",
    span: "col-span-1 row-span-1",
  },
  {
    id: 6,
    image: "/images/combo_deal.png",
    caption: "Gourmet Party Feast",
    span: "col-span-2 row-span-1",
  },
  {
    id: 7,
    image: "/images/kebab1.png",
    caption: "Smoky BBQ Kebab",
    span: "col-span-1 row-span-1",
  },
  {
    id: 8,
    image: "/images/chicken2.png",
    caption: "Golden Crispy Tenders",
    span: "col-span-2 row-span-1",
  },
  {
    id: 9,
    image: "/images/springroll1.png",
    caption: "Crunchy Spring Rolls",
    span: "col-span-1 row-span-1",
  },
  {
    id: 10,
    image: "/images/chicken1.png",
    caption: "Spicy Fried Chicken",
    span: "col-span-1 row-span-1",
  },
];

export function FoodGallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <section className="py-28 bg-dark-radial-center relative z-10 font-sans overflow-hidden border-y border-white/5 select-none">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow bloom centered inside */}
      <motion.div
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.12, 0.16, 0.12]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-20 flex flex-col items-center text-center">
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
                Inside Flavora
              </span>
              <span className="h-[1px] w-8 bg-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-cream leading-[1.05] tracking-tight">
              The <span className="font-extrabold italic text-orange-500">Experience</span>
            </h2>
            <p className="text-cream/70 text-base md:text-lg font-normal leading-relaxed max-w-md mx-auto">
              Visual impressions of our dining environment, gourmet prep, and signature creations.
            </p>
          </motion.div>
        </div>

        {/* Asymmetric Bento-style Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[160px] md:auto-rows-[200px]">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelectedItem(item)}
              className={`${item.span} group relative rounded-3xl overflow-hidden border border-white/5 cursor-pointer shadow-lg`}
            >
              {/* Image with Scale-up on Hover */}
              <motion.img
                src={item.image}
                alt={item.caption}
                loading="lazy"
                decoding="async"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full object-cover"
              />

              {/* Black Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Caption Overlay & Maximize Icon */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                <div className="flex justify-between items-center text-cream">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-orange-400">Flavora Gallery</span>
                    <h4 className="text-sm md:text-base font-bold font-serif tracking-tight mt-0.5">{item.caption}</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Maximize2 size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
            />

            {/* Lightbox content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-w-4xl z-10 flex flex-col items-center pointer-events-none"
            >
              {/* Image Frame */}
              <div className="relative w-full aspect-[16/10] max-h-[80vh] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl pointer-events-auto bg-[#0d0a08]">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.caption}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
                
                {/* Close Button on Image */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-black/70 text-cream/70 hover:text-white rounded-full transition border border-white/10 cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Lightbox Caption bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-8 flex flex-col justify-end text-left select-none pointer-events-none">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-orange-500 font-bold">Immersive View</span>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-white mt-1">{selectedItem.caption}</h3>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
