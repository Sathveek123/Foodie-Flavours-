import { useEffect, useState, useRef } from "react";
import { useInView } from "motion/react";

interface CounterProps {
  value: string;
  duration?: number;
}

function AnimatedCounter({ value, duration = 1200 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayVal, setDisplayVal] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numericMatch = value.match(/[\d,]+/);
    if (!numericMatch) {
      setDisplayVal(value);
      return;
    }

    const rawString = numericMatch[0].replace(/,/g, "");
    const targetNum = parseInt(rawString, 10);
    const suffix = value.replace(numericMatch[0], "");

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const currentNum = Math.floor(easeProgress * targetNum);

      const formattedNum = numericMatch[0].includes(",")
        ? currentNum.toLocaleString()
        : currentNum.toString();

      setDisplayVal(`${formattedNum}${suffix}`);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayVal}</span>;
}

export function StatsStrip() {
  const stats = [
    { value: "5,000+", label: "Orders Delivered" },
    { value: "100+", label: "Menu Items" },
    { value: "8+", label: "Years of Craft" },
    { value: "12,000+", label: "Happy Guests" },
  ];

  return (
    <section className="py-12 bg-[#45101f] border-t border-white/5 relative z-10 font-sans select-none overflow-hidden text-cream">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1 relative z-10">
              <div className="text-4xl md:text-5xl font-serif font-black text-orange-500">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-[10px] md:text-xs text-cream/70 uppercase tracking-[0.2em] font-mono font-bold mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
