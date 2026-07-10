import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { ChevronLeft, ChevronRight, Plus, Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

export interface MenuPreviewDish {
  id: number;
  name: string;
  ingredients: string;
  price: number;
  spiceLevel: number; // 0 to 3
  isVeg: boolean;
  image: string;
}

export const DISH_DATA: Record<string, MenuPreviewDish[]> = {
  Starters: [
    {
      id: 101,
      name: "Crunchy Spring Rolls",
      ingredients: "Golden thin pastry, glass noodles, seasoned garden vegetables, sweet chili drizzle.",
      price: 280,
      spiceLevel: 1,
      isVeg: true,
      image: "/images/springroll1.png",
    },
    {
      id: 102,
      name: "Classic Chicken Roll",
      ingredients: "Griddle-toasted flatbread, spiced chicken cubes, pickled red onions, mint spread.",
      price: 340,
      spiceLevel: 2,
      isVeg: false,
      image: "/images/chickenroll1.png",
    },
    {
      id: 103,
      name: "Crispy Golden Fries",
      ingredients: "Fresh sea-salted french fries, signature spicy dusting, house dipping selection.",
      price: 180,
      spiceLevel: 1,
      isVeg: true,
      image: "/images/fries1.png",
    },
    {
      id: 104,
      name: "Cheesy Loaded Fries",
      ingredients: "Double-stacked crispy fries, aged cheddar cheese sauce, jalapeño slices, sour cream.",
      price: 220,
      spiceLevel: 2,
      isVeg: true,
      image: "/images/cheesyfries1.jpg",
    },
    {
      id: 105,
      name: "BBQ Chicken Bites",
      ingredients: "Bite-sized crispy fried chicken pieces, smoky BBQ glaze, ranch dip, celery sticks.",
      price: 320,
      spiceLevel: 2,
      isVeg: false,
      image: "/images/chicken1.png",
    },
    {
      id: 106,
      name: "Smoky Kebab Skewer",
      ingredients: "Mini charcoal-grilled lamb and chicken kebab skewers, spiced yogurt dipping sauce.",
      price: 360,
      spiceLevel: 3,
      isVeg: false,
      image: "/images/kebab2.png",
    },
    {
      id: 107,
      name: "Garden Veggie Starter",
      ingredients: "Seasonal grilled vegetables, olive oil drizzle, herbed ricotta, balsamic reduction.",
      price: 260,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    },
    {
      id: 108,
      name: "Garlic Bread Bruschetta",
      ingredients: "Toasted sourdough, roasted garlic butter, cherry tomatoes, fresh basil chiffonade.",
      price: 200,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=400&q=80",
    },
    {
      id: 109,
      name: "Soup of the Day",
      ingredients: "Chef's rotating seasonal bisque, cream swirl, toasted croutons, fresh herb oil.",
      price: 180,
      spiceLevel: 1,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
    },
    {
      id: 110,
      name: "Crispy Calamari",
      ingredients: "Golden-fried tender squid rings, lemon aioli dip, paprika dusting, fresh lemon wedge.",
      price: 390,
      spiceLevel: 1,
      isVeg: false,
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80",
    },
    {
      id: 111,
      name: "Truffle Arancini",
      ingredients: "Risotto rice balls stuffed with black truffle cream, panko-crusted, served with pomodoro.",
      price: 440,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
    },
  ],
  "Main Course": [
    {
      id: 201,
      name: "Flamin' Cheeseburger",
      ingredients: "Flame-broiled double beef patty, melted aged cheddar, fresh lettuce, smoky chipotle glaze.",
      price: 480,
      spiceLevel: 2,
      isVeg: false,
      image: "/images/burger1.png",
    },
    {
      id: 202,
      name: "Pepperoni Feast Pizza",
      ingredients: "Neapolitan wood-fired crust, pomodoro sauce, mozzarella cheese, loaded beef pepperoni.",
      price: 680,
      spiceLevel: 2,
      isVeg: false,
      image: "/images/pizza1.png",
    },
    {
      id: 203,
      name: "Creamy Alfredo Pasta",
      ingredients: "Fettuccine ribbon pasta, rich garlic butter cream reduction, aged Parmesan flakes.",
      price: 520,
      spiceLevel: 1,
      isVeg: true,
      image: "/images/pasta1.png",
    },
    {
      id: 204,
      name: "Smoky BBQ Kebab",
      ingredients: "Flame-kissed skewered chicken kebab, charcoal smoke infusion, aromatic spice rub.",
      price: 420,
      spiceLevel: 3,
      isVeg: false,
      image: "/images/kebab1.png",
    },
    {
      id: 205,
      name: "Monster Gourmet Burger",
      ingredients: "Giant stacked beef patty, crispy bacon rashers, cheddar, onion rings, smoky ember glaze.",
      price: 580,
      spiceLevel: 2,
      isVeg: false,
      image: "/images/burger2.png",
    },
    {
      id: 206,
      name: "Four-Cheese Pizza",
      ingredients: "Mozzarella, gorgonzola, ricotta, aged parmesan on golden stone-baked crust.",
      price: 720,
      spiceLevel: 1,
      isVeg: true,
      image: "/images/pizza2.png",
    },
    {
      id: 207,
      name: "Spicy Fried Chicken",
      ingredients: "Golden crunchy fried chicken, cayenne-laced batter crust, honey drizzle, coleslaw.",
      price: 460,
      spiceLevel: 3,
      isVeg: false,
      image: "/images/chicken2.png",
    },
    {
      id: 208,
      name: "Truffle Mushroom Pizza",
      ingredients: "Wild porcini mushrooms, black truffle oil drizzle, taleggio cheese, fresh thyme.",
      price: 780,
      spiceLevel: 0,
      isVeg: true,
      image: "/images/pizza3.png",
    },
    {
      id: 209,
      name: "Charcoal Beef Burger",
      ingredients: "Activated charcoal bun, wagyu beef patty, caramelized onions, sriracha mayo.",
      price: 620,
      spiceLevel: 2,
      isVeg: false,
      image: "/images/burger3.png",
    },
    {
      id: 210,
      name: "Tandoori Chicken Combo",
      ingredients: "Clay-oven roasted whole leg quarter, mint chutney, pickled onions, naan bread.",
      price: 540,
      spiceLevel: 3,
      isVeg: false,
      image: "/images/chicken1.png",
    },
    {
      id: 211,
      name: "Veggie Margherita Pizza",
      ingredients: "Classic San Marzano tomato, fresh mozzarella di bufala, torn basil, extra-virgin olive oil.",
      price: 560,
      spiceLevel: 0,
      isVeg: true,
      image: "/images/pizza4.png",
    },
  ],
  Desserts: [
    {
      id: 301,
      name: "Truffle Symphony Plate",
      ingredients: "Dark chocolate cocoa truffles, black winter truffle honey blend, gold leaf garnish.",
      price: 380,
      spiceLevel: 0,
      isVeg: true,
      image: "/images/truffle_dish.png",
    },
    {
      id: 302,
      name: "Warm Molten Lava Cake",
      ingredients: "Decadent liquid chocolate center cake, vanilla bean gelato, fresh berry reduction.",
      price: 290,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80",
    },
    {
      id: 303,
      name: "Baked New York Cheesecake",
      ingredients: "New York-style rich baked cheesecake, butter crust crumbs, salted caramel drizzle.",
      price: 320,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
    },
    {
      id: 304,
      name: "Crème Brûlée",
      ingredients: "Silky vanilla custard, crisp caramelized sugar crust, fresh seasonal berries on the side.",
      price: 340,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80",
    },
    {
      id: 305,
      name: "Tiramisu Parfait",
      ingredients: "Espresso-soaked ladyfingers, mascarpone cream, dark cocoa dusting, amaretto touch.",
      price: 310,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
    },
    {
      id: 306,
      name: "Mango Panna Cotta",
      ingredients: "Silky Italian panna cotta set in mango coulis, passion fruit drizzle, fresh mint.",
      price: 280,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80",
    },
    {
      id: 307,
      name: "Belgian Waffle Tower",
      ingredients: "Layered crispy Belgian waffles, whipped cream, strawberry compote, maple syrup.",
      price: 350,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80",
    },
  ],
  Drinks: [
    {
      id: 401,
      name: "Smoked Spiced Mule",
      ingredients: "Smoked ginger beer infusion, freshly squeezed lime juice, aromatic bitters, spice rim.",
      price: 250,
      spiceLevel: 1,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80",
    },
    {
      id: 402,
      name: "Fresh Mint Cooler",
      ingredients: "Muddled mint leaves, sparkling spring mineral water, organic cane syrup, lime wheels.",
      price: 190,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
    },
    {
      id: 403,
      name: "Artisanal French Press",
      ingredients: "Single-origin roasted arabica coffee beans, slow-plunged hot press extract.",
      price: 160,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    },
    {
      id: 404,
      name: "Tropical Sunset Juice",
      ingredients: "Freshly squeezed mango, passion fruit, orange blend, layered with grenadine.",
      price: 200,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80",
    },
    {
      id: 405,
      name: "Classic Lemonade",
      ingredients: "Hand-squeezed lemon, infused with rosemary simple syrup, sparkling top.",
      price: 150,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=400&q=80",
    },
    {
      id: 406,
      name: "Cold Brew Iced Coffee",
      ingredients: "12-hour cold-steeped specialty coffee blend, served over pure ice, oat milk option.",
      price: 180,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090b?w=400&q=80",
    },
    {
      id: 407,
      name: "Watermelon Aqua Fresca",
      ingredients: "Chilled watermelon juice, fresh mint, cucumber ribbon, Himalayan pink salt touch.",
      price: 170,
      spiceLevel: 0,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1495615080073-6b89c9839ce0?w=400&q=80",
    },
    {
      id: 408,
      name: "Masala Chai Latte",
      ingredients: "Freshly brewed spiced tea, steamed whole milk, cardamom, ginger, cinnamon foam.",
      price: 140,
      spiceLevel: 1,
      isVeg: true,
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80",
    },
  ],
};

const TABS = ["Starters", "Main Course", "Desserts", "Drinks"] as const;
type TabType = typeof TABS[number];

// Card width in px (set as CSS variable for the scroll math)
const CARD_W = 280;
const CARD_GAP = 24;

export function MenuPreviewTabs({ onTriggerAuthGate }: { onTriggerAuthGate: () => void }) {
  const lenis = useLenis();
  const [activeTab, setActiveTab] = useState<TabType>("Starters");
  const railRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

  const handleAddClick = (dish: MenuPreviewDish) => {
    onTriggerAuthGate();
  };

  const handleHeartClick = (e: React.MouseEvent, dishId: string) => {
    e.stopPropagation();
    if (!user) {
      onTriggerAuthGate();
      return;
    }
    toggleFavorite(dishId);
  };

  const scroll = useCallback((dir: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = (CARD_W + CARD_GAP) * 2; // scroll 2 cards at a time
    rail.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }, []);

  const dishes = DISH_DATA[activeTab];

  return (
    <section
      id="menu-preview"
      className="py-28 bg-dark-radial-center relative z-10 font-sans overflow-hidden border-y border-white/5 select-none text-cream"
    >
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow bloom */}
      <motion.div
        animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.10, 0.14, 0.10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="mb-16 text-center flex flex-col items-center justify-center">
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
                Selections Preview
              </span>
              <span className="h-[1px] w-8 bg-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.05] tracking-tight">
              Explore Our <span className="font-extrabold italic text-orange-500">Categories</span>
            </h2>
            <p className="text-cream/70 text-base md:text-lg font-normal leading-relaxed max-w-md mx-auto">
              Filter through our chef-grade selections to compose your perfect course layout.
            </p>
          </motion.div>
        </div>

        {/* Sliding Pill Tab Bar */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap relative z-25">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Reset scroll on tab change
                  if (railRef.current) railRef.current.scrollLeft = 0;
                }}
                className="relative px-6 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer z-10"
                style={{ color: isActive ? "#1a1410" : "rgba(250,246,240,0.6)" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-orange-500 rounded-full -z-10 shadow-lg shadow-orange-500/20"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                {tab}
                <span className="ml-1.5 text-[9px] opacity-50">({DISH_DATA[tab].length})</span>
              </button>
            );
          })}
        </div>

        {/* Arrow + Scroll Rail Layout */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-11 h-11 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-cream/80 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow */}
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-11 h-11 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-cream/80 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>

          {/* Scrollable Horizontal Rail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                ref={railRef}
                className="flex gap-6 overflow-x-auto no-scrollbar pb-4"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {dishes.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      delay: Math.min(index * 0.06, 0.4),
                      type: "spring",
                      stiffness: 220,
                      damping: 22,
                    }}
                    className="shrink-0 bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col hover:border-orange-500/30 transition-all duration-300 group shadow-md"
                    style={{
                      width: `${CARD_W}px`,
                      scrollSnapAlign: "start",
                    }}
                  >
                    {/* Dish Image */}
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative mb-4">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/truffle_dish.png";
                        }}
                      />
                      {/* Dietary dot */}
                      <div className="absolute top-3 left-3">
                        <div
                          className={`w-5 h-5 border flex items-center justify-center rounded-[4px] shadow bg-warm-ink/80 backdrop-blur-sm ${
                            dish.isVeg ? "border-green-600" : "border-red-600"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${dish.isVeg ? "bg-green-600" : "bg-red-600"}`} />
                        </div>
                      </div>
                      {/* Heart / Favorite toggle */}
                      <motion.button
                        onClick={(e) => handleHeartClick(e, String(dish.id))}
                        whileTap={{ scale: 0.85 }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-sm transition cursor-pointer z-10"
                        title={isFavorited(String(dish.id)) ? "Remove from Favorites" : "Save to Favorites"}
                      >
                        <motion.div
                          animate={{ scale: isFavorited(String(dish.id)) ? [1, 1.3, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart
                            size={13}
                            className={isFavorited(String(dish.id)) ? "fill-red-500 text-red-500" : "text-cream/60"}
                          />
                        </motion.div>
                      </motion.button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="text-sm font-bold font-serif text-white leading-snug group-hover:text-orange-400 transition-colors">
                            {dish.name}
                          </h3>
                          <span className="text-orange-500 font-bold font-serif text-sm shrink-0 mt-0.5">
                            ₹{dish.price}
                          </span>
                        </div>
                        <p className="text-cream/50 text-xs leading-relaxed line-clamp-3 font-normal">
                          {dish.ingredients}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                        {dish.spiceLevel > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-mono tracking-widest text-cream/40">Spice:</span>
                            <div className="flex gap-0.5">
                              {[...Array(dish.spiceLevel)].map((_, i) => (
                                <span key={i} className="text-[10px]">🌶️</span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[9px] uppercase font-mono tracking-widest text-cream/30">Mild Flavor</span>
                        )}
                        
                        <button
                          onClick={() => handleAddClick(dish)}
                          data-cursor="Add"
                          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 text-cream cursor-pointer pointer-events-auto shadow-sm"
                        >
                          <Plus className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Fade edges for depth cue */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-[#150f0a] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#150f0a] to-transparent pointer-events-none z-10" />
        </div>

        {/* View Full Menu CTA */}
        <div className="mt-14 text-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const el = document.getElementById("menu-section");
              if (el) {
                if (lenis) {
                  lenis.scrollTo(el, { offset: -80, duration: 1.2 });
                } else {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-cream rounded-full transition border border-white/10 flex items-center gap-2.5 cursor-pointer text-xs mx-auto shadow-md font-medium"
          >
            <span>View Full Menu</span>
            <span className="text-orange-500">→</span>
          </motion.button>
        </div>

      </div>
    </section>
  );
}
