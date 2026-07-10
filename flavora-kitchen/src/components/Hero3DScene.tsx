import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

// Public image URLs — served from /public/images/ (no space-in-path issues)
const SLIDE_IMAGES = [
  "/images/burger1.png",
  "/images/pizza1.png",
  "/images/kebab1.png",
  "/images/fries1.png",
  "/images/pasta1.png",
  "/images/springroll1.png",
  "/images/chicken1.png",
  "/images/chickenroll1.png",
  "/images/pizza2.png",
  "/images/burger2.png",
];

// Error boundary to prevent 3D Canvas rendering errors from crashing the entire app tree
class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Canvas Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-transparent">
          <div className="text-center p-4">
            <p className="text-cream/50 text-xs">Interactive 3D view temporarily unavailable.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PlateMaterials({ texture }: { texture: THREE.Texture }) {
  // Configure texture mapping
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return (
    <>
      {/* 1. Food Photo Circle */}
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[1.70, 64]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.25} 
          metalness={0.05} 
          transparent 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* 2. Cream Plate Rim */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1.78, 64]} />
        <meshStandardMaterial 
          color="#faf6f0" 
          roughness={0.15} 
          metalness={0.05} 
          transparent 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* 3. Gold Accent Outer Rim */}
      <mesh position={[0, 0, -0.015]}>
        <circleGeometry args={[1.81, 64]} />
        <meshStandardMaterial 
          color="#d4af37"
          roughness={0.1} 
          metalness={0.8} 
          transparent
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* 4. Soft drop shadow plane */}
      <mesh name="shadow" position={[0.07, -0.07, -0.03]}>
        <circleGeometry args={[1.81, 64]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.15} 
        />
      </mesh>
    </>
  );
}

function SceneContent({ activeIndex }: { activeIndex: number }) {
  const textures = useLoader(TextureLoader, SLIDE_IMAGES);
  
  const currentRef = useRef<THREE.Group>(null);
  const previousRef = useRef<THREE.Group>(null);
  
  const [current, setCurrent] = useState(activeIndex);
  const [previous, setPrevious] = useState<number | null>(null);
  
  const transitionProgress = useRef(1); // 1 means transition is complete
  const directionRef = useRef(1); // 1 = slide from right (next), -1 = slide from left (prev)
  const pointer = useRef({ x: 0, y: 0 });

  // Update indices, slide direction and reset transition progress when activeIndex changes
  useEffect(() => {
    if (activeIndex !== current) {
      // Loop-aware direction checking
      const diff = activeIndex - current;
      const isNext = (diff === 1) || (diff === -(SLIDE_IMAGES.length - 1));
      directionRef.current = isNext ? 1 : -1;

      setPrevious(current);
      setCurrent(activeIndex);
      transitionProgress.current = 0;
    }
  }, [activeIndex, current]);

  useFrame((state, delta) => {
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;

    // Advance transition progress
    if (transitionProgress.current < 1) {
      transitionProgress.current = Math.min(1, transitionProgress.current + delta * 2.2); // ~0.45s transition
    }

    const p = transitionProgress.current;
    const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out curve

    const direction = directionRef.current;
    const slideOffset = 4.8; // Spacing distance to slide completely off/on screen

    // 1. Animate incoming plate (current)
    if (currentRef.current) {
      const incomingOpacity = previous !== null ? eased : 1;
      const incomingScale = previous !== null ? 0.75 + eased * 0.25 : 1;
      const incomingX = previous !== null ? direction * slideOffset * (1 - eased) : 0;

      currentRef.current.position.x = incomingX;
      currentRef.current.scale.setScalar(incomingScale);

      // Micro-tilt pointing feedback (very gentle to prevent jiggling)
      const targetTiltX = -pointer.current.y * 0.04 * incomingOpacity;
      const targetTiltY = pointer.current.x * 0.04 * incomingOpacity;
      currentRef.current.rotation.x = THREE.MathUtils.lerp(currentRef.current.rotation.x, targetTiltX, 0.05);
      currentRef.current.rotation.y = THREE.MathUtils.lerp(currentRef.current.rotation.y, targetTiltY, 0.05);

      // Set material opacities
      currentRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.Material;
          if (child.name === "shadow") {
            mat.opacity = 0.15 * incomingOpacity;
          } else {
            mat.opacity = incomingOpacity;
          }
        }
      });
    }

    // 2. Animate outgoing plate (previous)
    if (previousRef.current) {
      if (previous !== null && p < 1) {
        previousRef.current.visible = true;
        const outgoingOpacity = 1 - eased;
        const outgoingScale = 1 - eased * 0.25;
        const outgoingX = -direction * slideOffset * eased;

        previousRef.current.position.x = outgoingX;
        previousRef.current.scale.setScalar(outgoingScale);

        // Micro-tilt pointing feedback
        const targetTiltX = -pointer.current.y * 0.04 * outgoingOpacity;
        const targetTiltY = pointer.current.x * 0.04 * outgoingOpacity;
        previousRef.current.rotation.x = THREE.MathUtils.lerp(previousRef.current.rotation.x, targetTiltX, 0.05);
        previousRef.current.rotation.y = THREE.MathUtils.lerp(previousRef.current.rotation.y, targetTiltY, 0.05);

        // Set material opacities
        previousRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.Material;
            if (child.name === "shadow") {
              mat.opacity = 0.15 * outgoingOpacity;
            } else {
              mat.opacity = outgoingOpacity;
            }
          }
        });
      } else {
        previousRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* 3 lights — no shadows to avoid GPU context loss */}
      <directionalLight position={[2, 4, 5]} intensity={1.2} color="#fffaf5" />
      <directionalLight position={[-3, -3, 2]} intensity={0.4} color="#ffffff" />
      <directionalLight position={[0, 0, -4]} intensity={0.3} color="#f97316" />

      {/* Outgoing Plate */}
      <group ref={previousRef} visible={false}>
        {previous !== null && (
          <PlateMaterials texture={textures[previous]} />
        )}
      </group>

      {/* Incoming Plate */}
      <group ref={currentRef}>
        <PlateMaterials texture={textures[current]} />
      </group>
    </>
  );
}

export default function Hero3DScene({ activeIndex = 0 }: { activeIndex?: number; scrollProgress?: number }) {
  return (
    <CanvasErrorBoundary>
      <Suspense fallback={null}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 1]}
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          style={{ pointerEvents: "none", background: "transparent" }}
        >
          <SceneContent activeIndex={activeIndex} />
        </Canvas>
      </Suspense>
    </CanvasErrorBoundary>
  );
}
