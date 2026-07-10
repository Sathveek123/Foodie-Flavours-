import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Heart, Plus, Star } from "lucide-react";
import { useState, useRef } from "react";
import { Dish } from "../types";
import { useFavorites } from "../context/FavoritesContext";

// Public image URLs — served from /public/images/ (no space issues)
const burger1 = "/images/burger1.png";
const pizza1 = "/images/pizza1.png";
const kebab1 = "/images/kebab1.png";
const fries1 = "/images/fries1.png";
const pasta1 = "/images/pasta1.png";
const springRolls1 = "/images/springroll1.png";
const friedChicken1 = "/images/chicken1.png";
const chickenRoll1 = "/images/chickenroll1.png";
const pizza2 = "/images/pizza2.png";
const burger2 = "/images/burger2.png";
const slider1 = "/images/slider1.png";
const cheesyFries1 = "/images/cheesyfries1.jpg";

const DISHES: Dish[] = [
  {
    id: "1",
    name: "Flamin' Cheeseburger",
    price: 480,
    image: burger1,
    badge: "Signature Choice",
    description: "Double flame-grilled beef patty, melted cheddar cheese, fresh lettuce, tomato, and house sauce."
  },
  {
    id: "2",
    name: "Pepperoni Feast Pizza",
    price: 680,
    image: pizza1,
    badge: "Bestseller",
    description: "Rich pepperoni slices layered on seasoned tomato pomodoro sauce and bubbly mozzarella cheese."
  },
  {
    id: "3",
    name: "Smoky BBQ Kebab",
    price: 420,
    image: kebab1,
    description: "Tender, succulent chicken skewers flame-grilled and served with mint garlic dipping sauce."
  },
  {
    id: "4",
    name: "Crispy Golden Fries",
    price: 220,
    image: fries1,
    description: "Fresh, hot french fries crisped to perfection and served with our spicy dipping selection."
  },
  {
    id: "5",
    name: "Creamy Alfredo Pasta",
    price: 420,
    image: pasta1,
    badge: "Chef Recommends",
    description: "Rich and velvety fettuccine tossed in a butter garlic cream sauce and aged Parmesan."
  },
  {
    id: "6",
    name: "Crunchy Spring Rolls",
    price: 250,
    image: springRolls1,
    description: "Golden, thin-wrapper spring rolls packed with seasoned vegetables and sweet chili glaze."
  },
  {
    id: "7",
    name: "Spicy Fried Chicken",
    price: 450,
    image: friedChicken1,
    description: "Golden, deep-fried chicken pieces coated in a crunchy spiced batter seasoning."
  },
  {
    id: "8",
    name: "Classic Chicken Roll",
    price: 320,
    image: chickenRoll1,
    description: "Griddle-toasted flatbread wrapping juicy spiced chicken cubes and crisp red onions."
  },
  {
    id: "9",
    name: "Veggie Garden Pizza",
    price: 620,
    image: pizza2,
    description: "Stone-baked gourmet thin crust topped with dynamic garden vegetables and light pesto drizzle."
  },
  {
    id: "10",
    name: "Gourmet Monster Burger",
    price: 590,
    image: burger2,
    badge: "Heavy Meal",
    description: "Giant beef patty stacked high with bacon, cheddar, crispy onion rings, and smokey glaze."
  },
  {
    id: "11",
    name: "Classic Beef Slider",
    price: 290,
    image: slider1,
    description: "Mini gourmet beef slider topped with house pickles, mustard, and caramelized onions."
  },
  {
    id: "12",
    name: "Cheesy Loaded Fries",
    price: 280,
    image: cheesyFries1,
    badge: "Popular Side",
    description: "Crispy golden French fries smothered in hot melted cheddar and fresh herbs."
  }
];

export function PopularDishes({ onTriggerAuthGate }: { onTriggerAuthGate: () => void }) {
  const handleAddClick = (e: React.MouseEvent, dish: Dish) => {
    e.preventDefault();
    onTriggerAuthGate();
  };

  return (
    <section id="menu-section" className="py-28 bg-white relative z-10 font-sans select-none overflow-visible">
      {/* Decorative text background */}
      <div className="absolute top-[5%] right-0 text-gray-900/[0.01] text-[20vw] font-serif font-black uppercase pointer-events-none select-none">
        Menu
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Asymmetrical Section Header */}
        <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-orange-500" />
              <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">Chef Curated</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-warm-ink leading-[1.05] tracking-tight">
              Signature <span className="font-extrabold italic text-orange-500">Selections</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
              A beautifully organized showcase of our most popular gourmet creations.
            </p>
          </motion.div>
          
          <motion.button 
            whileHover={{ x: 5 }}
            className="text-warm-ink border-b border-warm-ink pb-1 font-bold text-sm hidden md:inline-flex items-center gap-2 hover:text-orange-500 hover:border-orange-500 transition-colors cursor-pointer"
          >
            Explore Full Menu 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-visible">
          {DISHES.map((dish, idx) => {
            const isFeatured = idx === 0;
            const isNotable = !isFeatured && !!dish.badge;
            return (
              <DishCard 
                key={dish.id} 
                dish={dish} 
                index={idx} 
                isFeatured={isFeatured}
                isNotable={isNotable}
                onAdd={(e) => handleAddClick(e, dish)} 
              />
            );
          })}
        </div>
      </div>

    </section>
  );
}

interface DishCardProps {
  dish: Dish;
  index: number;
  isFeatured?: boolean;
  isNotable?: boolean;
  onAdd: (e: React.MouseEvent) => void;
}

function DishCard({ dish, index, isFeatured = false, isNotable = false, onAdd }: DishCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isFavorited, toggleFavorite } = useFavorites();
  const liked = isFavorited(String(dish.id));

  // 3D Parallax springs setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 100, mass: 1.0 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
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
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className={`group relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full ${
        isFeatured ? "lg:col-span-2 lg:row-span-2 lg:flex-row" : ""
      }`}
    >
      {/* Image container */}
      <div className={`relative overflow-hidden bg-gray-50 z-10 shrink-0 ${
        isFeatured 
          ? "w-full lg:w-1/2 h-[20rem] lg:h-auto lg:min-h-full" 
          : isNotable 
            ? "w-full h-72 sm:h-80" 
            : "w-full h-64"
      }`}>
        {/* Dynamic Badge */}
        {dish.badge && (
          <div className="absolute top-5 left-5 bg-warm-ink/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-white shadow-md z-20">
            {dish.badge}
          </div>
        )}
        
        {/* Heart Like Trigger */}
        <motion.button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(String(dish.id));
          }}
          className="absolute top-5 right-5 p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 transition-colors z-20 shadow-md pointer-events-auto cursor-pointer"
        >
          <motion.div animate={{ scale: liked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
            <Heart size={14} className={`${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </motion.div>
        </motion.button>

        {/* Ken Burns zooming image effect */}
        <motion.img 
          src={dish.image} 
          alt={dish.name} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Content Container */}
      <div className={`flex flex-col flex-1 z-10 bg-white justify-between ${
        isFeatured ? "p-8 md:p-10 lg:p-12 w-full lg:w-1/2" : "p-8 w-full"
      }`}>
        <div className="space-y-4">
          <div className="flex items-center space-x-1.5">
             <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
             <span className="text-sm font-bold text-gray-800">4.9</span>
             <span className="text-xs text-gray-400 font-medium">(250+ Orders)</span>
          </div>
          
          <h3 className={`text-warm-ink leading-tight font-bold font-sans ${
            isFeatured ? "text-2xl lg:text-3xl" : "text-xl"
          }`}>
            {dish.name}
          </h3>
          
          {dish.description && (
            <p className={`text-gray-500 leading-relaxed max-w-md ${isFeatured ? "text-sm" : "text-xs"}`}>
              {dish.description}
            </p>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-50">
          <p className={`text-warm-ink font-serif font-extrabold tracking-tight ${
            isFeatured ? "text-2xl lg:text-3xl" : "text-3xl"
          }`}>
            ₹{dish.price.toFixed(2)}
          </p>
          
          <button 
            onClick={onAdd}
            data-cursor="Add"
            className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 text-warm-ink cursor-pointer pointer-events-auto shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
