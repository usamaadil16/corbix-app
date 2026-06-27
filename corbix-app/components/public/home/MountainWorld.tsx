"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MountainWorldProps = {
  journeyScreens: number;
};

const FOG_COLOR = "#05060a";
const PEAK_COLOR = 0x2a2c33;
const GOLD = 0xffc24d;
const CUBE_COLOR = 0xffe21f;
const CUBE_EMISSIVE = 0xffd000;

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
      return; // No WebGL available (e.g. jsdom) — fail gracefully.
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
    scene.fog = new THREE.Fog(FOG_COLOR, 24, 130);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 400);
    camera.position.set(0, 6, 60);

    // --- Lighting: dark ambient + warm gold key for rim-lit faceted peaks ---
    scene.add(new THREE.AmbientLight(0x3a3f4a, 1.1));
    const goldKey = new THREE.DirectionalLight(GOLD, 2.4);
    goldKey.position.set(-18, 26, 12);
    scene.add(goldKey);
    const coolRim = new THREE.DirectionalLight(0x88aaff, 0.6);
    coolRim.position.set(14, 10, -24);
    scene.add(coolRim);

    const disposables: Array<{ dispose: () => void }> = [];

    // --- Ground ---
    const groundGeo = new THREE.PlaneGeometry(400, 600, 1, 1);
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

    // --- Low-poly mountain canyon walls ---
    const peakMat = new THREE.MeshStandardMaterial({
      color: PEAK_COLOR,
      flatShading: true,
      roughness: 0.95,
      metalness: 0.05,
    });
    disposables.push(peakMat);

    const ROWS = 38;
    const ROW_SPACING = 8;
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    for (let i = 0; i < ROWS; i += 1) {
      const z = 44 - i * ROW_SPACING;
      for (const side of [-1, 1]) {
        // Two staggered peaks per side per row build a jagged ridge wall.
        for (let k = 0; k < 2; k += 1) {
          const h = rand(7, 18);
          const radius = rand(3.2, 6);
          const segments = 4 + Math.floor(Math.random() * 3);
          const geo = new THREE.ConeGeometry(radius, h, segments);
          const peak = new THREE.Mesh(geo, peakMat);
          peak.position.set(
            side * rand(11, 18) + rand(-2, 2),
            h / 2 - 2,
            z + k * rand(2, 5),
          );
          peak.rotation.y = rand(0, Math.PI);
          scene.add(peak);
          disposables.push(geo);
        }
      }
    }

    // --- Central glowing yellow cube (the focal landmark) ---
    const cubeGeo = new THREE.BoxGeometry(9, 9, 9);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: CUBE_COLOR,
      emissive: CUBE_EMISSIVE,
      emissiveIntensity: 1.4,
      roughness: 0.25,
      metalness: 0.15,
    });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(0, 7, -120);
    scene.add(cube);
    disposables.push(cubeGeo, cubeMat);

    const cubeGlow = new THREE.PointLight(0xffd400, 4, 120, 2);
    cubeGlow.position.copy(cube.position);
    scene.add(cubeGlow);

    // --- Golden drifting particles throughout the canyon ---
    const P_COUNT = 700;
    const positions = new Float32Array(P_COUNT * 3);
    for (let i = 0; i < P_COUNT; i += 1) {
      positions[i * 3] = rand(-45, 45);
      positions[i * 3 + 1] = rand(-8, 42);
      positions[i * 3 + 2] = rand(-150, 60);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd27a,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
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

    const START_Z = 60;
    const END_Z = -102;
    const lookTarget = new THREE.Vector3(0, 7, -120);

    const start = performance.now();
    let frame = 0;
    const tick = () => {
      const t = (performance.now() - start) / 1000;

      camera.position.z = THREE.MathUtils.lerp(START_Z, END_Z, progress);
      camera.position.y = 6 + Math.sin(progress * Math.PI) * 2.5;
      camera.position.x = Math.sin(progress * Math.PI * 2) * 1.5;
      camera.lookAt(lookTarget);

      cube.rotation.x = t * 0.18;
      cube.rotation.y = t * 0.28;
      cubeMat.emissiveIntensity = 1.25 + Math.sin(t * 2) * 0.35;
      cubeGlow.intensity = 3.5 + Math.sin(t * 2) * 1.2;

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
