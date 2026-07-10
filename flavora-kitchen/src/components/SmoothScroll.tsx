import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

function HashScrollHandler() {
  const lenis = useLenis();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          lenis?.scrollTo(element, { offset: -80, duration: 1.2 });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 0.75,                                     // snappy and grounded (prevent slippery scroll)
        easing: (t) => 1 - Math.pow(1 - t, 3),            // ease-out-cubic: snappy decel, no overrun
        smoothWheel: true,
        wheelMultiplier: 0.8,                              // under 1x to prevent floaty velocity
        touchMultiplier: 1.0,                              // standard 1x touch map
        infinite: false,
        orientation: "vertical",
        gestureOrientation: "vertical",
      }}
    >
      <HashScrollHandler />
      {children}
    </ReactLenis>
  );
}
