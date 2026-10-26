import { DESIGN, PALETTE } from '../config.js';
import { mulberry32, gaussian, lerp, smoothstep } from '../utils/random.js';

/* =========================================================================
   QUANTUM PARTICLE WAVE — dados
   -------------------------------------------------------------------------
   createWaveField() GERA os pontos (em coordenadas da referência) e devolve
   atributos prontos para a GPU. Quem desenha é:
     - particle-webgl.js  → Three.js (animado, padrão);
     - ParticleCanvas     → Canvas 2D estático (fallback sem WebGL).

   Cada ponto pertence a um "fio" de uma fita torcida em 3D. Em vez de
   guardar só a posição final, guardamos os PARÂMETROS da fita; assim o
   shader recalcula a torção e as ondas a cada quadro.

   Atributos (por ponto):
     base   (x, y)              centro da fita naquele trecho
     normal (nx, ny)            direção perpendicular à fita
     strand (s, half, ph0, tp)  posição no fio (-1…1), meia-largura,
                                fase da torção, parâmetro ao longo da fita (0…1)
     motion (amp, freq, drift, seed)  onda, frequência, flutuação livre, semente
     look   (size, alpha, w)    raio base, opacidade base, peso da profundidade
   ========================================================================= */

/**
 * Fitas de partículas. Cada fita é uma curva Bézier central com N fios
 * pontilhados distribuídos ao longo da largura. A torção (phase) faz os fios
 * se cruzarem, como as ondas da referência.
 */
const RIBBONS = [
  {
    // Lado esquerdo: entra pela borda e converge sob o "A"/"T"
    curve: [[-300, 820], [150, 850], [350, 1120], [760, 1200]],
    strands: 36,
    width: (t) => lerp(520, 220, t),
    phase: (t) => 0.5 + 1.9 * t,
    wave: { amp: 18, freq: 2.2 },
    step: 12,
    alpha: 1,
    fade: (t) => 1 - smoothstep(0.72, 1, t),
  },
  {
    // Camada secundária esquerda, mais baixa e fraca (dá volume à nuvem)
    curve: [[-300, 1010], [200, 1080], [400, 1180], [720, 1235]],
    strands: 18,
    width: (t) => lerp(260, 160, t),
    phase: (t) => 1.2 + 1.5 * t,
    wave: { amp: 12, freq: 1.6 },
    step: 14,
    alpha: 0.6,
    fade: (t) => 1 - smoothstep(0.65, 1, t),
  },
  {
    // Lado direito: nasce sob o "UZ" e se abre até a borda direita
    curve: [[1420, 1250], [1700, 1225], [1840, 1060], [2360, 1000]],
    strands: 36,
    width: (t) => lerp(300, 460, t),
    phase: (t) => -0.2 + 2.6 * t,
    wave: { amp: 14, freq: 1.8 },
    step: 12,
    alpha: 1,
    fade: (t) => smoothstep(0, 0.22, t),
  },
  {
    // Camada secundária direita
    curve: [[1500, 1180], [1750, 1150], [1950, 1080], [2360, 1160]],
    strands: 18,
    width: (t) => lerp(200, 300, t),
    phase: (t) => 0.9 + 1.8 * t,
    wave: { amp: 12, freq: 1.4 },
    step: 14,
    alpha: 0.55,
    fade: (t) => smoothstep(0, 0.3, t),
  },
];

/**
 * @param {object} [options]
 * @param {number} [options.seed]
 * @param {number} [options.density] 0…1 — fração de partículas mantidas
 *        (usado para aliviar celulares e máquinas modestas)
 */
export function createWaveField({ seed = 2048, density = 1 } = {}) {
  const rand = mulberry32(seed);
  const pts = [];

  for (const ribbon of RIBBONS) addRibbon(pts, rand, ribbon, density);

  // Poeira esparsa ao longo de toda a faixa central
  for (let i = 0; i < 420; i++) {
    const keep = rand() < density;
    const x = lerp(-300, 2350, rand());
    const y = 1010 + gaussian(rand) * 190;
    const size = 0.8 + rand() * 1.0;
    const alpha = 0.12 + rand() * 0.33;
    const drift = 6 + rand() * 10;
    const seedValue = rand();
    if (keep) pts.push(loosePoint(x, y, size, alpha, drift, seedValue));
  }

  // Nuvem discreta concentrada atrás do logotipo
  for (let i = 0; i < 520; i++) {
    const keep = rand() < density;
    const x = 1024 + gaussian(rand) * 520;
    const y = 1020 + gaussian(rand) * 95;
    const size = 0.8 + rand() * 0.8;
    const alpha = 0.15 + rand() * 0.25;
    const drift = 4 + rand() * 8;
    const seedValue = rand();
    if (keep) pts.push(loosePoint(x, y, size, alpha, drift, seedValue));
  }

  return pack(pts);
}

/** Partícula solta (poeira/nuvem): não pertence a fita, só ondula e flutua. */
function loosePoint(x, y, size, alpha, drift, seed) {
  return {
    base: [x, y],
    normal: [0, 1],
    strand: [0, 0, 0, x / DESIGN.width],
    motion: [5, 1.4, drift, seed],
    look: [size, alpha, 0],
  };
}

function addRibbon(pts, rand, cfg, density) {
  const { curve, strands, width, phase, wave, step, alpha: ribbonAlpha, fade } = cfg;
  const length = bezierLength(curve);
  const samples = Math.ceil(length / step);

  for (let i = 0; i < strands; i++) {
    const s = (i / (strands - 1)) * 2 - 1;          // posição do fio: -1 … 1
    const strandFade = 1 - 0.55 * Math.abs(s) ** 3; // fios das bordas mais fracos
    const tShift = rand() * 0.02;

    for (let k = 0; k <= samples; k++) {
      if (rand() < 0.16) continue;                  // falhas aleatórias = densidade irregular

      const t = Math.min(1, k / samples + tShift);
      const [cx, cy] = bezierPoint(curve, t);
      const [tx, ty] = bezierTangent(curve, t);
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;

      const ph0 = phase(t) + s * 0.15;
      const depth = (s * Math.sin(ph0) + 1) / 2;
      const baseAlpha = (0.35 + 0.55 * rand()) * fade(t) * strandFade * ribbonAlpha;
      const jx = (rand() - 0.5) * 4;
      const jy = (rand() - 0.5) * 4;
      const size = 0.75 + rand() * 0.5;
      // ~12% das partículas flutuam de forma independente
      const drift = rand() < 0.12 ? 8 + rand() * 10 : rand() * 2;
      const seedValue = rand();

      if (baseAlpha * (0.45 + 0.55 * depth) < 0.04) continue;
      if (rand() > density) continue;

      pts.push({
        base: [cx + jx, cy + jy],
        normal: [nx, ny],
        strand: [s, width(t) / 2, ph0, t],
        motion: [wave.amp, wave.freq, drift, seedValue],
        look: [size, baseAlpha, 1],
      });
    }
  }
}

/** Converte a lista de objetos em Float32Arrays contíguos (formato GPU). */
function pack(pts) {
  const n = pts.length;
  const field = {
    count: n,
    base: new Float32Array(n * 2),
    normal: new Float32Array(n * 2),
    strand: new Float32Array(n * 4),
    motion: new Float32Array(n * 4),
    look: new Float32Array(n * 3),
  };
  pts.forEach((p, i) => {
    field.base.set(p.base, i * 2);
    field.normal.set(p.normal, i * 2);
    field.strand.set(p.strand, i * 4);
    field.motion.set(p.motion, i * 4);
    field.look.set(p.look, i * 3);
  });
  return field;
}

/**
 * Posição/tamanho/opacidade de um ponto no instante 0 (quadro estático).
 * Espelha a fórmula do vertex shader em particle-webgl.js com uTime = 0.
 */
export function staticPoint(f, i) {
  const [bx, by] = [f.base[i * 2], f.base[i * 2 + 1]];
  const [nx, ny] = [f.normal[i * 2], f.normal[i * 2 + 1]];
  const s = f.strand[i * 4], half = f.strand[i * 4 + 1], ph = f.strand[i * 4 + 2], tp = f.strand[i * 4 + 3];
  const amp = f.motion[i * 4], freq = f.motion[i * 4 + 1];
  const size = f.look[i * 3], alpha = f.look[i * 3 + 1], w = f.look[i * 3 + 2];

  const offset = s * half * Math.cos(ph) + amp * Math.sin(Math.PI * 2 * freq * tp + s * 2);
  const depth = (s * Math.sin(ph) + 1) / 2;
  return {
    x: bx + nx * offset,
    y: by + ny * offset,
    r: size + 1.35 * depth * w,
    a: alpha * lerp(1, 0.45 + 0.55 * depth, w),
  };
}

/* ---------- Bézier cúbica ---------- */
function bezierPoint([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

function bezierTangent([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
  return [
    a * (p1[0] - p0[0]) + b * (p2[0] - p1[0]) + c * (p3[0] - p2[0]),
    a * (p1[1] - p0[1]) + b * (p2[1] - p1[1]) + c * (p3[1] - p2[1]),
  ];
}

function bezierLength(curve, segments = 64) {
  let total = 0;
  let [px, py] = bezierPoint(curve, 0);
  for (let i = 1; i <= segments; i++) {
    const [x, y] = bezierPoint(curve, i / segments);
    total += Math.hypot(x - px, y - py);
    px = x; py = y;
  }
  return total;
}

/**
 * Converte coordenadas da referência em pixels do canvas, a partir da
 * posição e escala atuais do <svg data-stage>. Usado pelos dois renderizadores.
 */
export function stageMapping(canvas, stage) {
  const canvasRect = canvas.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / DESIGN.width;
  return {
    width: canvasRect.width,
    height: canvasRect.height,
    scale,
    ox: stageRect.left - canvasRect.left,
    oy: stageRect.top - canvasRect.top - DESIGN.stageTop * scale,
  };
}

/* =========================================================================
   Renderizador estático (Canvas 2D) — FALLBACK quando não há WebGL
   ========================================================================= */
export class ParticleCanvas {
  constructor(canvas, stage, field) {
    this.canvas = canvas;
    this.stage = stage;
    this.field = field;
    this.ctx = canvas.getContext('2d');
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);   // mesmo limite do WebGL
    const { width, height } = this.canvas.getBoundingClientRect();
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.draw();
  }

  /** O fallback é estático: ignora o tempo. */
  update() {}

  draw() {
    const { ctx, field, dpr } = this;
    if (!ctx) return;

    const m = stageMapping(this.canvas, this.stage);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, m.width, m.height);
    ctx.fillStyle = PALETTE.particle;

    for (let i = 0; i < field.count; i++) {
      const p = staticPoint(field, i);
      const x = m.ox + p.x * m.scale;
      const y = m.oy + p.y * m.scale;
      if (x < -4 || y < -4 || x > m.width + 4 || y > m.height + 4) continue;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(p.r * m.scale, 0.55), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
