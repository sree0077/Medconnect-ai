import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

// DNA Helix Component
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);

  // Create helix curves and points
  const { curve1, curve2, helixPoints1, helixPoints2 } = useMemo(() => {
    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];
    const helixPoints1: THREE.Vector3[] = [];
    const helixPoints2: THREE.Vector3[] = [];

    const radius = 1.2;
    const height = 8;
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 4; // 4 full rotations
      const y = (i / segments) * height - height / 2;

      // First helix strand
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      points1.push(new THREE.Vector3(x1, y, z1));
      helixPoints1.push(new THREE.Vector3(x1, y, z1));

      // Second helix strand (180 degrees offset)
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;
      points2.push(new THREE.Vector3(x2, y, z2));
      helixPoints2.push(new THREE.Vector3(x2, y, z2));
    }

    const curve1 = new THREE.CatmullRomCurve3(points1);
    const curve2 = new THREE.CatmullRomCurve3(points2);

    return { curve1, curve2, helixPoints1, helixPoints2 };
  }, []);

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* First helix strand - Deep blue crystalline */}
      <mesh>
        <tubeGeometry args={[curve1, 120, 0.1, 16, false]} />
        <meshPhysicalMaterial
          color="#1E3A8A"
          metalness={0.2}
          roughness={0.1}
          transmission={0.4}
          thickness={0.8}
          emissive="#1E3A8A"
          emissiveIntensity={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Second helix strand - Bright blue crystalline */}
      <mesh>
        <tubeGeometry args={[curve2, 120, 0.1, 16, false]} />
        <meshPhysicalMaterial
          color="#2563EB"
          metalness={0.2}
          roughness={0.1}
          transmission={0.4}
          thickness={0.8}
          emissive="#2563EB"
          emissiveIntensity={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Base pairs - connecting rungs */}
      {helixPoints1.map((point1, index) => {
        if (index % 8 === 0 && index < helixPoints2.length) {
          const point2 = helixPoints2[index];
          const midPoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
          const distance = point1.distanceTo(point2);

          return (
            <group key={index}>
              {/* Base pair spheres - Enhanced crystalline */}
              <mesh position={[point1.x, point1.y, point1.z]}>
                <sphereGeometry args={[0.15, 20, 20]} />
                <meshPhysicalMaterial
                  color="#3B82F6"
                  metalness={0.3}
                  roughness={0.05}
                  transmission={0.5}
                  thickness={0.6}
                  emissive="#3B82F6"
                  emissiveIntensity={0.25}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                />
              </mesh>

              <mesh position={[point2.x, point2.y, point2.z]}>
                <sphereGeometry args={[0.15, 20, 20]} />
                <meshPhysicalMaterial
                  color="#60A5FA"
                  metalness={0.3}
                  roughness={0.05}
                  transmission={0.5}
                  thickness={0.6}
                  emissive="#60A5FA"
                  emissiveIntensity={0.25}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                />
              </mesh>

              {/* Connecting rung - Enhanced */}
              <mesh position={[midPoint.x, midPoint.y, midPoint.z]}>
                <cylinderGeometry args={[0.06, 0.06, distance, 12]} />
                <meshPhysicalMaterial
                  color="#BFDBFE"
                  metalness={0.4}
                  roughness={0.1}
                  transmission={0.6}
                  thickness={0.4}
                  emissive="#BFDBFE"
                  emissiveIntensity={0.15}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
            </group>
          );
        }
        return null;
      })}
    </group>
  );
}

// Floating particles around DNA
function FloatingParticles() {
  const particlesRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 30; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ],
        scale: Math.random() * 0.5 + 0.1,
        color: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'][Math.floor(Math.random() * 4)],
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, index) => (
        <Float key={index} speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <mesh position={particle.position as [number, number, number]} scale={particle.scale}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshPhysicalMaterial
              color={particle.color}
              emissive={particle.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Main DNA Hero Visualization Component
const DNAHeroVisualization: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px] relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Enhanced lighting setup for crystalline effect */}
        <ambientLight intensity={0.2} color="#E0F2FE" />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#3B82F6" />
        <pointLight position={[0, 0, 10]} intensity={1} color="#60A5FA" />
        <pointLight position={[5, -5, 0]} intensity={0.8} color="#1E40AF" />
        <spotLight
          position={[8, 8, 8]}
          angle={0.4}
          penumbra={1}
          intensity={1.5}
          color="#DBEAFE"
          castShadow
        />
        <spotLight
          position={[-8, -8, 8]}
          angle={0.4}
          penumbra={1}
          intensity={1.2}
          color="#3B82F6"
        />

        {/* DNA Structure */}
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <DNAHelix />
        </Float>

        {/* Floating particles */}
        <FloatingParticles />

        {/* Enhanced Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 1.3}
          minPolarAngle={Math.PI / 4}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

export default DNAHeroVisualization;
