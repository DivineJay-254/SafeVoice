import { useEffect, useRef } from 'react';

interface UseDeviceShakeOptions {
  onDoubleShake: () => void;
  threshold?: number; // Acceleration change threshold
  timeout?: number; // Max time between the two shakes in ms
  minInterval?: number; // Min time between shakes to debounce
  enabled?: boolean;
}

export const useDeviceShake = ({
  onDoubleShake,
  threshold = 16,
  timeout = 1500,
  minInterval = 200,
  enabled = true
}: UseDeviceShakeOptions) => {
  const lastShakeTimeRef = useRef<number>(0);
  const shakeCountRef = useRef<number>(0);
  const lastXRef = useRef<number | null>(null);
  const lastYRef = useRef<number | null>(null);
  const lastZRef = useRef<number | null>(null);
  const onDoubleShakeRef = useRef(onDoubleShake);

  useEffect(() => {
    onDoubleShakeRef.current = onDoubleShake;
  }, [onDoubleShake]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Request iOS permission if available
    if (
      typeof (DeviceMotionEvent as any) !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      // Permission request is typically triggered on user gesture
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const currentX = acc.x;
      const currentY = acc.y;
      const currentZ = acc.z;

      if (lastXRef.current !== null && lastYRef.current !== null && lastZRef.current !== null) {
        const deltaX = Math.abs(currentX - lastXRef.current);
        const deltaY = Math.abs(currentY - lastYRef.current);
        const deltaZ = Math.abs(currentZ - lastZRef.current);
        const totalChange = deltaX + deltaY + deltaZ;

        if (totalChange > threshold) {
          const now = Date.now();
          const elapsed = now - lastShakeTimeRef.current;

          if (elapsed > minInterval) {
            if (elapsed <= timeout && shakeCountRef.current >= 1) {
              // Second shake confirmed!
              shakeCountRef.current = 0;
              lastShakeTimeRef.current = 0;
              onDoubleShakeRef.current();
            } else {
              // First shake registered
              shakeCountRef.current = 1;
              lastShakeTimeRef.current = now;
            }
          }
        }
      }

      lastXRef.current = currentX;
      lastYRef.current = currentY;
      lastZRef.current = currentZ;
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });

    // Keyboard simulation fallback: double pressing Escape key within 1 second
    let lastEscTime = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscTime < 1000) {
          onDoubleShakeRef.current();
          lastEscTime = 0;
        } else {
          lastEscTime = now;
        }
      }
    };
    // Simulated double-shake event listener (for testing and quick action triggers)
    const handleSimulatedShake = () => {
      onDoubleShakeRef.current();
    };
    window.addEventListener('juasafety:double-shake', handleSimulatedShake);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('juasafety:double-shake', handleSimulatedShake);
    };
  }, [enabled, threshold, timeout, minInterval]);
};

export const triggerDoubleShakeSimulation = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('juasafety:double-shake'));
  }
};

export const requestMotionPermission = async (): Promise<boolean> => {
  if (
    typeof (DeviceMotionEvent as any) !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    try {
      const response = await (DeviceMotionEvent as any).requestPermission();
      return response === 'granted';
    } catch {
      return false;
    }
  }
  return true;
};
