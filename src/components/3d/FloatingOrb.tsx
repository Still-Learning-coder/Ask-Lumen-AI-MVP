import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Orb() {
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      orbRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <Sphere ref={orbRef} args={[1, 64, 64]} scale={2}>
      <MeshDistortMaterial
        color="#00ffff"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive="#00ffff"
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

export const FloatingOrb = () => {
  return (
    <div className="absolute right-10 top-1/4 w-64 h-64 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Orb />
      </Canvas>
    </div>
  );
};
