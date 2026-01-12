'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { OrderBookMesh } from './OrderBookMesh';
import { colors } from '@/config/colors';

interface SceneProps {
  symbol: string;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

export function Scene({ symbol }: SceneProps) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
        frameloop="demand" // On-demand rendering - saves resources
        style={{ background: colors.dark.background.surface1 }}
      >
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={50} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
          minDistance={5}
          maxDistance={50}
          target={[0, 0, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Content */}
        <Suspense fallback={<LoadingFallback />}>
          <OrderBookMesh symbol={symbol} />
        </Suspense>

        {/* Grid floor */}
        <Grid
          args={[100, 100]}
          position={[0, -0.01, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={colors.dark.background.surface3}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={colors.dark.border}
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Midpoint plane indicator */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 20]} />
          <meshBasicMaterial color={colors.dark.accent.primary} transparent opacity={0.5} />
        </mesh>
      </Canvas>
    </div>
  );
}
