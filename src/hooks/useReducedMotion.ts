'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion.
 * Returns true if the user has enabled reduced motion in their OS settings.
 * Use this to disable or simplify animations for accessibility.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook that returns animation configuration based on reduced motion preference.
 * Provides safe defaults that can be used directly in animation libraries.
 */
export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Duration in ms - use 0 or very short for reduced motion
    duration: prefersReducedMotion ? 0 : 300,
    // Spring config for react-spring
    springConfig: prefersReducedMotion
      ? { duration: 0 }
      : { tension: 200, friction: 20 },
    // Transition config
    transition: prefersReducedMotion
      ? 'none'
      : 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  };
}
