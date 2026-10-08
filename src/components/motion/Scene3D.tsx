"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

/**
 * Tüm sayfaların arkasındaki ortak 3D sahne: noktalardan oluşan bir küre,
 * küre üzerindeki cihazlar arasında yaylar ve bu yaylarda akan dosya paketleri.
 * Sayfa türüne göre konum/boyut/parlaklık değişir ve sayfalar arasında yumuşakça geçer.
 */

type Placement = { x: number; y: number; scale: number; opacity: number };

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/auth"];
const MARKETING_ROUTES = ["/pricing", "/contact", "/privacy", "/terms"];

// x / y: ekranın yarı genişliği / yüksekliği oranında konum
function placementFor(pathname: string, mobile: boolean, pastHero: boolean): Placement {
  if (pathname === "/") {
    // Hero'da merkezde ve parlak; aşağı inildikçe kenara çekilip metinlere yer açar
    if (pastHero) return mobile ? { x: 0.55, y: 0.55, scale: 0.6, opacity: 0.5 } : { x: 0.68, y: 0.05, scale: 1, opacity: 0.6 };
    return mobile ? { x: 0, y: 0.25, scale: 0.85, opacity: 1 } : { x: 0, y: 0.18, scale: 1.25, opacity: 1 };
  }
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return { x: 0, y: 0, scale: mobile ? 0.9 : 1.15, opacity: 0.55 };
  if (MARKETING_ROUTES.some((r) => pathname.startsWith(r))) return mobile ? { x: 0.5, y: 0.6, scale: 0.6, opacity: 0.6 } : { x: 0.62, y: 0.35, scale: 0.85, opacity: 0.6 };
  // Uygulama ve yönetici sayfaları: köşede, içeriği bozmayacak kadar soluk
  return mobile ? { x: 0.6, y: -0.65, scale: 0.55, opacity: 0.35 } : { x: 0.72, y: -0.45, scale: 0.8, opacity: 0.38 };
}

// Allay paleti: camgöbeği yaylar, buz beyazı noktalar ve paketler
const ACCENT = new THREE.Color("#62dcf5");
const ACCENT_DEEP = new THREE.Color("#0d93cd");
const FOREGROUND = new THREE.Color("#f2fbfe");
const HALO = new THREE.Color("#aef4ff");

function fibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return positions;
}

// Noktaları kare yerine yumuşak kenarlı yuvarlak ışıltı olarak çizmek için doku
function glowSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function randomOnSphere(radius: number) {
  const v = new THREE.Vector3().randomDirection();
  return v.multiplyScalar(radius);
}

export function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // WebGL yoksa sahne sessizce atlanır
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = reduceMotion ? 0.15 : 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 7;

    const root = new THREE.Group();
    const globe = new THREE.Group();
    root.add(globe);
    scene.add(root);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);
    const sprite = track(glowSprite());

    // ── Küre: noktalar ──
    const RADIUS = 1.6;
    const sphereGeo = track(new THREE.BufferGeometry());
    sphereGeo.setAttribute("position", new THREE.BufferAttribute(fibonacciSphere(1800, RADIUS), 3));
    const sphereMat = track(new THREE.PointsMaterial({ map: sprite, color: FOREGROUND, size: 0.032, transparent: true, opacity: 0.55, depthWrite: false }));
    globe.add(new THREE.Points(sphereGeo, sphereMat));

    // ── İç parıltı ──
    const glowMat = track(new THREE.MeshBasicMaterial({ color: ACCENT_DEEP, transparent: true, opacity: 0.08, depthWrite: false }));
    globe.add(new THREE.Mesh(track(new THREE.SphereGeometry(RADIUS * 0.985, 48, 48)), glowMat));

    // ── Yörünge halkaları ──
    const ringMat = track(new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.18 }));
    const rings: THREE.LineLoop[] = [];
    [2.15, 2.6].forEach((r, i) => {
      const pts = Array.from({ length: 160 }, (_, k) => {
        const a = (k / 160) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
      });
      const ring = new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(pts)), ringMat);
      ring.rotation.x = Math.PI / 2 - 0.35 - i * 0.25;
      ring.rotation.z = 0.3 + i * 0.4;
      root.add(ring);
      rings.push(ring);
    });

    // ── Cihazlar arası yaylar + akan paketler ──
    const ARC_COUNT = 16;
    const arcMat = track(new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.28 }));
    const curves: THREE.QuadraticBezierCurve3[] = [];
    const nodePositions: number[] = [];
    for (let i = 0; i < ARC_COUNT; i++) {
      const a = randomOnSphere(RADIUS);
      const b = randomOnSphere(RADIUS);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const lift = RADIUS + 0.35 + a.distanceTo(b) * 0.35;
      mid.setLength(lift);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      curves.push(curve);
      globe.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))), arcMat));
      nodePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }

    // Cihaz noktaları (yayların uçları)
    const nodeGeo = track(new THREE.BufferGeometry());
    nodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
    const nodeMat = track(new THREE.PointsMaterial({ map: sprite, color: ACCENT, size: 0.1, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    globe.add(new THREE.Points(nodeGeo, nodeMat));

    // Paketler: her yayda bir ışık, farklı hız ve fazda
    const packetGeo = track(new THREE.BufferGeometry());
    const packetPos = new Float32Array(ARC_COUNT * 3);
    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
    const packetMat = track(new THREE.PointsMaterial({ map: sprite, color: HALO, size: 0.2, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending }));
    globe.add(new THREE.Points(packetGeo, packetMat));
    const packetPhase = curves.map(() => Math.random());
    const packetSpeed = curves.map(() => 0.12 + Math.random() * 0.18);

    // ── Uzak toz ──
    const dustGeo = track(new THREE.BufferGeometry());
    const dust = new Float32Array(700 * 3);
    for (let i = 0; i < 700; i++) {
      dust[i * 3] = (Math.random() - 0.5) * 22;
      dust[i * 3 + 1] = (Math.random() - 0.5) * 14;
      dust[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
    const dustMat = track(new THREE.PointsMaterial({ map: sprite, color: FOREGROUND, size: 0.026, transparent: true, opacity: 0.35, depthWrite: false }));
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Sayfa yerleşimine göre değişen opaklıklar (taban değerleri)
    const fadeTargets: [THREE.Material & { opacity: number }, number][] = [
      [sphereMat, 0.55], [glowMat, 0.08], [ringMat, 0.18], [arcMat, 0.28], [nodeMat, 0.9], [packetMat, 1],
    ];

    // ── Boyut ──
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Fare ve kaydırma ──
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Uygulama sayfalarında kaydırma iç <main>'de olur; capture ile hepsini yakalarız
    let scrollSpin = 0;
    let lastScrollTop = 0;
    const onScroll = (e: Event) => {
      const el = e.target === document ? document.scrollingElement : (e.target as HTMLElement);
      if (!el) return;
      const top = el.scrollTop;
      scrollSpin += (top - lastScrollTop) * 0.0015;
      lastScrollTop = top;
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    // ── Döngü ──
    const pastHero = () => window.scrollY > window.innerHeight * 0.6;
    const current: Placement = placementFor(pathRef.current, window.innerWidth < 768, pastHero());
    const clock = new THREE.Clock();
    let frame = 0;
    let spin = 0;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const target = placementFor(pathRef.current, window.innerWidth < 768, pastHero());
      const k = 1 - Math.pow(0.02, dt); // kare hızından bağımsız yumuşatma
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      current.scale += (target.scale - current.scale) * k;
      current.opacity += (target.opacity - current.opacity) * k;

      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;

      const halfWidth = halfHeight * camera.aspect;
      root.position.set(current.x * halfWidth + pointer.sx * 0.12, current.y * halfHeight - pointer.sy * 0.08, 0);
      root.scale.setScalar(current.scale);
      root.rotation.x = 0.25 + pointer.sy * 0.15;
      root.rotation.z = -pointer.sx * 0.05;

      spin += (scrollSpin - spin) * 0.08;
      globe.rotation.y = t * 0.08 * speed + spin;
      rings[0].rotation.y = t * 0.05 * speed;
      rings[1].rotation.y = -t * 0.035 * speed;
      dustPoints.rotation.y = t * 0.01 * speed;

      for (let i = 0; i < curves.length; i++) {
        const p = curves[i].getPoint((packetPhase[i] + t * packetSpeed[i] * speed) % 1);
        packetPos[i * 3] = p.x;
        packetPos[i * 3 + 1] = p.y;
        packetPos[i * 3 + 2] = p.z;
      }
      packetGeo.attributes.position.needsUpdate = true;

      for (const [mat, base] of fadeTargets) mat.opacity = base * current.opacity;
      dustMat.opacity = 0.35 * Math.max(current.opacity, 0.6);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll, { capture: true });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
