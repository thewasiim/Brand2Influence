import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import CELLS from 'vanta/dist/vanta.cells.min'

export default function VantaCellsBackground({
  color1 = 0x000039,
  color2 = 0x3b82f6,
  size = 1.5,
  speed = 1.0,
  className = '',
  style = {},
  children
}) {
  const vantaRef = useRef(null)
  const effectRef = useRef(null)

  useEffect(() => {
    // Ensure THREE is globally available for Vanta shaders
    if (typeof window !== 'undefined') {
      window.THREE = THREE
    }

    if (!effectRef.current && vantaRef.current) {
      try {
        const cellsFn =
          typeof CELLS === 'function'
            ? CELLS
            : CELLS?.default || window.VANTA?.CELLS

        if (cellsFn) {
          effectRef.current = cellsFn({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color1: color1,
            color2: color2,
            size: size,
            speed: speed,
          })
        } else {
          console.error('Vanta CELLS function could not be resolved', CELLS)
        }
      } catch (err) {
        console.error('Failed to initialize Vanta 3D Cells background:', err)
      }
    }

    return () => {
      if (effectRef.current) {
        try {
          effectRef.current.destroy()
        } catch (e) {
          console.error('Error destroying Vanta instance:', e)
        }
        effectRef.current = null
      }
    }
  }, [color1, color2, size, speed])

  return (
    <div
      ref={vantaRef}
      className={`vanta-cells-wrapper ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'auto',
        zIndex: 0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
