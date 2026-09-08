import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Luxury easeOut cubic bezier curve for smooth, silky non-jarring transitions
export const LUXURY_EASING = [0.16, 1, 0.3, 1]

/**
 * FadeIn
 * Smooth scroll-reveal wrapper that fades in and slides up from below by default.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.72,
  distance = 24,
  direction = 'up',
  viewport = { once: true, margin: '-20px 0px' },
  className = '',
  style = {},
  as = 'div',
  ...props
}) {
  const shouldReduceMotion = useReducedMotion()

  const getInitialOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 }
    switch (direction) {
      case 'up':
        return { x: 0, y: distance }
      case 'down':
        return { x: 0, y: -distance }
      case 'left':
        return { x: distance, y: 0 }
      case 'right':
        return { x: -distance, y: 0 }
      case 'none':
      default:
        return { x: 0, y: 0 }
    }
  }

  const offset = getInitialOffset()
  const MotionComponent = motion[as] || motion.div

  if (shouldReduceMotion) {
    return (
      <MotionComponent
        className={className}
        style={style}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        {...props}
      >
        {children}
      </MotionComponent>
    )
  }

  return (
    <MotionComponent
      className={className}
      style={{
        willChange: 'opacity, transform',
        ...style,
      }}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={viewport}
      transition={{
        duration,
        ease: LUXURY_EASING,
        delay,
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

/**
 * StaggerContainer
 * Parent wrapper coordinating staggered reveals of child StaggerItem elements
 */
export function StaggerContainer({
  children,
  delay = 0,
  staggerDelay = 0.1,
  viewport = { once: true, margin: '-20px 0px' },
  className = '',
  style = {},
  as = 'div',
  ...props
}) {
  const shouldReduceMotion = useReducedMotion()
  const MotionComponent = motion[as] || motion.div

  if (shouldReduceMotion) {
    return (
      <MotionComponent className={className} style={style} {...props}>
        {children}
      </MotionComponent>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  }

  return (
    <MotionComponent
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

/**
 * StaggerItem
 * Child item inside a StaggerContainer that animates in sequence
 */
export function StaggerItem({
  children,
  distance = 20,
  duration = 0.65,
  className = '',
  style = {},
  as = 'div',
  ...props
}) {
  const shouldReduceMotion = useReducedMotion()
  const MotionComponent = motion[as] || motion.div

  if (shouldReduceMotion) {
    return (
      <MotionComponent className={className} style={style} {...props}>
        {children}
      </MotionComponent>
    )
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: distance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: LUXURY_EASING,
      },
    },
  }

  return (
    <MotionComponent
      className={className}
      style={{
        willChange: 'opacity, transform',
        ...style,
      }}
      variants={itemVariants}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

/**
 * ScaleIn
 * Subtle scale and fade-in for key highlight cards or banners
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = 0.65,
  viewport = { once: true, margin: '-20px 0px' },
  className = '',
  style = {},
  as = 'div',
  ...props
}) {
  const shouldReduceMotion = useReducedMotion()
  const MotionComponent = motion[as] || motion.div

  if (shouldReduceMotion) {
    return (
      <MotionComponent className={className} style={style} {...props}>
        {children}
      </MotionComponent>
    )
  }

  return (
    <MotionComponent
      className={className}
      style={{
        willChange: 'opacity, transform',
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewport}
      transition={{
        duration,
        ease: LUXURY_EASING,
        delay,
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
