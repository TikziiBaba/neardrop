"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { useLanguage } from "@/lib/i18n/context";
import { createAllay } from "./allay-model";
import { FLEE_LINES, HOME_STOPS, routeTips, type Line } from "./allay-tips";

/**
 * Siteyi tanıtan 3D Allay rehberi.
 * - Fareyi takip etmez. Kullanıcı kaydırdıkça bölümden bölüme uçar ve konuşma balonuyla anlatır.
 * - Fare yaklaşınca kaçar.
 * - Bir butona basılınca uçup dokunur, döner ve nota saçar (tıklamayı geciktirmez).
 */

const CLICKABLE = 'button, a[href], [role="button"], input[type="submit"], input[type="button"], summary';

export function AllayGuide() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const pathRef = useRef(pathname);
  const localeRef = useRef(locale);
  pathRef.current = pathname;
  localeRef.current = locale;

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const noteLayerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<Element | null>(null);

  // Sayfa değişince kaydırma kaynağını sıfırla
  useEffect(() => {
    scrollerRef.current = null;
  }, [pathname]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const bubble = bubbleRef.current;
    const noteLayer = noteLayerRef.current;
    if (!wrap || !canvas || !bubble || !noteLayer) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const isMobile = () => window.innerWidth < 768;
    let size = isMobile() ? 130 : 190;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // WebGL yoksa rehber gösterilmez
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.2, 16);
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(3, 4, 6);
    scene.add(sun);

    const rig = createAllay();
    scene.add(rig.group);

    const applySize = () => {
      size = isMobile() ? 130 : 190;
      renderer.setSize(size, size, false);
      canvas.style.width = canvas.style.height = `${size}px`;
      wrap.style.width = wrap.style.height = `${size}px`;
    };
    applySize();
    window.addEventListener("resize", applySize);

    // ── Durum ──
    const pos = { x: window.innerWidth + size, y: window.innerHeight * 0.3, vx: 0, vy: 0 };
    const cursor = { x: -9999, y: -9999 };
    let lastStopKey = "";
    let talk: { text: string; until: number } = { text: "", until: 0 };
    let flee: { dx: number; dy: number; until: number } | null = null;
    let fleeCooldown = 0;
    let tap: { x: number; y: number; el: Element; touched: boolean; until: number } | null = null;
    let spinStart = -1;
    let yaw = 0;
    let frame = 0;
    const clock = new THREE.Clock();

    const say = (line: Line, ms: number) => {
      talk = { text: localeRef.current === "en" ? line.en : line.tr, until: performance.now() + ms };
    };

    // Hangi bölümdeyiz / hangi ipucu?
    const currentStop = (): { key: string; index: number; line: Line } => {
      const path = pathRef.current;
      if (path === "/") {
        let index = 0;
        HOME_STOPS.forEach((stop, i) => {
          const el = document.getElementById(stop.id);
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55) index = i;
        });
        return { key: `home-${index}`, index, line: HOME_STOPS[index].line };
      }
      const tips = routeTips(path);
      const sc = scrollerRef.current ?? document.scrollingElement;
      let index = 0;
      if (sc) {
        const range = sc.scrollHeight - sc.clientHeight;
        if (range > 80) index = Math.min(tips.length - 1, Math.floor((sc.scrollTop / range) * tips.length * 0.999));
      }
      return { key: `${path}-${index}`, index, line: tips[index] };
    };

    // Durak konumu: ana sayfada iki yan arasında uçar; uygulamada sağda kalır (kenar çubuğunu örtmesin)
    const anchorFor = (index: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (isMobile()) return { x: w - size * 0.5 - 6, y: h - size * 0.5 - (index % 2 ? 160 : 96) };
      const margin = size * 0.62;
      if (pathRef.current === "/") {
        const right = index % 2 === 0;
        // Hero'daki dosya kartlarının arasına denk gelecek yükseklikler
        return { x: right ? w - margin : margin, y: h * (0.47 + (index % 3) * 0.08) };
      }
      return { x: w - margin, y: h * (index % 2 ? 0.66 : 0.34) };
    };

    const notes = (x: number, y: number) => {
      const glyphs = ["♪", "♫", "♩", "♬"];
      for (let i = 0; i < 7; i++) {
        const n = document.createElement("span");
        n.className = "nd-note";
        n.textContent = glyphs[i % glyphs.length];
        n.style.left = `${x}px`;
        n.style.top = `${y}px`;
        n.style.setProperty("--dx", `${(Math.random() - 0.5) * 90}px`);
        n.style.setProperty("--dy", `${-40 - Math.random() * 60}px`);
        n.style.animationDelay = `${i * 40}ms`;
        n.style.fontSize = `${14 + Math.random() * 10}px`;
        noteLayer.appendChild(n);
        window.setTimeout(() => n.remove(), 1300);
      }
    };

    const touch = (el: Element, x: number, y: number) => {
      notes(x, y);
      spinStart = clock.elapsedTime;
      el.classList.remove("nd-magic");
      void (el as HTMLElement).offsetWidth; // animasyonu yeniden başlat
      el.classList.add("nd-magic");
      window.setTimeout(() => el.classList.remove("nd-magic"), 700);
    };

    // ── Olaylar ──
    const onMove = (e: PointerEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest(CLICKABLE);
      if (!el) return;
      tap = { x: e.clientX, y: e.clientY, el, touched: false, until: performance.now() + 1100 };
    };
    // Uygulama sayfalarında kaydırma iç kutuda olur; en son kaydırılan öğeyi izle
    const onScroll = (e: Event) => {
      const t = e.target;
      if (t === document || t === document.documentElement || t === document.body) scrollerRef.current = document.scrollingElement;
      else if (t instanceof Element && t.scrollHeight > t.clientHeight + 40 && t.clientHeight > window.innerHeight * 0.5) scrollerRef.current = t;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    // ── Döngü ──
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      const now = performance.now();
      const w = window.innerWidth;
      const h = window.innerHeight;

      const stop = currentStop();
      if (stop.key !== lastStopKey) {
        lastStopKey = stop.key;
        say(stop.line, 7500);
      }

      const anchor = anchorFor(stop.index);
      let tx = anchor.x + (reduce ? 0 : Math.sin(t * 0.9) * 26);
      let ty = anchor.y + (reduce ? 0 : Math.cos(t * 1.3) * 16);
      let stiffness = 0.04;
      let damping = 0.84;

      // Fare yaklaşınca kaç
      if (finePointer && !reduce && !tap) {
        const dist = Math.hypot(cursor.x - pos.x, cursor.y - pos.y);
        if (dist < size * 0.55 && now > fleeCooldown) {
          const ax = (pos.x - cursor.x) / (dist || 1);
          const ay = (pos.y - cursor.y) / (dist || 1);
          flee = { dx: ax * 230, dy: ay * 170 - 40, until: now + 1500 };
          fleeCooldown = now + 700;
          spinStart = t;
          if (Math.random() < 0.4) say(FLEE_LINES[Math.floor(Math.random() * FLEE_LINES.length)], 1600);
        }
      }
      if (flee && now < flee.until) {
        tx = anchor.x + flee.dx;
        ty = anchor.y + flee.dy;
        stiffness = 0.09;
        damping = 0.78;
      } else flee = null;

      // Butona dokunma
      if (tap) {
        tx = tap.x;
        ty = tap.y - size * 0.3;
        stiffness = reduce ? 1 : 0.16;
        damping = reduce ? 0 : 0.7;
        if (!tap.touched && Math.hypot(tx - pos.x, ty - pos.y) < 14) {
          tap.touched = true;
          tap.until = now + 650;
          touch(tap.el, tap.x, tap.y);
        }
        if (now > tap.until) tap = null;
      }

      // Ekrandan taşmasın
      const half = size * 0.5;
      tx = Math.min(w - half, Math.max(half, tx));
      ty = Math.min(h - half, Math.max(half + 60, ty));

      if (reduce && !tap) {
        pos.x = tx;
        pos.y = ty;
        pos.vx = pos.vy = 0;
      } else {
        pos.vx = (pos.vx + (tx - pos.x) * stiffness) * damping;
        pos.vy = (pos.vy + (ty - pos.y) * stiffness) * damping;
        pos.x += pos.vx;
        pos.y += pos.vy;
      }
      wrap.style.transform = `translate3d(${pos.x - size / 2}px, ${pos.y - size / 2}px, 0)`;

      // Model: gittiği yöne döner, hızlanınca eğilir, dokunurken/kaçarken bir tur döner
      const speed = Math.hypot(pos.vx, pos.vy);
      const wantYaw = Math.abs(pos.vx) > 0.8 ? Math.sign(pos.vx) * 0.75 : Math.sin(t * 0.7) * 0.25;
      yaw += (wantYaw - yaw) * 0.08;
      let spin = 0;
      if (spinStart >= 0) {
        const p = (t - spinStart) / 0.7;
        if (p >= 1) spinStart = -1;
        else spin = (1 - Math.pow(1 - p, 3)) * Math.PI * 2;
      }
      rig.group.rotation.y = yaw + spin;
      rig.group.rotation.z = Math.max(-0.35, Math.min(0.35, -pos.vx * 0.035));
      rig.group.rotation.x = Math.max(-0.3, Math.min(0.3, pos.vy * 0.02));
      rig.group.position.y = reduce ? 0 : Math.sin(t * 2.1) * 0.22;
      rig.animate(reduce ? 0 : t, 1 + Math.min(speed / 7, 1.3), tap ? -0.9 : 0);
      renderer.render(scene, camera);

      // Konuşma balonu: ekranın ortasına doğru açılır
      const showTalk = now < talk.until && !tap;
      if (bubble.dataset.text !== talk.text) {
        bubble.dataset.text = talk.text;
        bubble.textContent = talk.text;
      }
      const onRight = pos.x > w / 2;
      bubble.classList.toggle("nd-bubble-show", showTalk);
      bubble.classList.toggle("nd-bubble-left", onRight);
      const bw = bubble.offsetWidth;
      const bx = onRight ? pos.x - size * 0.38 - bw : pos.x + size * 0.38;
      const by = pos.y - size * 0.42;
      bubble.style.transform = `translate3d(${Math.max(8, Math.min(w - bw - 8, bx))}px, ${Math.max(8, by)}px, 0)`;
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", applySize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown, { capture: true });
      window.removeEventListener("scroll", onScroll, { capture: true });
      rig.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div ref={noteLayerRef} className="nd-note-layer" aria-hidden />
      <div ref={bubbleRef} className="nd-bubble" role="status" aria-live="polite" />
      <div ref={wrapRef} className="nd-allay" aria-hidden>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
}
