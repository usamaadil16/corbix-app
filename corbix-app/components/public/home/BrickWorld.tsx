"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type BrickWorldProps = {
  /** When true, the camera flies down the corridor as the user scrolls. */
  flight: boolean;
  /** How many viewport heights the scroll journey spans. */
  journeyScreens: number;
};

const GOLD = new THREE.Color("#E7B24C");
const GOLD_DEEP = new THREE.Color("#C8922F");
const STONE = new THREE.Color("#1b1b22");
const STONE_LIGHT = new THREE.Color("#2a2a34");

export function BrickWorld({ flight, journeyScreens }: BrickWorldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const flightRef = useRef(flight);
  flightRef.current = flight;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#0a0a0f", 0.085);

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      120,
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting — a warm light travels with the camera so nearby bricks glow
    const ambient = new THREE.AmbientLight("#3a3a46", 1.1);
    scene.add(ambient);
    const headLight = new THREE.PointLight(GOLD, 65, 28, 2);
    scene.add(headLight);
    const fillLight = new THREE.DirectionalLight("#fff1cc", 0.45);
    fillLight.position.set(3, 5, 4);
    scene.add(fillLight);

    // Build the brick corridor
    const halfW = 4.4;
    const halfH = 2.7;
    const step = 0.82;
    const layers = isMobile ? 34 : 58;
    const depth = layers * step;

    const brickGeo = new THREE.BoxGeometry(0.92, 0.42, 0.5);
    const brickMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.05,
    });

    type Brick = { x: number; y: number; z: number };
    const bricks: Brick[] = [];

    for (let l = 0; l < layers; l++) {
      const z = -l * step;
      const offset = l % 2 === 0 ? 0 : step / 2;
      // left & right walls (vary y)
      for (let y = -halfH; y <= halfH; y += step) {
        bricks.push({ x: -halfW, y: y + offset, z });
        bricks.push({ x: halfW, y: y + offset, z });
      }
      // floor & ceiling (vary x) — skip on mobile for performance
      if (!isMobile) {
        for (let x = -halfW; x <= halfW; x += step) {
          bricks.push({ x: x + offset, y: -halfH, z });
          bricks.push({ x: x + offset, y: halfH, z });
        }
      }
    }

    const mesh = new THREE.InstancedMesh(brickGeo, brickMat, bricks.length);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    bricks.forEach((b, i) => {
      dummy.position.set(
        b.x + (Math.random() - 0.5) * 0.06,
        b.y + (Math.random() - 0.5) * 0.06,
        b.z,
      );
      dummy.rotation.set(0, 0, (Math.random() - 0.5) * 0.05);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const r = Math.random();
      if (r > 0.9) color.copy(GOLD);
      else if (r > 0.78) color.copy(GOLD_DEEP);
      else if (r > 0.5) color.copy(STONE_LIGHT);
      else color.copy(STONE);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);

    // Golden particles drifting in the space OUTSIDE the brick corridor
    const particleCount = isMobile ? 700 : 1700;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      let px = (Math.random() - 0.5) * 30;
      let py = (Math.random() - 0.5) * 20;
      // push any particle that lands inside the corridor out past the walls
      if (Math.abs(px) < halfW + 0.8 && Math.abs(py) < halfH + 0.8) {
        px += px >= 0 ? halfW + 1.5 : -(halfW + 1.5);
        py += py >= 0 ? halfH + 1.0 : -(halfH + 1.0);
      }
      pPositions[i * 3] = px;
      pPositions[i * 3 + 1] = py;
      pPositions[i * 3 + 2] = 6 - Math.random() * (depth + 12);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(pPositions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: GOLD,
      size: 0.07,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const startZ = 6;
    const endZ = -depth + 8;

    const pointer = { x: 0, y: 0 };
    const onMouseMove = (event: MouseEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    if (!isMobile) window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let currentZ = startZ;
    let frameId = 0;
    const startTime = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;

      let targetZ = startZ;
      if (flightRef.current && !reduce) {
        const max = window.innerHeight * journeyScreens;
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        const eased = p * p * (3 - 2 * p); // smoothstep
        targetZ = startZ + (endZ - startZ) * eased;
      } else {
        // static drift so the world feels alive without scroll flight
        targetZ = startZ - 2 + Math.sin(t * 0.2) * 1.2;
      }

      currentZ += (targetZ - currentZ) * 0.06;
      camera.position.z = currentZ;
      camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(pointer.x * 0.5, pointer.y * 0.3, currentZ - 6);

      headLight.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z - 1,
      );

      particles.rotation.z += 0.0004;
      particleMat.opacity = 0.55 + Math.sin(t * 0.8) * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      brickGeo.dispose();
      brickMat.dispose();
      mesh.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [journeyScreens]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10 h-screen w-screen bg-[radial-gradient(circle_at_50%_30%,rgba(231,178,76,0.08),transparent_70%)]"
      aria-hidden
    />
  );
}
