"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MountainWorldProps = {
  journeyScreens: number;
};

const FOG_COLOR = "#03060e";
const BLUE = 0x32c8ff; // bright blue
const BLUE_DEEP = 0x0a6cff;
const BLUE_SOFT = 0x66d8ff;
const WATER_COLOR = 0x05213c;

// Journey layout (camera flies toward -Z).
const CAM_START_Z = 40;
const CUBE_Z = 18; // cube gateway sits in front of the valley
const VALLEY_END_Z = -210;
const CUBE_PHASE = 0.25; // first quarter of scroll = approach + dissolve into cube

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
    scene.fog = new THREE.Fog(FOG_COLOR, 30, 170);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 500);
    camera.position.set(0, 6, CAM_START_Z);

    // --- Lighting (cool / blue) ---
    scene.add(new THREE.AmbientLight(0x223044, 1.2));
    const key = new THREE.DirectionalLight(0xbfe6ff, 1.9);
    key.position.set(-16, 28, 14);
    scene.add(key);
    const blueRim = new THREE.DirectionalLight(BLUE, 0.9);
    blueRim.position.set(14, 8, -26);
    scene.add(blueRim);

    const disposables: Array<{ dispose: () => void }> = [];
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const lerp = THREE.MathUtils.lerp;
    const clamp = THREE.MathUtils.clamp;
    const smoothstep = THREE.MathUtils.smoothstep;

    // Soft round sprite so points render as dots, not squares.
    const makeCircleTexture = () => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const g = canvas.getContext("2d");
      if (g) {
        const grad = g.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2,
        );
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.45, "rgba(255,255,255,0.85)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(canvas);
    };
    const circleTex = makeCircleTexture();
    disposables.push(circleTex);

    // --- Water floor (rippling, lightly reflective blue plane) ---
    const waterGeo = new THREE.PlaneGeometry(520, 760, 48, 72);
    const waterMat = new THREE.MeshStandardMaterial({
      color: WATER_COLOR,
      emissive: 0x04122a,
      emissiveIntensity: 0.6,
      metalness: 0.35,
      roughness: 0.25,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);
    disposables.push(waterGeo, waterMat);
    const waterPos = waterGeo.attributes.position as THREE.BufferAttribute;

    // --- Bright-blue outlined building blocks lining the valley ---
    const buildingFaceMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.85,
      metalness: 0.1,
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: BLUE,
      transparent: true,
      opacity: 0.9,
    });
    disposables.push(buildingFaceMat, edgeMat);

    const ROWS = 40;
    const ROW_SPACING = 7.5;
    for (let i = 0; i < ROWS; i += 1) {
      const z = 0 - i * ROW_SPACING; // valley starts beyond the cube
      for (const side of [-1, 1]) {
        for (let k = 0; k < 2; k += 1) {
          const w = rand(4, 9);
          const h = rand(8, 32);
          const d = rand(4, 9);
          const boxGeo = new THREE.BoxGeometry(w, h, d);
          const box = new THREE.Mesh(boxGeo, buildingFaceMat);
          box.position.set(
            side * rand(11, 20) + rand(-1.5, 1.5),
            h / 2 - 2,
            z + k * rand(2, 5),
          );
          scene.add(box);

          const edgeGeo = new THREE.EdgesGeometry(boxGeo);
          const edges = new THREE.LineSegments(edgeGeo, edgeMat);
          edges.position.copy(box.position);
          scene.add(edges);

          disposables.push(boxGeo, edgeGeo);
        }
      }
    }

    // --- Cube gateway built from a grid of small 3D cubes ---
    const GRID = 6;
    const CUBE_SIZE = 8.5;
    const cell = CUBE_SIZE / GRID;
    const smallGeo = new THREE.BoxGeometry(cell * 0.78, cell * 0.78, cell * 0.78);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: BLUE,
      emissive: BLUE_DEEP,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.35,
    });
    const CUBE_COUNT = GRID * GRID * GRID;
    const cube = new THREE.InstancedMesh(smallGeo, cubeMat, CUBE_COUNT);
    cube.position.set(0, 6, CUBE_Z);
    scene.add(cube);
    disposables.push(smallGeo, cubeMat, cube);

    const cubeBase: THREE.Vector3[] = [];
    const cubeScatter: THREE.Vector3[] = [];
    const cubeDummy = new THREE.Object3D();
    for (let x = 0; x < GRID; x += 1) {
      for (let y = 0; y < GRID; y += 1) {
        for (let z = 0; z < GRID; z += 1) {
          const p = new THREE.Vector3(
            (x - (GRID - 1) / 2) * cell,
            (y - (GRID - 1) / 2) * cell,
            (z - (GRID - 1) / 2) * cell,
          );
          cubeBase.push(p);
          const dir = p.clone();
          if (dir.lengthSq() === 0) dir.set(0, 1, 0);
          cubeScatter.push(dir.normalize());
        }
      }
    }
    cubeBase.forEach((p, i) => {
      cubeDummy.position.copy(p);
      cubeDummy.scale.setScalar(1);
      cubeDummy.updateMatrix();
      cube.setMatrixAt(i, cubeDummy.matrix);
    });
    cube.instanceMatrix.needsUpdate = true;

    const cubeGlow = new THREE.PointLight(BLUE, 4, 150, 2);
    cubeGlow.position.copy(cube.position);
    scene.add(cubeGlow);

    // Burst particles the cube dissolves into as the camera enters it.
    const BURST = 420;
    const burstDir = new Float32Array(BURST * 3);
    const burstPos = new Float32Array(BURST * 3);
    for (let i = 0; i < BURST; i += 1) {
      const v = new THREE.Vector3(
        rand(-1, 1),
        rand(-1, 1),
        rand(-1, 1),
      ).normalize();
      const mag = rand(0.4, 1);
      burstDir[i * 3] = v.x * mag;
      burstDir[i * 3 + 1] = v.y * mag;
      burstDir[i * 3 + 2] = v.z * mag;
    }
    const burstGeo = new THREE.BufferGeometry();
    burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPos, 3));
    const burstMat = new THREE.PointsMaterial({
      color: BLUE_SOFT,
      size: 0.6,
      map: circleTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const burst = new THREE.Points(burstGeo, burstMat);
    burst.position.copy(cube.position);
    scene.add(burst);
    disposables.push(burstGeo, burstMat);

    // --- Guiding trail that draws itself as we move deeper ---
    const trailPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 44; i += 1) {
      const z = 12 - i * 6;
      trailPoints.push(
        new THREE.Vector3(
          Math.sin(i * 0.22) * 3.5,
          -1.4 + Math.sin(i * 0.4) * 0.4,
          z,
        ),
      );
    }
    const trailCurve = new THREE.CatmullRomCurve3(trailPoints);
    const trailTubeGeo = new THREE.TubeGeometry(trailCurve, 260, 0.14, 8, false);
    const trailTubeMat = new THREE.MeshBasicMaterial({
      color: BLUE,
      transparent: true,
      opacity: 0.8,
    });
    const trail = new THREE.Mesh(trailTubeGeo, trailTubeMat);
    scene.add(trail);
    disposables.push(trailTubeGeo, trailTubeMat);
    const trailIndexCount = trailTubeGeo.index ? trailTubeGeo.index.count : 0;
    trailTubeGeo.setDrawRange(0, 0);

    // Particles riding the revealed portion of the trail.
    const TRAIL_COUNT = 150;
    const trailPos = new Float32Array(TRAIL_COUNT * 3);
    const trailParticleGeo = new THREE.BufferGeometry();
    trailParticleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(trailPos, 3),
    );
    const trailParticleMat = new THREE.PointsMaterial({
      color: BLUE_SOFT,
      size: 0.5,
      map: circleTex,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const trailParticles = new THREE.Points(
      trailParticleGeo,
      trailParticleMat,
    );
    scene.add(trailParticles);
    disposables.push(trailParticleGeo, trailParticleMat);

    // --- Ambient blue particles drifting across the water surface ---
    const P_COUNT = 2600;
    const positions = new Float32Array(P_COUNT * 3);
    for (let i = 0; i < P_COUNT; i += 1) {
      positions[i * 3] = rand(-45, 45);
      // Hug the water surface (water sits at y = -2 with small ripples).
      positions[i * 3 + 1] = rand(-1.9, 0.4);
      positions[i * 3 + 2] = rand(-260, 40);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: BLUE_SOFT,
      size: 0.32,
      map: circleTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    disposables.push(particleGeo, particleMat);

    // --- Scroll progress ---
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

    const cameraZForProgress = (p: number) => {
      if (p < CUBE_PHASE) {
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

      // Water ripples.
      for (let i = 0; i < waterPos.count; i += 1) {
        const x = waterPos.getX(i);
        const y = waterPos.getY(i);
        const wave =
          Math.sin(x * 0.12 + t * 1.1) * 0.5 +
          Math.cos(y * 0.16 + t * 1.4) * 0.5;
        waterPos.setZ(i, wave);
      }
      waterPos.needsUpdate = true;
      waterGeo.computeVertexNormals();

      // Cube grows, then dissolves into blue particles as we enter it.
      const approach = clamp(progress / (CUBE_PHASE * 0.55), 0, 1);
      cube.scale.setScalar(lerp(0.85, 1.85, approach));
      cube.rotation.y = t * 0.26; // horizontal spin only

      const dissolve = smoothstep(progress, 0.15, 0.28);
      cube.visible = dissolve < 0.995;
      // The small cubes fly apart and shrink as the gateway dissolves.
      const cubeSpread = dissolve * 16;
      const cubeShrink = clamp(1 - dissolve, 0.001, 1);
      for (let i = 0; i < CUBE_COUNT; i += 1) {
        cubeDummy.position
          .copy(cubeBase[i])
          .addScaledVector(cubeScatter[i], cubeSpread);
        cubeDummy.rotation.set(t * 0.6 * dissolve, t * 0.6 * dissolve, 0);
        cubeDummy.scale.setScalar(cubeShrink);
        cubeDummy.updateMatrix();
        cube.setMatrixAt(i, cubeDummy.matrix);
      }
      cube.instanceMatrix.needsUpdate = true;
      cubeMat.emissiveIntensity = 0.55 + dissolve * 1.2 + Math.sin(t * 2) * 0.15;
      cubeGlow.intensity = 3 + dissolve * 5 + Math.sin(t * 2) * 1;

      const spread = dissolve * 18;
      for (let i = 0; i < BURST; i += 1) {
        burstPos[i * 3] = burstDir[i * 3] * spread;
        burstPos[i * 3 + 1] = burstDir[i * 3 + 1] * spread;
        burstPos[i * 3 + 2] = burstDir[i * 3 + 2] * spread;
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = Math.sin(clamp(dissolve, 0, 1) * Math.PI) * 0.95;

      // Trail reveals only as far as we've travelled into the valley.
      const valleyProgress = clamp(
        (progress - CUBE_PHASE) / (1 - CUBE_PHASE),
        0,
        1,
      );
      trailTubeGeo.setDrawRange(
        0,
        Math.floor(trailIndexCount * valleyProgress),
      );
      for (let i = 0; i < TRAIL_COUNT; i += 1) {
        const tt = (i / TRAIL_COUNT) * valleyProgress;
        trailCurve.getPointAt(clamp(tt, 0, 1), tmp);
        trailPos[i * 3] = tmp.x;
        trailPos[i * 3 + 1] = tmp.y;
        trailPos[i * 3 + 2] = tmp.z;
      }
      trailParticleGeo.attributes.position.needsUpdate = true;
      trailParticleMat.opacity = 0.4 + valleyProgress * 0.55;

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
