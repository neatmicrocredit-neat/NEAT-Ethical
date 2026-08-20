'use client'

import { motion, useReducedMotion } from "motion/react";

/**
 * Scroll-reveal primitives for the public pages.
 *
 * Wrap a block in <RevealGroup> and mark the children that should stagger in
 * with <Reveal>. Reveal only declares variants, so it needs a RevealGroup
 * ancestor to drive it (or pass `standalone` to let it drive itself).
 *
 * Everything collapses to a plain fade — or to nothing at all — when the
 * visitor asks for reduced motion.
 */

const MOVE = 26;

export function useRevealVariants(distance = MOVE) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.2 } },
    };
  }

  return {
    hidden: { opacity: 0, y: distance },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
}

export function RevealGroup({
  as = "div",
  stagger = 0.12,
  delayChildren = 0,
  amount = 0.2,
  once = true,
  children,
  ...rest
}) {
  const Component = motion[as] ?? motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren } } }}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Reveal({ as = "div", distance = MOVE, standalone = false, children, ...rest }) {
  const Component = motion[as] ?? motion.div;
  const variants = useRevealVariants(distance);
  const driver = standalone
    ? { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.2 } }
    : {};

  return (
    <Component variants={variants} {...driver} {...rest}>
      {children}
    </Component>
  );
}

/**
 * Infinite/ambient animations (orbits, pulses) should simply not run for
 * visitors who asked for reduced motion.
 */
export function useAmbientAnimation(animation) {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? undefined : animation;
}
