import { mulberry32 } from '../utils/random.js';
import { svgEl, clamp01, easeOutCubic } from '../utils/svg.js';
import { intro } from '../core/state.js';

/* =========================================================================
   CIRCUITOS ELETRÔNICOS
   -------------------------------------------------------------------------
   1. Desenho inicial: cada trilha "nasce" do terminal até a moldura
      (progresso controlado pela sequência de entrada: intro.circuits).
   2. Pulsos de dados viajam pelas trilhas (nos dois sentidos), cada um
      com uma cor sorteada: verde, azul, vermelho ou laranja.
   2b. Neon: de tempos em tempos uma trilha inteira acende como um tubo de
      neon colorido (pisca ao ligar, brilha e apaga); até 4 ao mesmo tempo.
   3. Alguns terminais piscam suavemente; todos acendem quando um pulso
      sai deles ou chega neles.
   4. Etapa 4: terminais próximos do cursor acendem e disparam um pulso.

   As trilhas originais (HTML) não são duplicadas: os efeitos ficam numa
   camada própria SEM filtro (layer-circuits-fx). Assim o desfoque das
   linhas não é recalculado a cada quadro, o que mantém a animação leve.
   O "brilho" dos pulsos vem de um traço largo e translúcido por baixo.
   ========================================================================= */

const DRAW_STAGGER = 0.12;                // atraso relativo entre trilhas no desenho
const PULSE_LENGTH = 34;                  // comprimento do pulso
const BLINKING_NODES = [1, 4, 6, 9, 12];  // terminais que piscam sozinhos
const HOVER_RADIUS = 80;                  // alcance do cursor sobre os terminais
const HOVER_COOLDOWN = 1.4;               // s — intervalo mínimo entre disparos pelo cursor

/** Cores dos feixes: traço (--pulse), miolo claro no tema escuro (--pulse-hot)
    e brilho do terminal (--pulse-glow). */
const PULSE_COLORS = [
  { stroke: '#00FF00', hot: '#D2FFD2', glow: 'url(#g-electron)' },
  { stroke: '#1F8BFF', hot: '#D6EAFF', glow: 'url(#g-glow-blue)' },
  { stroke: '#FF1F3D', hot: '#FFD6DC', glow: 'url(#g-glow-red)' },
  { stroke: '#FF8C00', hot: '#FFE6C7', glow: 'url(#g-glow-orange)' },
];

const NEON_MAX = 4;                       // trilhas acesas em neon ao mesmo tempo
const NEON_IGNITION = 0.45;               // s — piscadas ao "ligar"
const NEON_FADE = 0.7;                    // s — apagar

export function createCircuitSystem(svg, interaction) {
  const fxLayer = svg.querySelector('[data-circuit-fx]');
  const groups = [...svg.querySelectorAll('.layer-circuits .circuit')];
  if (!fxLayer || !groups.length) return { update() {}, reset() {} };

  const rand = mulberry32(911);
  const traces = [];

  for (const group of groups) {
    const paths = [...group.querySelectorAll('.trace')];
    const nodes = [...group.querySelectorAll('.node')];

    // No HTML, a n-ésima trilha e o n-ésimo terminal de cada grupo se correspondem
    paths.forEach((path, i) => {
      const node = nodes[i];
      const length = path.getTotalLength();
      const d = path.getAttribute('d');
      const dash = `${PULSE_LENGTH} ${length + PULSE_LENGTH}`;
      // tubo de neon: trilha inteira com brilho largo, médio e miolo
      const neon = ['trace-neon trace-neon--bloom', 'trace-neon trace-neon--halo', 'trace-neon']
        .map((cls) => svgEl('path', { d, class: cls }));
      const halo = svgEl('path', { d, class: 'trace-pulse trace-pulse--halo', 'stroke-dasharray': dash });
      const core = svgEl('path', { d, class: 'trace-pulse', 'stroke-dasharray': dash });

      const cx = +node.getAttribute('cx');
      const cy = +node.getAttribute('cy');
      const glow = svgEl('g', { class: 'node-glow', transform: `translate(${cx} ${cy})` }, [
        svgEl('circle', { class: 'node-glow__halo', r: 13 }),
        svgEl('circle', { class: 'node-glow__core', r: 3.2 }),
      ]);
      fxLayer.append(...neon, halo, core, glow);

      traces.push({ path, node, cx, cy, length, halo, core, glow, neon, lit: null, blink: null, pulse: null, lastHover: -Infinity });
    });
  }

  traces.forEach((t, i) => {
    if (BLINKING_NODES.includes(i)) {
      t.blink = { speed: 0.9 + rand() * 0.8, phase: rand() * Math.PI * 2 };
    }
  });

  const spread = 1 + DRAW_STAGGER * (traces.length - 1);
  let drawing = false;
  let pulsesReady = false;

  const pickColor = () => PULSE_COLORS[Math.floor(rand() * PULSE_COLORS.length)];

  function setColor(elements, color) {
    for (const el of elements) {
      el.style.setProperty('--pulse', color.stroke);
      el.style.setProperty('--pulse-hot', color.hot);
      el.style.setProperty('--pulse-glow', color.glow);
    }
  }

  /** Sorteia a cor do próximo feixe da trilha (feixe e brilho do terminal). */
  function paint(trace) {
    setColor([trace.core, trace.halo, trace.glow], pickColor());
  }

  /* ---------- 2b. Neon ---------- */
  let neonNext = 0;

  function updateNeon(time) {
    // acende uma trilha nova de tempos em tempos (se houver vaga)
    if (time >= neonNext) {
      neonNext = time + 0.5 + rand() * 1.4;
      const active = traces.filter((t) => t.lit).length;
      const free = traces.filter((t) => !t.lit);
      if (active < NEON_MAX && free.length) {
        const t = free[Math.floor(rand() * free.length)];
        t.lit = { start: time, hold: 1.4 + rand() * 1.8, seed: rand() * 100 };
        setColor([...t.neon, t.glow], pickColor());
      }
    }

    for (const t of traces) {
      if (!t.lit) continue;
      const age = time - t.lit.start;
      const end = NEON_IGNITION + t.lit.hold;
      let v;
      if (age < NEON_IGNITION) {
        // liga piscando, como um tubo de neon
        const step = Math.floor(age * 26 + t.lit.seed);
        v = (step % 3 === 1 ? 0.15 : 1) * (0.5 + 0.5 * (age / NEON_IGNITION));
      } else if (age < end) {
        v = 0.9 + 0.1 * Math.sin(age * 14 + t.lit.seed);   // leve tremulação
      } else if (age < end + NEON_FADE) {
        v = 1 - (age - end) / NEON_FADE;
      } else {
        t.lit = null;
        v = 0;
      }
      const [bloom, halo, core] = t.neon;
      core.style.opacity = v.toFixed(3);
      halo.style.opacity = (v * 0.6).toFixed(3);
      bloom.style.opacity = (v * 0.25).toFixed(3);
      t.neonLevel = v;
    }
  }

  /** Agenda o próximo pulso de uma trilha a partir do instante `from`. */
  function schedule(trace, from) {
    const speed = 230 + rand() * 110;
    trace.pulse = {
      start: from + 1 + rand() * 4,      // pulsos frequentes
      duration: (trace.length + PULSE_LENGTH) / speed,
      reverse: rand() < 0.35,           // ~1/3 dos dados "chegam" ao terminal
    };
    paint(trace);
  }

  /** Dispara um pulso imediato saindo do terminal (cursor). */
  function fire(trace, time) {
    const speed = 300;
    trace.pulse = { start: time, duration: (trace.length + PULSE_LENGTH) / speed, reverse: false };
    paint(trace);
  }

  /* ---------- 1. Desenho inicial ---------- */
  function updateDraw() {
    const g = intro.circuits;
    if (g < 1) {
      drawing = true;
      traces.forEach((t, i) => {
        const local = clamp01(g * spread - i * DRAW_STAGGER);
        const p = easeOutCubic(local);
        t.path.style.strokeDasharray = `${t.length} ${t.length}`;
        t.path.style.strokeDashoffset = (t.length * (1 - p)).toFixed(1);
        t.node.style.opacity = clamp01(local * 4).toFixed(3);
      });
    } else if (drawing) {
      drawing = false;
      clearDrawStyles();
    }
  }

  function clearDrawStyles() {
    for (const t of traces) {
      t.path.style.strokeDasharray = '';
      t.path.style.strokeDashoffset = '';
      t.node.style.opacity = '';
    }
  }

  /* ---------- 2, 3 e 4. Pulsos, terminais e cursor ---------- */
  function updatePulses(time) {
    const strength = interaction?.strength ?? 0;

    for (const t of traces) {
      let flash = 0;

      // Cursor perto do terminal: acende e, se a trilha estiver livre, dispara um pulso
      let near = 0;
      if (strength > 0.01) {
        const d = Math.hypot(interaction.x - t.cx, interaction.y - t.cy);
        near = clamp01(1 - d / HOVER_RADIUS) * strength;
        const idle = !t.pulse || time < t.pulse.start;
        if (near > 0.55 && idle && time - t.lastHover > HOVER_COOLDOWN) {
          t.lastHover = time;
          fire(t, time);
        }
      }

      const { pulse } = t;
      if (pulse && time >= pulse.start) {
        const p = (time - pulse.start) / pulse.duration;
        if (p >= 1) {
          schedule(t, time);
          t.core.style.opacity = 0;
          t.halo.style.opacity = 0;
        } else {
          // dashoffset vai de +L_pulso (antes do início) até -L (depois do fim)
          const travel = t.length + PULSE_LENGTH;
          const offset = pulse.reverse ? -t.length + p * travel : PULSE_LENGTH - p * travel;
          const fade = clamp01(Math.min(p, 1 - p) / 0.08);
          t.core.setAttribute('stroke-dashoffset', offset.toFixed(1));
          t.halo.setAttribute('stroke-dashoffset', offset.toFixed(1));
          t.core.style.opacity = fade.toFixed(3);
          t.halo.style.opacity = (fade * 0.75).toFixed(3);
          // terminal acende quando o pulso sai dele (ida) ou chega nele (volta)
          flash = pulse.reverse ? clamp01((p - 0.82) / 0.18) : clamp01(1 - p / 0.15);
        }
      }

      const blink = t.blink ? 0.55 * (0.5 + 0.5 * Math.sin(time * t.blink.speed + t.blink.phase)) ** 2 : 0;
      t.glow.style.opacity = Math.max(flash, blink, near, t.lit ? t.neonLevel ?? 0 : 0).toFixed(3);
    }
  }

  function hideFx() {
    for (const t of traces) {
      t.core.style.opacity = 0;
      t.halo.style.opacity = 0;
      t.glow.style.opacity = 0;
      for (const el of t.neon) el.style.opacity = 0;
      t.lit = null;
    }
    neonNext = 0;
  }

  return {
    update(time) {
      if (time === 0) {
        pulsesReady = false;
        hideFx();
      }
      updateDraw();
      if (time === 0) return;

      // Os pulsos começam quando o desenho termina
      if (!pulsesReady && intro.circuits >= 1) {
        pulsesReady = true;
        for (const t of traces) schedule(t, time - 2.5);
      }
      if (pulsesReady) {
        updateNeon(time);
        updatePulses(time);
      }
    },

    /** Quadro estático: circuitos completos, sem efeitos. */
    reset() {
      drawing = false;
      pulsesReady = false;
      clearDrawStyles();
      hideFx();
    },
  };
}
