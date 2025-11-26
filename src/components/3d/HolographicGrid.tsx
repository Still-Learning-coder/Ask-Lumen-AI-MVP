import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

function AnimatedGrid() {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      gridRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 2;
    }
  });

  return (
    <group ref={gridRef} position={[0, -5, 0]}>
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#00ffff"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#0099ff"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </group>
  );
}

export const HolographicGrid = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 5, 15], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <AnimatedGrid />
      </Canvas>
    </div>
  );
};
