"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MountainWorldProps = {
  journeyScreens: number;
};

const FOG_COLOR = "#05060a";
const HILL_COLOR = 0x262a32;
const GOLD = 0xffc24d;
const TRAIL_COLOR = 0xffe08a;
const CUBE_COLOR = 0xffe21f;
const CUBE_EMISSIVE = 0xffd000;

// Journey layout (camera flies toward -Z).
const CAM_START_Z = 40;
const CUBE_Z = 18; // cube sits in front of the valley
const VALLEY_END_Z = -210;
const CUBE_PHASE = 0.25; // first quarter of scroll = approach + enter the cube

export function MountainWorld({ journeyScreens }: MountainWorldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return; // No WebGL (e.g. jsdom) — fail gracefully.
    }

    const getSize = () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const { width, height } = getSize();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(FOG_COLOR);
    scene.fog = new THREE.Fog(FOG_COLOR, 30, 160);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 500);
    camera.position.set(0, 6, CAM_START_Z);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0x3a3f4a, 1.1));
    const goldKey = new THREE.DirectionalLight(GOLD, 2.2);
    goldKey.position.set(-18, 26, 12);
    scene.add(goldKey);
    const coolRim = new THREE.DirectionalLight(0x88aaff, 0.6);
    coolRim.position.set(14, 10, -24);
    scene.add(coolRim);

    const disposables: Array<{ dispose: () => void }> = [];
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    // --- Ground ---
    const groundGeo = new THREE.PlaneGeometry(500, 700, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0b10,
      roughness: 1,
      metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);
    disposables.push(groundGeo, groundMat);

    // --- Rounded mountain valley walls (smooth-shaded domes) ---
    const hillMat = new THREE.MeshStandardMaterial({
      color: HILL_COLOR,
      flatShading: false,
      roughness: 0.95,
      metalness: 0.04,
    });
    disposables.push(hillMat);

    const ROWS = 40;
    const ROW_SPACING = 7.5;
    for (let i = 0; i < ROWS; i += 1) {
      const z = 0 - i * ROW_SPACING; // valley starts beyond the cube (z < CUBE_Z)
      for (const side of [-1, 1]) {
        for (let k = 0; k < 2; k += 1) {
          const r = rand(5, 10);
          const geo = new THREE.SphereGeometry(r, 16, 12);
          const hill = new THREE.Mesh(geo, hillMat);
          hill.position.set(
            side * rand(12, 20) + rand(-2, 2),
            rand(-3, 1), // centered near ground so only a rounded dome pokes up
            z + k * rand(2, 5),
          );
          hill.scale.set(rand(0.9, 1.3), rand(0.8, 1.4), rand(0.9, 1.3));
          scene.add(hill);
          disposables.push(geo);
        }
      }
    }

    // --- Central glowing yellow cube (the gateway you scroll into) ---
    const cubeGeo = new THREE.BoxGeometry(12, 12, 12);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: CUBE_COLOR,
      emissive: CUBE_EMISSIVE,
      emissiveIntensity: 1.3,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(0, 6, CUBE_Z);
    scene.add(cube);
    disposables.push(cubeGeo, cubeMat);

    const cubeGlow = new THREE.PointLight(0xffd400, 4, 140, 2);
    cubeGlow.position.copy(cube.position);
    scene.add(cubeGlow);

    // --- Guiding trail: a glowing line winding down the valley floor ---
    const trailPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 44; i += 1) {
      const z = 12 - i * 6; // from just past the cube deep into the valley
      trailPoints.push(
        new THREE.Vector3(Math.sin(i * 0.22) * 3.5, -1 + Math.sin(i * 0.4) * 0.5, z),
      );
    }
    const trailCurve = new THREE.CatmullRomCurve3(trailPoints);
    const trailTubeGeo = new THREE.TubeGeometry(trailCurve, 240, 0.13, 8, false);
    const trailTubeMat = new THREE.MeshBasicMaterial({
      color: TRAIL_COLOR,
      transparent: true,
      opacity: 0.7,
    });
    const trail = new THREE.Mesh(trailTubeGeo, trailTubeMat);
    scene.add(trail);
    disposables.push(trailTubeGeo, trailTubeMat);

    // Particles that flow along the trail.
    const TRAIL_COUNT = 140;
    const trailPos = new Float32Array(TRAIL_COUNT * 3);
    const trailParticleGeo = new THREE.BufferGeometry();
    trailParticleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(trailPos, 3),
    );
    const trailParticleMat = new THREE.PointsMaterial({
      color: TRAIL_COLOR,
      size: 0.5,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const trailParticles = new THREE.Points(trailParticleGeo, trailParticleMat);
    scene.add(trailParticles);
    disposables.push(trailParticleGeo, trailParticleMat);

    // --- Ambient golden particles drifting through the canyon ---
    const P_COUNT = 700;
    const positions = new Float32Array(P_COUNT * 3);
    for (let i = 0; i < P_COUNT; i += 1) {
      positions[i * 3] = rand(-45, 45);
      positions[i * 3 + 1] = rand(-8, 42);
      positions[i * 3 + 2] = rand(-260, 40);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd27a,
      size: 0.26,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    disposables.push(particleGeo, particleMat);

    // --- Scroll progress (shared range with the panel timeline) ---
    let progress = 0;
    const st = ScrollTrigger.create({
      trigger: "[data-journey]",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progress = self.progress;
      },
    });

    const lerp = THREE.MathUtils.lerp;
    const clamp = THREE.MathUtils.clamp;

    const cameraZForProgress = (p: number) => {
      if (p < CUBE_PHASE) {
        // Approach the cube and pass through its front face.
        return lerp(CAM_START_Z, 10, p / CUBE_PHASE);
      }
      const k = (p - CUBE_PHASE) / (1 - CUBE_PHASE);
      return lerp(10, VALLEY_END_Z, k);
    };

    const tmp = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const start = performance.now();
    let frame = 0;
    const tick = () => {
      const t = (performance.now() - start) / 1000;

      const camZ = cameraZForProgress(progress);
      camera.position.z = camZ;
      camera.position.y = 6 + Math.sin(progress * Math.PI) * 1.5;
      camera.position.x = Math.sin(progress * Math.PI * 3) * 1.2;
      lookTarget.set(0, 4, camZ - 30);
      camera.lookAt(lookTarget);

      // Cube grows as we approach, then we fly into it (bright flash from inside).
      const approach = clamp(progress / (CUBE_PHASE * 0.9), 0, 1);
      const cubeScale = lerp(0.85, 1.9, approach);
      cube.scale.setScalar(cubeScale);
      cube.rotation.x = t * 0.18;
      cube.rotation.y = t * 0.26;
      const insideCube = clamp(1 - Math.abs(camZ - CUBE_Z) / 9, 0, 1);
      cubeMat.emissiveIntensity = 1.2 + insideCube * 1.6 + Math.sin(t * 2) * 0.25;
      cubeGlow.intensity = 3.5 + insideCube * 4 + Math.sin(t * 2) * 1;

      // Flow the trail particles forward along the curve.
      for (let i = 0; i < TRAIL_COUNT; i += 1) {
        const tt = (i / TRAIL_COUNT + t * 0.03) % 1;
        trailCurve.getPointAt(tt, tmp);
        trailPos[i * 3] = tmp.x;
        trailPos[i * 3 + 1] = tmp.y;
        trailPos[i * 3 + 2] = tmp.z;
      }
      trailParticleGeo.attributes.position.needsUpdate = true;

      particles.rotation.y = t * 0.015;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const size = getSize();
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      st.kill();
      window.removeEventListener("resize", onResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [journeyScreens]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
