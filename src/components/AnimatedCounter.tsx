import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 3,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const end = Number.isFinite(value) ? value : 0;
    if (Math.abs(end - start) < 0.0001) {
      setDisplay(end);
      return;
    }

    const duration = 240;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={`font-mono-num tabular-nums ${className}`}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
};
