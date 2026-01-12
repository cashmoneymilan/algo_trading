'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { getOrderBookState } from '@/stores/orderBookStore';
import { colors } from '@/config/colors';

interface OrderBookMeshProps {
  symbol: string;
  maxLevels?: number;
}

// Stable demo data for visualization when no real data is available
const DEMO_BIDS = [
  { price: 259.00, size: 450 }, { price: 258.95, size: 320 }, { price: 258.90, size: 580 },
  { price: 258.85, size: 210 }, { price: 258.80, size: 390 }, { price: 258.75, size: 270 },
  { price: 258.70, size: 510 }, { price: 258.65, size: 180 }, { price: 258.60, size: 420 },
  { price: 258.55, size: 350 }, { price: 258.50, size: 600 }, { price: 258.45, size: 280 },
  { price: 258.40, size: 470 }, { price: 258.35, size: 190 }, { price: 258.30, size: 530 },
];
const DEMO_ASKS = [
  { price: 259.10, size: 380 }, { price: 259.15, size: 290 }, { price: 259.20, size: 520 },
  { price: 259.25, size: 160 }, { price: 259.30, size: 440 }, { price: 259.35, size: 350 },
  { price: 259.40, size: 230 }, { price: 259.45, size: 410 }, { price: 259.50, size: 310 },
  { price: 259.55, size: 480 }, { price: 259.60, size: 200 }, { price: 259.65, size: 550 },
  { price: 259.70, size: 260 }, { price: 259.75, size: 400 }, { price: 259.80, size: 340 },
];

export function OrderBookMesh({ symbol, maxLevels = 50 }: OrderBookMeshProps) {
  const bidMeshRef = useRef<THREE.InstancedMesh>(null);
  const askMeshRef = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const initializedRef = useRef(false);

  // Reusable objects to avoid garbage collection
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Materials - use MeshStandardMaterial for better visuals
  const bidMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.dark.market.bullish,
        transparent: true,
        opacity: 0.85,
        roughness: 0.3,
        metalness: 0.1,
      }),
    []
  );

  const askMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.dark.market.bearish,
        transparent: true,
        opacity: 0.85,
        roughness: 0.3,
        metalness: 0.1,
      }),
    []
  );

  // Geometry - rounded box for nicer appearance
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.8, 1, 0.8);
    // Translate geometry so it grows upward from y=0
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  // Track last update time for animation
  const lastUpdateRef = useRef(0);

  // Update instances using getState() - CRITICAL for performance
  // Never use React state in useFrame to avoid re-renders at 60fps
  useFrame(() => {
    const state = getOrderBookState();
    const hasRealData = state.bids.length > 0 || state.asks.length > 0;

    // Use demo data if no real data available
    const bids = hasRealData ? state.bids : DEMO_BIDS;
    const asks = hasRealData ? state.asks : DEMO_ASKS;
    const lastUpdateTime = hasRealData ? state.lastUpdateTime : 0;

    // Only update if data has changed (or on initial render with demo data)
    if (lastUpdateTime === lastUpdateRef.current && initializedRef.current) return;
    lastUpdateRef.current = lastUpdateTime;
    initializedRef.current = true;

    if (!bidMeshRef.current || !askMeshRef.current) return;

    // Find max size for height normalization
    const allSizes = [...bids, ...asks].map((l) => l.size);
    const maxSize = Math.max(...allSizes, 1);

    // Scale factor for height visualization
    const heightScale = 5;

    // Update bid instances (green - left side)
    const bidCount = Math.min(bids.length, maxLevels);
    for (let i = 0; i < bidCount; i++) {
      const level = bids[i];
      const normalizedHeight = (level.size / maxSize) * heightScale + 0.1;

      // Position: spread bids to the left, indexed by price distance from mid
      const xPos = -((i + 1) * 1);

      tempObject.position.set(xPos, 0, 0);
      tempObject.scale.set(1, normalizedHeight, 1);
      tempObject.updateMatrix();

      bidMeshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color intensity based on size
      const intensity = 0.5 + (level.size / maxSize) * 0.5;
      tempColor.setStyle(colors.dark.market.bullish);
      tempColor.multiplyScalar(intensity);
      bidMeshRef.current.setColorAt(i, tempColor);
    }

    // Hide unused instances by scaling to 0
    for (let i = bidCount; i < maxLevels; i++) {
      tempObject.scale.set(0, 0, 0);
      tempObject.updateMatrix();
      bidMeshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    bidMeshRef.current.instanceMatrix.needsUpdate = true;
    if (bidMeshRef.current.instanceColor) {
      bidMeshRef.current.instanceColor.needsUpdate = true;
    }
    bidMeshRef.current.count = bidCount;

    // Update ask instances (red - right side)
    const askCount = Math.min(asks.length, maxLevels);
    for (let i = 0; i < askCount; i++) {
      const level = asks[i];
      const normalizedHeight = (level.size / maxSize) * heightScale + 0.1;

      // Position: spread asks to the right
      const xPos = (i + 1) * 1;

      tempObject.position.set(xPos, 0, 0);
      tempObject.scale.set(1, normalizedHeight, 1);
      tempObject.updateMatrix();

      askMeshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color intensity based on size
      const intensity = 0.5 + (level.size / maxSize) * 0.5;
      tempColor.setStyle(colors.dark.market.bearish);
      tempColor.multiplyScalar(intensity);
      askMeshRef.current.setColorAt(i, tempColor);
    }

    // Hide unused instances
    for (let i = askCount; i < maxLevels; i++) {
      tempObject.scale.set(0, 0, 0);
      tempObject.updateMatrix();
      askMeshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    askMeshRef.current.instanceMatrix.needsUpdate = true;
    if (askMeshRef.current.instanceColor) {
      askMeshRef.current.instanceColor.needsUpdate = true;
    }
    askMeshRef.current.count = askCount;

    // Request re-render since we're using on-demand rendering
    invalidate();
  });

  // Initial instance color setup
  useEffect(() => {
    if (bidMeshRef.current) {
      const colors = new Float32Array(maxLevels * 3);
      bidMeshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    }
    if (askMeshRef.current) {
      const colors = new Float32Array(maxLevels * 3);
      askMeshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    }
  }, [maxLevels]);

  return (
    <group>
      {/* Bid side (green) - instanced mesh for performance */}
      <instancedMesh
        ref={bidMeshRef}
        args={[geometry, bidMaterial, maxLevels]}
        frustumCulled={false}
      />

      {/* Ask side (red) - instanced mesh */}
      <instancedMesh
        ref={askMeshRef}
        args={[geometry, askMaterial, maxLevels]}
        frustumCulled={false}
      />

      {/* Labels */}
      <Text
        position={[-10, 6, 0]}
        fontSize={0.8}
        color={colors.dark.market.bullish}
        anchorX="center"
        anchorY="middle"
      >
        BIDS
      </Text>
      <Text
        position={[10, 6, 0]}
        fontSize={0.8}
        color={colors.dark.market.bearish}
        anchorX="center"
        anchorY="middle"
      >
        ASKS
      </Text>
      <Text
        position={[0, 7, 0]}
        fontSize={1}
        color={colors.dark.text.primary}
        anchorX="center"
        anchorY="middle"
      >
        {symbol}
      </Text>

      {/* Midpoint indicator */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.1, 3]} />
        <meshStandardMaterial
          color={colors.dark.accent.primary}
          emissive={colors.dark.accent.primary}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
