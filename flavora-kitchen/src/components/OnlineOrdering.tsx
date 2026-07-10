import { motion } from "motion/react";
import { UtensilsCrossed, ShoppingBag, ChefHat, Bike } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Choose Your Dish",
    description: "Browse our dynamic gourmet selections and choose your culinary masterpieces.",
    icon: UtensilsCrossed,
  },
  {
    number: "02",
    title: "Place Your Order",
    description: "Submit your selection securely via card or UPI checkout in a few clicks.",
    icon: ShoppingBag,
  },
  {
    number: "03",
    title: "We Prepare Fresh",
    description: "Our fine-dining kitchen team immediately composes your plate from premium ingredients.",
    icon: ChefHat,
  },
  {
    number: "04",
    title: "Delivered to You",
    description: "Enjoy hot, restaurant-grade service delivered directly to your doorstep.",
    icon: Bike,
  },
];

export function OnlineOrdering() {
  return (
    <section className="py-28 bg-cream border-y border-[#1a1410]/5 relative z-10 font-sans overflow-hidden select-none">
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
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 bg-orange-500" />
              <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">
                How It Works
              </span>
              <span className="h-[1px] w-8 bg-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-warm-ink leading-[1.05] tracking-tight">
              Order in <span className="font-extrabold italic text-orange-500">Minutes</span>
            </h2>
            <p className="text-warm-ink/50 text-base max-w-md mx-auto">
              Follow our simple, seamless journey to dining like royalty at home.
            </p>
          </motion.div>
        </div>

        {/* Process Steps Rail */}
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Connector dashed line (Horizontal on desktop, Vertical on mobile) */}
          <div className="absolute top-[31px] left-[12%] right-[12%] h-[2px] border-t-2 border-dashed border-orange-500/20 z-0 hidden md:block" />
          <div className="absolute left-[31px] top-[40px] bottom-[40px] w-[2px] border-l-2 border-dashed border-orange-500/20 z-0 md:hidden" />

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-6 md:gap-5 relative"
                >
                  {/* Step Icon Container */}
                  <div className="w-16 h-16 rounded-2xl bg-cream border border-warm-ink/10 text-orange-500 flex items-center justify-center shrink-0 shadow-sm relative z-10 group-hover:border-orange-500/30 transition-colors">
                    <Icon size={24} />
                    {/* Number Badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow border border-cream">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-serif text-warm-ink tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-warm-ink/65 text-sm leading-relaxed md:max-w-[200px] font-normal">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
