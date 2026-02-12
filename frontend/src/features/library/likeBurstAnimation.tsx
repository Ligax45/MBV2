import { useState, useCallback } from 'react';
import './animation.css';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const RAY_COLORS = [
  '#ef4444', '#ec4899', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#f43f5e',
];
const RAY_DISTANCES = [8, 16, 24];
const TRAVEL_DISTANCE = 28;

const RAY_POINTS = RAY_ANGLES.flatMap((angle, rayIndex) =>
  RAY_DISTANCES.map((dist, dotIndex) => ({
    angle,
    dist,
    color: (rayIndex + dotIndex) % RAY_COLORS.length,
    delay: dotIndex * 40,
  })),
);

const HEART_PRESS_DURATION = 400;

export function useLikeAnimation() {
  const [burstKey, setBurstKey] = useState(0);
  const [isPressing, setIsPressing] = useState(false);

  const triggerLikeAnimation = useCallback(() => {
    setBurstKey((k) => k + 1);
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), HEART_PRESS_DURATION);
  }, []);

  return { burstKey, isPressing, triggerLikeAnimation };
}

type LikeBurstEffectProps = {
  burstKey: number;
};

export function LikeBurstEffect({ burstKey }: Readonly<LikeBurstEffectProps>) {
  if (burstKey === 0) return null;

  return (
    <div
      key={burstKey}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      {RAY_POINTS.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const dirX = Math.sin(rad);
        const dirY = -Math.cos(rad);
        const outX = dirX * TRAVEL_DISTANCE;
        const outY = dirY * TRAVEL_DISTANCE;
        const color = RAY_COLORS[p.color];
        return (
          <span
            key={`${p.angle}-${p.dist}`}
            className="absolute left-1/2 top-1/2 size-1 rounded-full animate-[particle-burst_0.5s_ease-out_forwards]"
            style={
              {
                '--out-x': `${outX}px`,
                '--out-y': `${outY}px`,
                backgroundColor: color,
                boxShadow: `0 0 3px ${color}99`,
                animationDelay: `${p.delay}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
