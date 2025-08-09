import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { isMobileDevice } from "../../utils/isMobile";


// Error boundary for mobile WebGL issues
class BrainErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    console.warn('Brain Error Boundary triggered:', error);
    // Don't show error state, just log and continue
    return { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Brain Canvas Error (handled silently):', error, errorInfo);

    // Check if it's a BufferGeometry NaN error
    if (error.message && error.message.includes('BufferGeometry') && error.message.includes('NaN')) {
      console.warn('BufferGeometry NaN error caught and handled silently');
    }
  }

  render() {
    // Always render children - no loading fallback UI
    return this.props.children;
  }
}

// Ultra-safe math utilities with multiple fallback layers
const safeMath = {
  sin: (x) => {
    try {
      if (typeof x !== 'number') x = parseFloat(x) || 0;
      const result = Math.sin(x);
      return (isNaN(result) || !isFinite(result)) ? 0 : result;
    } catch (e) {
      return 0;
    }
  },
  cos: (x) => {
    try {
      if (typeof x !== 'number') x = parseFloat(x) || 0;
      const result = Math.cos(x);
      return (isNaN(result) || !isFinite(result)) ? 0 : result;
    } catch (e) {
      return 0;
    }
  },
  random: () => {
    try {
      const result = Math.random();
      return (isNaN(result) || !isFinite(result)) ? 0.5 : result;
    } catch (e) {
      return 0.5;
    }
  },
  clamp: (value, min, max) => {
    try {
      if (typeof value !== 'number') value = parseFloat(value) || 0;
      if (typeof min !== 'number') min = parseFloat(min) || -1;
      if (typeof max !== 'number') max = parseFloat(max) || 1;
      if (isNaN(value) || !isFinite(value)) return (min + max) / 2;
      if (isNaN(min) || !isFinite(min)) min = -1;
      if (isNaN(max) || !isFinite(max)) max = 1;
      return Math.max(min, Math.min(max, value));
    } catch (e) {
      return 0;
    }
  },
  // Additional safe operations
  sqrt: (x) => {
    try {
      if (typeof x !== 'number') x = parseFloat(x) || 0;
      if (x < 0) return 0;
      const result = Math.sqrt(x);
      return (isNaN(result) || !isFinite(result)) ? 0 : result;
    } catch (e) {
      return 0;
    }
  },
  pow: (base, exp) => {
    try {
      if (typeof base !== 'number') base = parseFloat(base) || 0;
      if (typeof exp !== 'number') exp = parseFloat(exp) || 0;
      const result = Math.pow(base, exp);
      return (isNaN(result) || !isFinite(result)) ? 0 : result;
    } catch (e) {
      return 0;
    }
  }
};

const Particles = () => {
  const meshRef = useRef();
  // Detect mobile for performance optimization
  const isMobile = isMobileDevice();
  const particleCount = isMobile ? 6000 : 10000; // Keep high particle count for rich visual effect

  // Create particle positions and properties with chaotic movement data
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    const frequencies = new Float32Array(particleCount);
    const amplitudes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Create particles very close to brain surface - even distribution
      // Use safer math operations for mobile compatibility
      const radius = 1.35 + safeMath.random() * 0.5;
      const theta = safeMath.random() * Math.PI * 2;
      const phi = safeMath.random() * Math.PI;

      // Generate base spherical coordinates with ultra-safe math
      let x = radius * safeMath.sin(phi) * safeMath.cos(theta);
      let y = radius * safeMath.sin(phi) * safeMath.sin(theta);
      let z = radius * safeMath.cos(phi);

      // Validate each coordinate and provide fallbacks
      if (!isFinite(x) || isNaN(x)) x = (safeMath.random() - 0.5) * 2;
      if (!isFinite(y) || isNaN(y)) y = (safeMath.random() - 0.5) * 2;
      if (!isFinite(z) || isNaN(z)) z = (safeMath.random() - 0.5) * 2;

      // Apply brain-shaped distribution with ultra-safe clamping
      let finalX = safeMath.clamp(x * 1.15, -5, 5);
      let finalY = safeMath.clamp(y * 0.85 + 0.05, -5, 5);
      let finalZ = safeMath.clamp(z * 1.05, -5, 5);

      // Final validation before assignment
      if (!isFinite(finalX) || isNaN(finalX)) finalX = (safeMath.random() - 0.5) * 3;
      if (!isFinite(finalY) || isNaN(finalY)) finalY = (safeMath.random() - 0.5) * 3;
      if (!isFinite(finalZ) || isNaN(finalZ)) finalZ = (safeMath.random() - 0.5) * 3;

      // Ensure no NaN values with triple-checked robust fallbacks
      positions[i * 3] = finalX;
      positions[i * 3 + 1] = finalY;
      positions[i * 3 + 2] = finalZ;

      // White/light grey particles to match the reference image
      const brightness = safeMath.clamp(0.6 + safeMath.random() * 0.4, 0.6, 1.0);
      colors[i * 3] = brightness; // R
      colors[i * 3 + 1] = brightness; // G
      colors[i * 3 + 2] = brightness; // B

      sizes[i] = safeMath.clamp(safeMath.random() * 1.5 + 0.5, 0.5, 2.0);

      // Chaotic movement properties for neural-like activity with safe ranges
      velocities[i * 3] = safeMath.clamp((safeMath.random() - 0.5) * 0.02, -0.01, 0.01);
      velocities[i * 3 + 1] = safeMath.clamp((safeMath.random() - 0.5) * 0.02, -0.01, 0.01);
      velocities[i * 3 + 2] = safeMath.clamp((safeMath.random() - 0.5) * 0.02, -0.01, 0.01);

      phases[i] = safeMath.clamp(safeMath.random() * Math.PI * 2, 0, Math.PI * 2);
      frequencies[i] = safeMath.clamp(0.5 + safeMath.random() * 2, 0.5, 2.5);
      amplitudes[i] = safeMath.clamp(0.001 + safeMath.random() * 0.004, 0.001, 0.005);
    }

    // Final comprehensive validation pass to ensure NO NaN values exist
    console.log('Performing final validation of particle arrays...');
    let correctedCount = 0;

    // Validate positions array
    for (let i = 0; i < positions.length; i++) {
      if (!isFinite(positions[i]) || isNaN(positions[i])) {
        positions[i] = (Math.random() - 0.5) * 2;
        correctedCount++;
      }
    }

    // Validate colors array
    for (let i = 0; i < colors.length; i++) {
      if (!isFinite(colors[i]) || isNaN(colors[i])) {
        colors[i] = 0.8;
        correctedCount++;
      }
    }

    // Validate sizes array
    for (let i = 0; i < sizes.length; i++) {
      if (!isFinite(sizes[i]) || isNaN(sizes[i])) {
        sizes[i] = 1.0;
        correctedCount++;
      }
    }

    // Validate velocities array
    for (let i = 0; i < velocities.length; i++) {
      if (!isFinite(velocities[i]) || isNaN(velocities[i])) {
        velocities[i] = 0;
        correctedCount++;
      }
    }

    // Validate phases array
    for (let i = 0; i < phases.length; i++) {
      if (!isFinite(phases[i]) || isNaN(phases[i])) {
        phases[i] = 0;
        correctedCount++;
      }
    }

    // Validate frequencies array
    for (let i = 0; i < frequencies.length; i++) {
      if (!isFinite(frequencies[i]) || isNaN(frequencies[i])) {
        frequencies[i] = 1.0;
        correctedCount++;
      }
    }

    // Validate amplitudes array
    for (let i = 0; i < amplitudes.length; i++) {
      if (!isFinite(amplitudes[i]) || isNaN(amplitudes[i])) {
        amplitudes[i] = 0.002;
        correctedCount++;
      }
    }

    if (correctedCount > 0) {
      console.warn(`Corrected ${correctedCount} invalid values in particle arrays`);
    } else {
      console.log('All particle values validated successfully - no NaN values found');
    }

    return { positions, colors, sizes, velocities, phases, frequencies, amplitudes };
  }, [particleCount]);

  // Chaotic neural-like particle animation with mobile-safe math
  useFrame((state) => {
    if (meshRef.current) {
      try {
        // MOBILE OPTIMIZATION: Disable particle mesh rotation on mobile to save computational overhead
        if (!isMobile) {
          // Slower rotation for better performance (desktop only)
          const rotationY = safeMath.clamp(state.clock.elapsedTime * 0.05, -Math.PI * 2, Math.PI * 2);
          meshRef.current.rotation.y = rotationY;
        }

        // Adaptive frame skipping based on performance
        const frameSkip = isMobile ? 3 : 1; // More aggressive skipping on mobile
        if (Math.floor(state.clock.elapsedTime * 60) % frameSkip !== 0) return;

        const positions = meshRef.current.geometry.attributes.position.array;
        const time = safeMath.clamp(state.clock.elapsedTime, 0, 1000); // Prevent time overflow

        // Process particles in batches for better performance
        const batchSize = isMobile ? 500 : 1000;
        const currentBatch = Math.floor(state.clock.elapsedTime * 10) % Math.ceil(particleCount / batchSize);
        const startIndex = currentBatch * batchSize;
        const endIndex = Math.min(startIndex + batchSize, particleCount);

        for (let i = startIndex; i < endIndex; i++) {
          const i3 = i * 3;

          // Get particle's unique properties with validation
          const phase = particles.phases[i] || 0;
          const frequency = particles.frequencies[i] || 1;
          const amplitude = particles.amplitudes[i] || 0.001;

          // Create chaotic movement with multiple noise sources using safe math
          const noiseX = safeMath.clamp(safeMath.sin(time * frequency + phase) * amplitude, -0.1, 0.1);
          const noiseY = safeMath.clamp(safeMath.cos(time * frequency * 1.3 + phase + 1.5) * amplitude, -0.1, 0.1);
          const noiseZ = safeMath.clamp(safeMath.sin(time * frequency * 0.8 + phase + 3) * amplitude, -0.1, 0.1);

          // Add random jitter for neural firing effect with safe bounds
          const jitterX = safeMath.clamp((safeMath.random() - 0.5) * 0.0008, -0.0004, 0.0004);
          const jitterY = safeMath.clamp((safeMath.random() - 0.5) * 0.0008, -0.0004, 0.0004);
          const jitterZ = safeMath.clamp((safeMath.random() - 0.5) * 0.0008, -0.0004, 0.0004);

          // Add turbulent motion with varying intensities using safe math
          const turbulence = safeMath.clamp(safeMath.sin(time * 3 + i * 0.1) * 0.002, -0.002, 0.002);
          const turbulentX = safeMath.clamp(safeMath.sin(time * 2.1 + i * 0.05) * turbulence, -0.002, 0.002);
          const turbulentY = safeMath.clamp(safeMath.cos(time * 1.7 + i * 0.08) * turbulence, -0.002, 0.002);
          const turbulentZ = safeMath.clamp(safeMath.sin(time * 2.3 + i * 0.03) * turbulence, -0.002, 0.002);

          // Random directional changes (neural firing simulation) with safe math
          if (safeMath.random() < 0.002) { // 0.2% chance per frame for sudden movement
            particles.velocities[i3] = safeMath.clamp((safeMath.random() - 0.5) * 0.03, -0.015, 0.015);
            particles.velocities[i3 + 1] = safeMath.clamp((safeMath.random() - 0.5) * 0.03, -0.015, 0.015);
            particles.velocities[i3 + 2] = safeMath.clamp((safeMath.random() - 0.5) * 0.03, -0.015, 0.015);
          }

          // Apply velocity decay for more natural movement with validation
          particles.velocities[i3] = safeMath.clamp((particles.velocities[i3] || 0) * 0.98, -1, 1);
          particles.velocities[i3 + 1] = safeMath.clamp((particles.velocities[i3 + 1] || 0) * 0.98, -1, 1);
          particles.velocities[i3 + 2] = safeMath.clamp((particles.velocities[i3 + 2] || 0) * 0.98, -1, 1);

          // Get current positions with validation
          const currentX = positions[i3] || 0;
          const currentY = positions[i3 + 1] || 0;
          const currentZ = positions[i3 + 2] || 0;

          // Combine all movement types for chaotic neural activity with bounds checking
          const newX = safeMath.clamp(currentX + noiseX + jitterX + turbulentX + particles.velocities[i3], -10, 10);
          const newY = safeMath.clamp(currentY + noiseY + jitterY + turbulentY + particles.velocities[i3 + 1], -10, 10);
          const newZ = safeMath.clamp(currentZ + noiseZ + jitterZ + turbulentZ + particles.velocities[i3 + 2], -10, 10);

          // Set validated positions
          positions[i3] = newX;
          positions[i3 + 1] = newY;
          positions[i3 + 2] = newZ;
        }

        // Final validation before updating geometry
        const positionArray = meshRef.current.geometry.attributes.position.array;
        let hasNaN = false;

        for (let i = 0; i < positionArray.length; i++) {
          if (isNaN(positionArray[i]) || !isFinite(positionArray[i])) {
            hasNaN = true;
            positionArray[i] = (Math.random() - 0.5) * 2; // Safe fallback value
          }
        }

        if (hasNaN) {
          console.warn('NaN values detected and corrected in particle positions');
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true;

        // Force geometry bounds recalculation with error handling
        try {
          meshRef.current.geometry.computeBoundingSphere();
        } catch (error) {
          console.warn('Error computing bounding sphere, skipping:', error);
        }
      } catch (error) {
        console.warn('Error in brain animation frame:', error);
      }
    }
  });

  // Custom geometry component with NaN protection
  const SafeBufferGeometry = () => {
    const geometryRef = useRef();

    React.useEffect(() => {
      if (geometryRef.current) {
        try {
          // Override computeBoundingSphere to handle NaN values
          const originalComputeBoundingSphere = geometryRef.current.computeBoundingSphere;
          geometryRef.current.computeBoundingSphere = function() {
            try {
              // Validate position array before computing bounding sphere
              const positionArray = this.attributes.position.array;
              let hasNaN = false;

              for (let i = 0; i < positionArray.length; i++) {
                if (!isFinite(positionArray[i]) || isNaN(positionArray[i])) {
                  positionArray[i] = (Math.random() - 0.5) * 2;
                  hasNaN = true;
                }
              }

              if (hasNaN) {
                console.warn('NaN values detected and corrected in geometry before bounding sphere computation');
                this.attributes.position.needsUpdate = true;
              }

              // Call original method
              return originalComputeBoundingSphere.call(this);
            } catch (error) {
              console.warn('Error in computeBoundingSphere, using fallback:', error);
              // Create a safe fallback bounding sphere
              this.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 5);
            }
          };
        } catch (error) {
          console.warn('Error setting up safe geometry:', error);
        }
      }
    }, []);

    return (
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
    );
  };

  return (
    <points ref={meshRef}>
      <SafeBufferGeometry />
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Brain = () => {
  const brain = useGLTF("./brain/particle_ai_brain.gltf");
  const isMobile = isMobileDevice();

  // Apply greyish material to the brain
  React.useEffect(() => {
    if (brain.scene) {
      brain.scene.traverse((child) => {
        if (child.isMesh) {
          // Clean, smooth brain material with natural lighting-based gradation
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.02, 0.02, 0.02), // Pure black/very dark base
            metalness: 0.05, // Minimal metalness for organic appearance
            roughness: 0.7, // Smooth but not reflective
            emissive: new THREE.Color(0, 0, 0), // No artificial glow
            // Let natural lighting create depth and shadows
          });

          // No wireframe or overlay meshes - clean smooth surface only
        }
      });
    }
  }, [brain.scene]);

  return (
    <group>
      <primitive object={brain.scene} scale={1.2} position-y={0} rotation-y={0} />
      {/* Only render particles on desktop */}
      {!isMobile && <Particles />}
    </group>
  );
};

const BrainCanvas = () => {
  // Detect mobile devices for performance optimization
  const isMobile = isMobileDevice();

  return (
    <Canvas
      shadows={!isMobile} // Disable shadows on mobile
      frameloop={isMobile ? 'demand' : 'always'} // Only render when needed on mobile
      dpr={isMobile ? [1, 1.5] : [1, 2]} // Optimized DPR for quality vs performance
      gl={{
        preserveDrawingBuffer: false, // Better performance
        antialias: false, // Disable antialiasing for better performance
        powerPreference: isMobile ? "low-power" : "high-performance",
        failIfMajorPerformanceCaveat: false,
        alpha: true,
        premultipliedAlpha: false,
        stencil: false,
        depth: true
      }}
      onCreated={({ gl }) => {
        console.log('Brain canvas created for', isMobile ? 'mobile' : 'desktop');

        // Mobile-specific optimizations
        if (isMobile) {
          gl.setPixelRatio(1); // Force lower pixel ratio
          gl.outputEncoding = THREE.sRGBEncoding;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }

        // Error handling for WebGL context loss
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          console.warn('Brain WebGL context lost, preventing default behavior');
          event.preventDefault();
        });

        gl.domElement.addEventListener('webglcontextrestored', () => {
          console.log('Brain WebGL context restored');
        });
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [-4, 3, 6],
      }}
    >
      <Suspense fallback={null}>
        <OrbitControls
          autoRotate={!isMobile} // MOBILE OPTIMIZATION: Disable brain rotation on mobile to save computational overhead
          autoRotateSpeed={isMobile ? 0 : 2} // No rotation on mobile, normal speed on desktop
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Brain />

        <Preload all />
      </Suspense>
    </Canvas>
  );
};

// Wrap with error boundary for mobile safety - ALWAYS show the 3D brain animation
const SafeBrainCanvas = () => {
  return (
    <BrainErrorBoundary>
      <BrainCanvas />
    </BrainErrorBoundary>
  );
};

export default SafeBrainCanvas;
