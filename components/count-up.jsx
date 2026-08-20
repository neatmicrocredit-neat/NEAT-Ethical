'use client'

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts up to `value` the first time it scrolls into view.
 * Renders the final value immediately for reduced-motion visitors and,
 * because the first paint uses the final value too, for anyone with JS off.
 */
export default function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    setCurrent(0);
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setCurrent(latest),
    });

    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  const formatted = current.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tabular-nums">{formatted}</span>
      {suffix}
    </span>
  );
}
