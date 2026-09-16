import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Silk.css';

function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uNoiseIntensity;
uniform float uRotation;

varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle),
              sin(angle),  cos(angle));
}

float wave(vec2 uv, float t) {
  vec2 p = uv;
  float n1 = snoise(p * 2.2 + vec2(t * 0.25, t * 0.18)) * uNoiseIntensity;
  float n2 = snoise(p * 4.4 - vec2(t * 0.15, t * 0.3)) * 0.5;
  
  float f = sin(p.x * 4.2 + n1 * 1.7 + t * 0.55) * 
            cos(p.y * 3.2 + n2 * 1.4 + t * 0.45);
  f += sin((p.x + p.y) * 2.8 + t * 0.35) * 0.45;
  f += sin(sqrt(p.x*p.x + p.y*p.y) * 4.8 - t * 0.65) * 0.25;
  return f;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
  uv = rotate2d(uRotation) * uv;
  uv *= uScale;

  float t = uTime * (uSpeed * 0.18);
  float h = wave(uv, t);
  
  float eps = 0.006;
  float hx = wave(uv + vec2(eps, 0.0), t) - h;
  float hy = wave(uv + vec2(0.0, eps), t) - h;
  vec3 normal = normalize(vec3(-hx / eps, -hy / eps, 1.0));
  
  vec3 lightDir = normalize(vec3(0.5, 0.8, 1.2));
  float diff = max(dot(normal, lightDir), 0.0);
  
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 18.0);
  
  vec3 baseColor = uColor;
  vec3 shadowColor = uColor * 0.32;
  vec3 highlightColor = mix(uColor, vec3(1.0), 0.6);
  
  vec3 col = mix(shadowColor, baseColor, smoothstep(-1.0, 0.55, h));
  col = mix(col, highlightColor, smoothstep(0.35, 1.15, h));
  col += spec * 0.38 * highlightColor;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export const Silk = ({
  speed = 5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
  className = '',
  style = {},
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL not supported for Silk:', e);
      return;
    }

    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.canvas.classList.add('silk-canvas');

    const geometry = new Triangle(gl);
    const rgbColor = hexToRgb(color);

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [container.clientWidth, container.clientHeight] },
        uColor: { value: rgbColor },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uNoiseIntensity: { value: noiseIntensity },
        uRotation: { value: (rotation * Math.PI) / 180 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    let animationId;
    let startTime = performance.now();

    const resize = () => {
      if (!container) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };

    window.addEventListener('resize', resize);
    resize();

    const render = (currentTime) => {
      const elapsed = (currentTime - startTime) * 0.001;
      program.uniforms.uTime.value = elapsed;
      renderer.render({ scene: mesh });
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      if (gl.canvas && gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <div
      ref={containerRef}
      className={`silk-container ${className}`.trim()}
      style={style}
    />
  );
};

export default Silk;
