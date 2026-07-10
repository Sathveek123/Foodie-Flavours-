import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Do you offer home delivery?",
    answer: "Yes, we provide gourmet home delivery within our coverage zones. All dishes are packed in custom insulated, temperature-controlled containers to preserve physical presentation and lock in flavors.",
  },
  {
    question: "What are your operating hours?",
    answer: "We welcome guests daily. Lunch service runs from 12:00 PM to 4:00 PM, and dinner service is hosted from 6:30 PM to 11:30 PM. Our delivery service operates continuously from 11:30 AM to 11:00 PM.",
  },
  {
    question: "Is parking available at the restaurant?",
    answer: "Yes, we offer complimentary secure valet parking for all dine-in guests. Simply drive up to our main entrance court and our service staff will assist you.",
  },
  {
    question: "Do you provide catering for events?",
    answer: "Yes. Our culinary team composes bespoke catering menus for private residences, corporate gatherings, and boutique events. Contact our concierge desk to schedule a tasting consultation.",
  },
  {
    question: "Can I make a same-day table reservation?",
    answer: "Yes, same-day bookings are accepted via our online table reservation system or phone concierge, subject to real-time slot availability. We recommend booking in advance for weekend dinners.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We support all major international credit/debit cards, Google Pay, Razorpay UPI transfers, Apple Pay, and secure contactless digital checkouts.",
  },
  {
    question: "Are there vegetarian and allergen-friendly options?",
    answer: "Absolutely. Our menu is structured with clear dietary markers (Veg, Non-Veg, Gluten-Free, Allergens). Our chefs can customize dishes to accommodate specific allergen constraints; please note these when reserving.",
  },
];

export function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-28 bg-cream relative z-10 font-sans select-none overflow-hidden border-b border-warm-ink/5">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
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
                Questions
              </span>
              <span className="h-[1px] w-8 bg-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-warm-ink leading-[1.05] tracking-tight">
              Frequently <span className="font-extrabold italic text-orange-500">Asked</span>
            </h2>
            <p className="text-warm-ink/70 text-base md:text-lg font-normal leading-relaxed max-w-md mx-auto">
              Got queries? Find answers to our most popular dining and delivery inquiries.
            </p>
          </motion.div>
        </div>

        {/* Custom Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.08, duration: 0.6, ease: "easeOut" }}
                className="border-b border-warm-ink/10"
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full py-6 flex justify-between items-center text-left text-warm-ink hover:text-orange-500 transition-colors gap-6 cursor-pointer"
                >
                  <span className="text-base md:text-lg font-bold font-serif tracking-tight leading-snug">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-8 h-8 rounded-full bg-warm-ink/5 hover:bg-orange-500/10 flex items-center justify-center shrink-0 transition-colors"
                  >
                    <ChevronDown size={16} className="text-orange-500" />
                  </motion.div>
                </button>

                {/* Accordion Body content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pr-12 text-warm-ink/65 text-sm leading-relaxed font-normal">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
