"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tüm sayfalara ortak hareket katmanı (sayfa kodlarına dokunmadan):
 *  - Kaydırınca giriş: başlıklar ve kartlar görünüme girerken aşağıdan, bulanıklıktan netleşerek gelir.
 *  - 3D eğim: küçük/orta kartlar fareye doğru eğilir.
 * Mevcut Framer Motion / Tailwind transform'larıyla çakışmamak için CSS'in ayrı
 * `translate`, `scale` ve `rotate` özellikleri kullanılır (globals.css → .nd-reveal, .nd-tilt).
 */

const CARD = '[class*="rounded-3xl"][class*="border"], [class*="rounded-2xl"][class*="border"], .apple-card, .landing-card, [data-reveal]';
const REVEAL = `main h1, main h2, main ${CARD.split(", ").join(", main ")}`;
const TILT = '.apple-card, .landing-card, [data-tilt], [class*="rounded-3xl"][class*="border"], [class*="rounded-2xl"][class*="border"]';
// Açılır pencere, çekmece, gezinme çubukları ve form alanları hareket etmez
const EXCLUDE = '[role="dialog"], .fixed, header, nav, aside, input, textarea, select, [data-no-motion]';
const MAX_TILT = 7; // derece

export function MotionLayer() {
  const pathname = usePathname();

  // ── Kaydırınca giriş ──
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${Math.min(order++ * 70, 350)}ms`;
          el.classList.add("nd-in");
          io.unobserve(el);
          // Giriş bitince sınıfları kaldır: kartın kendi hover geçişleri geri gelsin
          window.setTimeout(() => {
            el.style.transitionDelay = "";
            el.classList.remove("nd-reveal", "nd-in");
          }, 1400);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const register = (el: HTMLElement, allowInView: boolean) => {
      if (el.dataset.ndReveal || el.closest(EXCLUDE)) return;
      // İç içe kartlarda sadece en dıştaki hareket eder
      const parent = el.parentElement?.closest(REVEAL);
      if (parent && (parent as HTMLElement).dataset.ndReveal) return;
      el.dataset.ndReveal = "1";
      // Sayfa açılışında zaten görünen içerik gizlenmez (sayfa geçişi onu canlandırır)
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView && !allowInView) return;
      el.classList.add("nd-reveal");
      io.observe(el);
    };

    const scan = (rootEl: ParentNode, allowInView: boolean) => {
      rootEl.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => register(el, allowInView));
    };

    // İlk tarama, sayfa geçişinden hemen sonra
    const raf = requestAnimationFrame(() => scan(document, false));

    // Sonradan gelen içerik (ör. yüklenen dosya listesi) de canlansın
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement) || !n.closest("main")) return;
          if (n.matches(REVEAL)) register(n, true);
          scan(n, true);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // ── 3D eğim ──
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let active: HTMLElement | null = null;

    const TILT_TRANSITION = "rotate 0.35s cubic-bezier(0.16, 1, 0.3, 1)";

    // Kartın kendi geçişlerini koruyup rotate geçişini ekler
    const engage = (el: HTMLElement) => {
      if (el.classList.contains("nd-tilt")) return;
      const own = getComputedStyle(el).transition;
      el.dataset.ndTransition = el.style.transition;
      el.style.transition = own && !own.startsWith("all 0s") ? `${own}, ${TILT_TRANSITION}` : TILT_TRANSITION;
      el.classList.add("nd-tilt");
      if (el.parentElement) el.parentElement.style.perspective = "1000px";
    };

    // Bırakılan kart düzleşene kadar geçişi ve perspektifi korur
    const release = (el: HTMLElement) => {
      el.style.rotate = "";
      window.setTimeout(() => {
        if (el === active) return;
        el.classList.remove("nd-tilt");
        el.style.transition = el.dataset.ndTransition ?? "";
        delete el.dataset.ndTransition;
        if (el.parentElement) el.parentElement.style.perspective = "";
      }, 400);
    };

    const pickCard = (target: Element | null): HTMLElement | null => {
      let el = target?.closest<HTMLElement>(TILT) ?? null;
      while (el) {
        if (el.closest(EXCLUDE)) return null;
        const r = el.getBoundingClientRect();
        // Sadece kart genişliğindeki öğeler; geniş paneller/tablolar ve form kartları eğilmez
        if (r.width >= 120 && r.width <= 560 && r.height <= 900 && !el.querySelector("form, input, textarea, select")) return el;
        el = el.parentElement?.closest<HTMLElement>(TILT) ?? null;
      }
      return null;
    };

    const onMove = (e: PointerEvent) => {
      const el = pickCard(e.target as Element);
      if (el !== active) {
        if (active) release(active);
        active = el;
        if (el) engage(el);
      }
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      // rotateX/rotateY birleşimini tek eksen-açı olarak uygula
      const rx = -py * 2 * MAX_TILT;
      const ry = px * 2 * MAX_TILT;
      const angle = Math.hypot(rx, ry);
      el.style.rotate = angle < 0.05 ? "" : `${rx.toFixed(3)} ${ry.toFixed(3)} 0 ${angle.toFixed(2)}deg`;
    };

    const onLeaveWindow = () => {
      if (active) release(active);
      active = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeaveWindow);
      if (active) release(active);
    };
  }, []);

  return null;
}
