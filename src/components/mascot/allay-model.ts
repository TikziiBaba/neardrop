import * as THREE from "three";

/**
 * Minecraft "Allay" esinli, bloklu 3D model (sıfırdan çizilmiş geometri ve piksel dokular).
 * Kafa, yarı saydam parlayan gövde, kollar ve çırpan kanatlar.
 */

// Allay paleti
const C = {
  base: "#62dcf5",
  light: "#a6f3ff",
  lighter: "#d4fbff",
  dark: "#38b3db",
  deeper: "#2b8fc4",
  eye: "#16336f",
  body: "#9ff0ff",
};

type Pixels = string[]; // her satır 8 karakter: renk anahtarı

const KEY: Record<string, string> = { L: C.light, W: C.lighter, B: C.base, D: C.dark, X: C.deeper, E: C.eye, ".": "transparent" };

function pixelTexture(rows: Pixels) {
  const size = rows.length;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  rows.forEach((row, y) =>
    row.split("").forEach((ch, x) => {
      const col = KEY[ch];
      if (col && col !== "transparent") {
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    })
  );
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter; // Minecraft gibi keskin pikseller
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const FACE: Pixels = [
  "WLLLLLLW",
  "LLBBBBLL",
  "BBBBBBBB",
  "BBEBBEBB",
  "BBEBBEBB",
  "BBBBBBBB",
  "DBBBBBBD",
  "DDDDDDDD",
];
const HEAD_SIDE: Pixels = [
  "LLLLLLLL",
  "LBBBLBBL",
  "BBBBBBBB",
  "BBLBBBBB",
  "BBBBBDBB",
  "BBBBBBBB",
  "DBBDBBBD",
  "DDDDDDDD",
];
const HEAD_TOP: Pixels = [
  "WLLLLLLW",
  "LLLWLLLL",
  "LLLLLLWL",
  "LWLLLLLL",
  "LLLLLWLL",
  "LLWLLLLL",
  "LLLLLLLL",
  "WLLLWLLW",
];
const WING: Pixels = [
  "..WWWW..",
  ".WLLLLW.",
  "WLLLLLLW",
  "WLLWLLLW",
  "WLLLLLLW",
  ".WLLLLW.",
  "..WLLW..",
  "...WW...",
];

export type AllayRig = {
  group: THREE.Group;
  /** t: saniye, flap: kanat hızı çarpanı, swing: kol sallama */
  animate: (t: number, flap: number, swing: number) => void;
  dispose: () => void;
};

export function createAllay(): AllayRig {
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

  const group = new THREE.Group();

  // ── Kafa: her yüze ayrı piksel doku ──
  const faceTex = keep(pixelTexture(FACE));
  const sideTex = keep(pixelTexture(HEAD_SIDE));
  const topTex = keep(pixelTexture(HEAD_TOP));
  // Parıltı dokunun kendisinden gelir (emissiveMap); böylece koyu gözler açık maviye boğulmaz
  const headMat = (map: THREE.Texture) =>
    keep(new THREE.MeshLambertMaterial({ map, emissiveMap: map, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.45 }));
  // BoxGeometry yüz sırası: +x, -x, +y, -y, +z (ön), -z
  const head = new THREE.Mesh(keep(new THREE.BoxGeometry(2.5, 2.5, 2.5)), [
    headMat(sideTex), headMat(sideTex), headMat(topTex), headMat(sideTex), headMat(faceTex), headMat(sideTex),
  ]);
  head.position.y = 1.35;
  group.add(head);

  // ── Gövde: yarı saydam, içten parlayan ──
  const bodyMat = keep(new THREE.MeshLambertMaterial({ color: C.body, emissive: new THREE.Color(C.light), emissiveIntensity: 0.55, transparent: true, opacity: 0.72 }));
  const body = new THREE.Mesh(keep(new THREE.BoxGeometry(1.5, 1.9, 1)), bodyMat);
  body.position.y = -0.85;
  group.add(body);
  // Gövdenin içinde parlak çekirdek
  const core = new THREE.Mesh(keep(new THREE.BoxGeometry(0.9, 1.2, 0.5)), keep(new THREE.MeshBasicMaterial({ color: C.lighter, transparent: true, opacity: 0.85 })));
  core.position.y = -0.8;
  group.add(core);

  // ── Kollar: omuzdan sallanır ──
  const armMat = keep(new THREE.MeshLambertMaterial({ color: C.base, emissive: new THREE.Color(C.base), emissiveIntensity: 0.3, transparent: true, opacity: 0.9 }));
  const armGeo = keep(new THREE.BoxGeometry(0.45, 1.5, 0.45));
  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.98, -0.15, 0.1);
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.y = -0.7;
    pivot.add(arm);
    group.add(pivot);
    return pivot;
  });

  // ── Kanatlar: sırttan, dikey eksende çırpar ──
  const wingTex = keep(pixelTexture(WING));
  const wingMat = keep(new THREE.MeshBasicMaterial({ map: wingTex, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }));
  const wingGeo = keep(new THREE.PlaneGeometry(2.4, 2.4));
  const wings = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.25, -0.35, -0.55);
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.x = side * 1.2;
    wing.rotation.y = side * -0.2;
    pivot.add(wing);
    group.add(pivot);
    return { pivot, side };
  });

  // ── Hale: arkada yumuşak camgöbeği parıltı ──
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 64;
  const gg = glowCanvas.getContext("2d")!;
  const grad = gg.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(140, 238, 255, 0.55)");
  grad.addColorStop(1, "rgba(140, 238, 255, 0)");
  gg.fillStyle = grad;
  gg.fillRect(0, 0, 64, 64);
  const glow = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(new THREE.CanvasTexture(glowCanvas)), blending: THREE.AdditiveBlending, depthWrite: false })));
  glow.scale.set(7.5, 7.5, 1);
  glow.position.set(0, 0.3, -1);
  group.add(glow);

  const animate = (t: number, flap: number, swing: number) => {
    const beat = Math.sin(t * 14 * flap);
    wings.forEach(({ pivot, side }) => {
      pivot.rotation.y = side * (0.55 + beat * 0.55);
    });
    arms[0].rotation.x = Math.sin(t * 3) * 0.25 + swing;
    arms[1].rotation.x = Math.sin(t * 3 + Math.PI) * 0.25 + swing;
    arms[0].rotation.z = -0.15;
    arms[1].rotation.z = 0.15;
    head.rotation.z = Math.sin(t * 1.6) * 0.06;
    glow.material.opacity = 0.75 + Math.sin(t * 2.2) * 0.2;
  };

  return {
    group,
    animate,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
