import { useRef } from "react";
import { motion } from "motion/react";

interface EventItem {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
}

const EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Live Acoustic Nights",
    date: "Every Friday, 7 PM",
    description: "Relax to intimate live unplugged acoustics while dining in our main lounge.",
    image: "/images/combo_deal.png",
  },
  {
    id: 2,
    title: "Truffle Tasting Weekend",
    date: "This Month, Nov 14-16",
    description: "A custom 5-course tasting menu dedicated to fresh black truffle creations.",
    image: "/images/truffle_dish.png",
  },
  {
    id: 3,
    title: "Private Dining Packages",
    date: "Available Year-Round",
    description: "Exclusive access to our private dining room and custom menus for celebrations.",
    image: "/images/burger2.png",
  },
  {
    id: 4,
    title: "Festive Season Feast",
    date: "Dec 20 - Jan 2",
    description: "Celebrate the holiday season with special gourmet family platters and chef creations.",
    image: "/images/pizza2.png",
  },
];

export function Events({ 
  triggerToast,
  onTriggerAuthGate
}: { 
  triggerToast: (msg: string) => void;
  onTriggerAuthGate: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-28 bg-dark-radial-center relative z-10 font-sans select-none overflow-hidden border-y border-white/5 text-cream">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow bloom centered behind the events rail */}
      <motion.div
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.12, 0.16, 0.12]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
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
                What's On
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.05] tracking-tight">
              Upcoming <span className="font-extrabold italic text-orange-500">Experiences</span>
            </h2>
            <p className="text-cream/70 text-base md:text-lg font-normal leading-relaxed max-w-md">
              Explore our scheduled events, guest tastings, and private booking packages.
            </p>
          </motion.div>
        </div>

        {/* Horizontal Scroll Snap Rail (Drag-enabled via custom cursor indicator) */}
        <div
          ref={scrollRef}
          data-drag-zone
          className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing pb-8 w-full overflow-y-visible relative z-10"
        >
          {EVENTS.map((event, idx) => (
            <div
              key={event.id}
              className="snap-center shrink-0 w-[300px] md:w-[380px] overflow-visible"
            >
              <EventCard 
                event={event} 
                index={idx} 
                triggerToast={triggerToast} 
                onTriggerAuthGate={onTriggerAuthGate} 
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function EventCard({ 
  event, 
  index, 
  triggerToast,
  onTriggerAuthGate
}: { 
  event: EventItem; 
  index: number; 
  triggerToast: (msg: string) => void; 
  onTriggerAuthGate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-[320px] rounded-[2rem] overflow-hidden border border-white/10 group cursor-default shadow-lg bg-white/5"
    >
      <img
        src={event.image}
        alt={event.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a08] via-[#0d0a08]/40 to-transparent z-10" />

      {/* Info Container */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end z-20 select-none pointer-events-none">
        <span className="text-[9px] uppercase font-mono tracking-widest text-orange-500 font-bold">
          {event.date}
        </span>
        <h3 className="text-lg md:text-xl font-bold font-serif text-white mt-1 leading-snug group-hover:text-orange-400 transition-colors">
          {event.title}
        </h3>
        <p className="text-cream/70 text-sm mt-2 leading-relaxed line-clamp-3 font-normal">
          {event.description}
        </p>

        {/* Link / Action */}
        <div
          onClick={onTriggerAuthGate}
          className="mt-4 flex items-center gap-1.5 text-xs text-orange-500 font-bold group-hover:underline pointer-events-auto w-max cursor-pointer"
        >
          <span>Explore Details</span>
          <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
        </div>
      </div>
    </motion.div>
  );
}
