import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Star, CheckCircle2 } from "lucide-react";

interface Review {
  id: number;
  initials: string;
  name: string;
  handle: string;
  avatarColor: string;
  rating: number;
  text: string;
  hashtags: string;
  date: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    initials: "M",
    name: "Mr. Phenomenal",
    handle: "@arabesco.ae",
    avatarColor: "bg-indigo-500",
    rating: 5,
    text: "Flavora Kitchen is out of this world. They provide absolutely everything, and assist with any custom request. The gourmet truffles left us in absolute awe.",
    hashtags: "#gastronomy #luxury",
    date: "2 weeks ago"
  },
  {
    id: 2,
    initials: "S",
    name: "Sarah Jenkins",
    handle: "@sarah.jenks",
    avatarColor: "bg-orange-500",
    rating: 5,
    text: "An absolutely stunning culinary spread! Every single plate was a visual masterpiece. The flavors were balanced and perfectly presented. Will return soon!",
    hashtags: "#michelingrade #delicious",
    date: "1 month ago"
  },
  {
    id: 3,
    initials: "D",
    name: "David Chen",
    handle: "@david.chen",
    avatarColor: "bg-teal-500",
    rating: 5,
    text: "The Truffle Symphony dish is legendary. You can taste the extreme quality in the ingredients. Strongly suggest booking tables way in advance!",
    hashtags: "#signaturemenu #truffles",
    date: "1 month ago"
  },
  {
    id: 4,
    initials: "E",
    name: "Elena Rostova",
    handle: "@elena.ros",
    avatarColor: "bg-pink-500",
    rating: 5,
    text: "From the loading animation of their brand to the checkout process, everything is extremely polished. The chocolate lava cake is pure gold.",
    hashtags: "#sweetlava #finedining",
    date: "2 months ago"
  },
  {
    id: 5,
    initials: "K",
    name: "Kabir Mehta",
    handle: "@kabir.mehta",
    avatarColor: "bg-purple-500",
    rating: 5,
    text: "An immersive dining experience unlike anything else. The 3D animations on the menu gave us a glimpse of the absolute craft behind the dishes.",
    hashtags: "#gourmetart #immersive",
    date: "3 months ago"
  }
];

export function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-32 bg-[#45101f] relative z-10 font-sans overflow-hidden border-y border-white/5 select-none">
      {/* Background large decorative letters */}
      <div className="absolute top-[5%] left-[5%] text-white/[0.01] text-[18vw] font-serif font-black uppercase pointer-events-none select-none">
        Reviews
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-orange-500" />
              <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.05] tracking-tight">
              Gastronomy <span className="font-extrabold italic text-orange-500">Feedback</span>
            </h2>
            <p className="text-cream/50 text-base max-w-md">
              Hear the culinary responses from our global fine-dining guests.
            </p>
          </motion.div>
        </div>

        {/* Horizontal Scroll Snap Rail (Drag-enabled via custom cursor indicator) */}
        <div 
          ref={scrollRef}
          data-drag-zone
          className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing pb-8 w-full overflow-y-visible"
        >
          {REVIEWS.map((review, i) => (
            <div 
              key={review.id} 
              className={i === 0 ? "snap-center shrink-0 w-[390px] md:w-[490px] overflow-visible" : "snap-center shrink-0 w-[300px] md:w-[380px] overflow-visible"}
            >
              <ReviewCard review={review} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isLead = index === 0;
  
  // 3D Parallax Springs
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 24, stiffness: 120, mass: 1.0 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["12deg", "-12deg"]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-12deg", "12deg"]), springConfig);

  // Specular Highlight coordinates
  const [specularPos, setSpecularPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const pointerX = (e.clientX - rect.left) / width - 0.5;
    const pointerY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(pointerX);
    y.set(pointerY);

    setSpecularPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
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
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
      className="w-full flex select-none overflow-visible group"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className={`w-full bg-white rounded-[2rem] p-8 flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-gray-100/50 cursor-default relative overflow-hidden transition-all duration-300 ${
          isLead ? "h-[440px]" : "h-[340px]"
        }`}
      >
        {/* Specular glass reflection sweep overlay */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 160px at ${specularPos.x}px ${specularPos.y}px, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 80%)`,
            mixBlendMode: "overlay",
          }}
        />

        <div className="flex justify-between items-start mb-5" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center gap-3.5">
            <div className={`rounded-full ${review.avatarColor} text-white flex items-center justify-center font-bold shrink-0 shadow-md ${
              isLead ? "w-14 h-14 text-2xl" : "w-11 h-11 text-lg"
            }`}>
              {review.initials}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h4 className={`font-bold text-gray-900 leading-none ${
                  isLead ? "text-base" : "text-sm"
                }`}>{review.name}</h4>
                <CheckCircle2 className={`text-blue-500 fill-blue-500/10 shrink-0 ${
                  isLead ? "w-4.5 h-4.5" : "w-3.5 h-3.5"
                }`} />
              </div>
              <span className={`font-semibold text-gray-400 block mt-1 ${
                isLead ? "text-sm" : "text-xs"
              }`}>{review.handle}</span>
            </div>
          </div>
          {/* Fake Google Logo Icon */}
          <div className={`flex items-center justify-center shrink-0 ml-2 ${
            isLead ? "w-9 h-9" : "w-7 h-7"
          }`}>
            <svg viewBox="0 0 24 24" className={isLead ? "w-6 h-6" : "w-5 h-5"}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        </div>

        <div className="flex gap-0.5 mb-3" style={{ transform: "translateZ(20px)" }}>
          {[...Array(5)].map((_, i) => (
             <Star key={i} className={`fill-yellow-400 text-yellow-400 ${
               isLead ? "w-5 h-5" : "w-3.5 h-3.5"
             }`} />
          ))}
        </div>

        <p className={`text-gray-700 leading-relaxed z-10 mb-5 flex-grow font-sans font-medium ${
          isLead ? "text-base line-clamp-5" : "text-sm line-clamp-4"
        }`} style={{ transform: "translateZ(20px)" }}>
          "{review.text}"
        </p>

        <div className="mt-auto flex flex-col gap-1" style={{ transform: "translateZ(10px)" }}>
           <span className="text-[#2b8ea0] font-sans font-bold text-xs hover:underline cursor-pointer inline-block w-max">
             {review.hashtags}
           </span>
           <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
             {review.date}
           </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
