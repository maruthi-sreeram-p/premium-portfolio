import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { pointer } from '../../lib/pointer';
import { clamp, damp } from '../../lib/motion';

/* ============================================================================
   Particle shaders
   ========================================================================== */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uEnergy;

  attribute float aScale;
  attribute float aSpeed;
  attribute vec3  aColor;

  varying vec3  vColor;
  varying float vFade;

  void main() {
    vec3 pos = position;

    // Each particle drifts on its own slow orbit. Seeding the phase from the
    // particle's own position keeps neighbours out of lockstep, so the field
    // breathes instead of pulsing as one block.
    float t = uTime * aSpeed;
    pos.x += sin(t + position.z * 1.7) * 0.14;
    pos.y += cos(t * 1.1 + position.x * 1.5) * 0.14;
    pos.z += sin(t * 0.8 + position.y * 1.9) * 0.14;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Perspective size attenuation, corrected for device pixel ratio so points
    // are the same apparent size on a retina display as on a 1x one.
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / max(-mv.z, 0.001));

    vColor = aColor;
    vFade = smoothstep(-18.0, -4.0, mv.z) * (0.55 + uEnergy * 0.45);
  }
`;

const FRAG = /* glsl */ `
  uniform float uFade;

  varying vec3  vColor;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, d);
    alpha = pow(alpha, 2.4);

    // uFade is the global intensity. It has to be a uniform the shader
    // actually reads: ShaderMaterial ignores the material's own opacity
    // property, which is only wired up by three's built-in materials.
    gl_FragColor = vec4(vColor, alpha * vFade * uFade);
  }
`;

/* ============================================================================
   Geometry
   ========================================================================== */

interface FieldData {
  positions: Float32Array;
  scales: Float32Array;
  speeds: Float32Array;
  colors: Float32Array;
  edges: Float32Array;
}

function buildField(count: number, palette: THREE.Color[]): FieldData {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const speeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.4 + Math.pow(Math.random(), 0.6) * 4.8;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.4;
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85;
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.6;

    const isSignal = Math.random() < 0.06;
    scales[i] = isSignal ? 2.4 + Math.random() * 1.5 : 0.45 + Math.random() * 0.85;
    speeds[i] = 0.12 + Math.random() * 0.34;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  /* -- Edges: link each sampled node to its nearest neighbour -------------
     A loose constellation with a few live connections is the shape of a
     distributed system, which is what this portfolio is about. */
  const edgeList: number[] = [];
  const MAX_DIST = 1.5;
  // Sample every Nth particle rather than testing all pairs — an O(n²) scan of
  // 2400 points would cost ~2.9M distance checks at startup for no visual gain.
  const stride = Math.max(1, Math.floor(count / 260));

  for (let i = 0; i < count && edgeList.length < 540; i += stride) {
    const ax = positions[i * 3];
    const ay = positions[i * 3 + 1];
    const az = positions[i * 3 + 2];
    let best = -1;
    let bestDist = MAX_DIST;

    for (let j = i + stride; j < count; j += stride) {
      const dist = Math.hypot(ax - positions[j * 3], ay - positions[j * 3 + 1], az - positions[j * 3 + 2]);
      if (dist < bestDist) { bestDist = dist; best = j; }
    }
    if (best >= 0) {
      edgeList.push(ax, ay, az, positions[best * 3], positions[best * 3 + 1], positions[best * 3 + 2]);
    }
  }

  return { positions, scales, speeds, colors, edges: new Float32Array(edgeList) };
}

/* ============================================================================
   Deterministic placement
   ========================================================================== */

/**
 * Seeded 0..1. Used instead of Math.random for anything whose layout should
 * survive a re-render: `useMemo` is a performance hint, not a guarantee, so a
 * discarded memo would otherwise reshuffle the smoke and shards mid-session.
 */
function noise(seed: number): number {
  const h = Math.sin(seed * 12.9898) * 43758.5453;
  return h - Math.floor(h);
}

function buildPuffs(count: number, colors: string[]) {
  return Array.from({ length: count }, (_, i) => ({
    position: [
      (noise(i * 3 + 1) - 0.5) * 13,
      (noise(i * 3 + 2) - 0.5) * 7,
      -2 - noise(i * 3 + 3) * 5,
    ] as [number, number, number],
    scale: 5 + noise(i + 40) * 6,
    spin: (noise(i + 70) - 0.5) * 0.05,
    color: colors[i % colors.length],
  }));
}

function buildShards(count: number) {
  return Array.from({ length: count }, (_, i) => {
    // Push shards toward the edges of the frame. The centre-left of the
    // viewport is where the headline and body copy live, and a lit solid
    // sitting behind display type competes with it however pretty it is.
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (4.2 + noise(i * 5 + 11) * 4.5);
    return {
      position: [
        x,
        (noise(i * 5 + 12) - 0.5) * 7,
        // Further back than before, so they sit clearly behind the content
        // plane rather than hovering in it.
        -3.5 - noise(i * 5 + 13) * 5.5,
      ] as [number, number, number],
      scale: 0.16 + noise(i + 200) * 0.3,
      spin: [
        (noise(i + 300) - 0.5) * 0.25,
        (noise(i + 400) - 0.5) * 0.25,
        (noise(i + 500) - 0.5) * 0.2,
      ] as [number, number, number],
    };
  });
}

/* ============================================================================
   Smoke
   ========================================================================== */

/**
 * Soft additive billboards standing in for volumetric haze.
 *
 * Real volumetrics would mean ray-marching a 3D texture — far too expensive
 * for a background layer. A handful of large, slowly counter-rotating sprites read as
 * drifting smoke for a rounding error of the cost, and because they are
 * additive they brighten the field rather than muddying it.
 */
function Smoke({ colors }: { colors: string[] }) {
  const groupRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.42)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.14)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Six large puffs read the same as eight and cost two fewer draw calls
  // of full-viewport overdraw, which is the expensive part of additive haze.
  const puffs = useMemo(() => buildPuffs(6, colors), [colors]);

  useFrame((_s, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);
    group.children.forEach((child, i) => {
      child.rotation.z += dt * puffs[i].spin;
      // A gentle vertical sway keeps the haze from looking like static decals.
      child.position.y += Math.sin(performance.now() * 0.0001 + i) * dt * 0.06;
    });
  });

  return (
    <group ref={groupRef}>
      {puffs.map((puff, i) => (
        <mesh key={i} position={puff.position} scale={puff.scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            color={puff.color}
            transparent
            opacity={0.16}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================
   Lit shards
   ========================================================================== */

/**
 * A handful of faceted solids that actually respond to the lights.
 *
 * The particle field is additive and unlit — it glows but it has no form. The
 * shards are what make the scene read as *lit*: as the lights orbit, their
 * facets catch highlights and fall into shadow, which is what gives the
 * backdrop depth rather than flatness.
 */
function Shards({ accent }: { accent: string }) {
  const groupRef = useRef<THREE.Group>(null);

  // Eight rather than eleven: each is its own draw call against three
  // lights, and the difference is not visible at this opacity.
  const shards = useMemo(() => buildShards(8), []);

  useFrame((_s, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);
    group.children.forEach((child, i) => {
      child.rotation.x += dt * shards[i].spin[0];
      child.rotation.y += dt * shards[i].spin[1];
      child.rotation.z += dt * shards[i].spin[2];
    });
  });

  return (
    <group ref={groupRef}>
      {shards.map((shard, i) => (
        <mesh key={i} position={shard.position} scale={shard.scale}>
          {/* detail 0 = 8 triangles. Faceted on purpose: smooth spheres would
              have nothing for the highlights to break across. */}
          <octahedronGeometry args={[1, 0]} />
          {/* Translucent on purpose. Solid shards read as foreground objects
              and pull the eye off the copy; at this opacity they catch the
              lights and add depth without ever becoming the subject. */}
          <meshStandardMaterial
            color={accent}
            metalness={0.8}
            roughness={0.3}
            emissive={accent}
            emissiveIntensity={0.08}
            transparent
            opacity={0.42}
            depthWrite={false}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================
   Lighting
   ========================================================================== */

function Lights({ colors }: { colors: string[] }) {
  const keyRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const rimRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Three lights on slow, differently-phased orbits. Because they move at
    // different rates the highlights on the shards never settle into a
    // repeating pattern.
    keyRef.current?.position.set(Math.sin(t * 0.22) * 7, Math.cos(t * 0.17) * 4, 4);
    fillRef.current?.position.set(Math.cos(t * 0.15) * -6, Math.sin(t * 0.24) * 3.5, 2.5);
    rimRef.current?.position.set(Math.sin(t * 0.11 + 2) * 4, Math.cos(t * 0.19 + 1) * -4, -3);
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight ref={keyRef} color={colors[0]} intensity={26} distance={22} decay={2} />
      <pointLight ref={fillRef} color={colors[1]} intensity={18} distance={20} decay={2} />
      <pointLight ref={rimRef} color={colors[2]} intensity={14} distance={18} decay={2} />
    </>
  );
}

/* ============================================================================
   Camera
   ========================================================================== */

/**
 * Scroll-driven camera moves.
 *
 * Rather than one static viewpoint for the whole page, the camera travels
 * through a short sequence of framed shots as the document scrolls — pushing
 * in, drifting wide, craning up. Each section is therefore seen against a
 * visibly different angle on the same object, which is what sells it as one
 * continuous space rather than a repeating wallpaper.
 */
const SHOTS: Array<{ pos: [number, number, number]; look: [number, number, number] }> = [
  { pos: [0, 0, 9.4], look: [0, 0, 0] },      // hero — square on
  { pos: [3.4, 1.1, 7.6], look: [-0.6, 0, 0] }, // about — pushed in, off axis
  { pos: [-3.2, -1.3, 8.4], look: [0.5, 0.2, 0] }, // skills — swung wide
  { pos: [1.8, 2.6, 7.0], look: [0, -0.6, 0] },  // projects — craned up
  { pos: [-1.4, -2.2, 8.8], look: [0.2, 0.5, 0] }, // experience — low
  { pos: [0, 0.3, 10.6], look: [0, 0, 0] },   // contact — pulled back
];

function CameraRig({ progress }: { progress: React.RefObject<number> }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((_s, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = clamp(progress.current ?? 0, 0, 1);

    // Position along the shot list, then blend between the two nearest shots.
    const scaled = p * (SHOTS.length - 1);
    const i = Math.min(Math.floor(scaled), SHOTS.length - 2);
    const f = scaled - i;
    // smoothstep between shots so each one settles instead of sliding linearly
    const e = f * f * (3 - 2 * f);

    const a = SHOTS[i];
    const b = SHOTS[i + 1];

    target.current.set(
      a.pos[0] + (b.pos[0] - a.pos[0]) * e,
      a.pos[1] + (b.pos[1] - a.pos[1]) * e,
      a.pos[2] + (b.pos[2] - a.pos[2]) * e,
    );
    // Pointer parallax rides on top of the shot, so the camera still answers
    // to the viewer wherever they are on the page.
    target.current.x += pointer.sx * 0.55;
    target.current.y += -pointer.sy * 0.35;

    // Writing to camera.position inside useFrame is r3f's intended way to drive
    // a camera; it is the same imperative-per-frame pattern as the uniforms
    // below, and the lint rule flagging it does not model the render loop.
    camera.position.x = damp(camera.position.x, target.current.x, 2.4, dt);
    camera.position.y = damp(camera.position.y, target.current.y, 2.4, dt);
    camera.position.z = damp(camera.position.z, target.current.z, 2.4, dt);

    look.current.set(
      a.look[0] + (b.look[0] - a.look[0]) * e,
      a.look[1] + (b.look[1] - a.look[1]) * e,
      a.look[2] + (b.look[2] - a.look[2]) * e,
    );
    camera.lookAt(look.current);
  });

  return null;
}

/* ============================================================================
   Scene
   ========================================================================== */

interface SceneProps {
  count: number;
  colors: string[];
  edgeColor: string;
}

function Scene({ count, colors, edgeColor }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { gl } = useThree();

  const palette = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors]);
  const data = useMemo(() => buildField(count, palette), [count, palette]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uEnergy: { value: 0 },
      uFade: { value: 1 },
    }),
    [],
  );

  /** Smoothed 0..1 progress through the whole document, shared with the rig. */
  const progressRef = useRef(0);
  const idleYawRef = useRef(0);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const dt = Math.min(delta, 0.05);

    // Mutating the memoised uniform objects in place is the intended pattern in
    // react-three-fiber: these change every frame and nothing in React's tree
    // reads them, so routing them through state would mean 60 renders a second
    // to drive a shader. (The lint rule flagging this does not model r3f.)
    uniforms.uTime.value += dt;
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    uniforms.uEnergy.value = damp(uniforms.uEnergy.value, 0.35 + pointer.speed * 0.65, 3, dt);

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    progressRef.current = damp(progressRef.current, clamp(window.scrollY / maxScroll, 0, 1), 4, dt);
    const p = progressRef.current;

    // Constant slow yaw plus a further turn distributed across the document, so
    // scrolling the site rotates the field.
    idleYawRef.current += dt * 0.03;
    group.rotation.y = idleYawRef.current + p * Math.PI * 0.6;
    group.rotation.z = p * Math.PI * 0.34;
    group.rotation.x = damp(group.rotation.x, pointer.sy * 0.12, 3, dt);

    // Full strength across the hero, easing to a calm floor for the rest of the
    // page so the field never competes with section content.
    const heroExit = clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
    const intensity = 1 - heroExit * 0.6;
    uniforms.uFade.value = intensity;

    const lineMaterial = linesRef.current?.material as THREE.LineBasicMaterial | undefined;
    if (lineMaterial) lineMaterial.opacity = 0.13 * intensity;
  });

  return (
    <>
      {/* Exponential fog gives the scene aerial perspective — distant shards
          and smoke sink into the page background instead of floating on it. */}
      <fogExp2 attach="fog" args={[new THREE.Color(colors[0]).multiplyScalar(0.06).getHex(), 0.055]} />

      <Lights colors={colors} />
      <CameraRig progress={progressRef} />
      <Smoke colors={colors} />

      <group ref={groupRef}>
        <Shards accent={edgeColor} />

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
            <bufferAttribute attach="attributes-aScale" args={[data.scales, 1]} />
            <bufferAttribute attach="attributes-aSpeed" args={[data.speeds, 1]} />
            <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
          </bufferGeometry>
          <shaderMaterial
            vertexShader={VERT}
            fragmentShader={FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </points>

        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.edges, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={edgeColor}
            transparent
            opacity={0.13}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </lineSegments>
      </group>
    </>
  );
}

/* ============================================================================
   Canvas wrapper
   ========================================================================== */

interface Field3DProps {
  count?: number;
  /** Pause rendering entirely (tab hidden). */
  paused?: boolean;
}

/**
 * The site's WebGL layer — the only one on the page.
 *
 * Lives behind *every* section, not just the hero: one continuously rotating,
 * lit, hazy volume that the whole document travels through, with the camera
 * changing its framing as you scroll.
 */
export default function Field3D({ count = 2400, paused = false }: Field3DProps) {
  // Read live theme tokens so the scene recolours with the theme instead of
  // hard-coding hexes that would drift from the design system.
  const { palette, edgeColor } = useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    return {
      palette: [
        read('--accent', '#4d9fff'),
        read('--accent-3', '#8b6cf6'),
        read('--accent-2', '#34e2e8'),
        read('--fg', '#e9eefb'),
      ],
      edgeColor: read('--accent', '#4d9fff'),
    };
  }, []);

  return (
    <Canvas
      // Cap DPR at 1.5. Beyond that the extra fragments cost real frames and
      // a soft-edged background is the last place anyone would notice — this
      // scene is additive blur and points, not detail worth resolving.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 9.4], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      frameloop={paused ? 'never' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <Scene count={count} colors={palette} edgeColor={edgeColor} />
    </Canvas>
  );
}
