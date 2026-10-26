import { DESIGN } from '../config.js';

/* =========================================================================
   RASTREIO DO CURSOR
   -------------------------------------------------------------------------
   Converte a posição do mouse para coordenadas da referência (as mesmas do
   SVG e das partículas) e suaviza o movimento: os sistemas leem valores que
   "perseguem" o cursor, então tudo reage com inércia e volta devagar ao
   repouso quando o mouse sai da Hero.

   Só funciona com mouse/trackpad (hover + ponteiro fino). Em telas de toque
   o parallax ficaria preso no último toque, então fica desligado.
   ========================================================================= */

const LOGO_BOX = { x0: 170, x1: 1880, y0: 880, y1: 1140 };
const NUCLEUS = { x: 823, y: 1009 }; // ponto central do "O" do logo oficial

const damp = (current, target, rate, dt) => current + (target - current) * (1 - Math.exp(-rate * dt));

export class Interaction {
  constructor(hero, stage) {
    this.hero = hero;
    this.stage = stage;
    this.enabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Alvos (definidos pelo evento) e valores suavizados (lidos pelos sistemas)
    this.target = { x: 1024, y: 1010, nx: 0, ny: 0, inside: 0 };
    this.x = 1024;          // cursor em coordenadas da referência
    this.y = 1010;
    this.nx = 0;            // cursor normalizado na janela (-1 … 1)
    this.ny = 0;
    this.strength = 0;      // 0 = cursor fora / sem interação, 1 = ativo
    this.logoHover = 0;     // 0…1 — cursor sobre o logotipo
    this.nucleus = 0;       // 0…1 — proximidade do núcleo

    if (this.enabled) {
      hero.addEventListener('pointermove', (e) => this.onMove(e), { passive: true });
      hero.addEventListener('pointerleave', () => { this.target.inside = 0; });
      // a posição do palco muda com rolagem e redimensionamento
      window.addEventListener('scroll', () => { this.rect = null; }, { passive: true });
      window.addEventListener('resize', () => { this.rect = null; });
    }
  }

  onMove(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const rect = this.rect || (this.rect = this.stage.getBoundingClientRect());
    const scale = rect.width / DESIGN.width;
    this.target.x = (event.clientX - rect.left) / scale;
    this.target.y = (event.clientY - rect.top) / scale + DESIGN.stageTop;
    this.target.nx = (event.clientX / window.innerWidth) * 2 - 1;
    this.target.ny = (event.clientY / window.innerHeight) * 2 - 1;
    this.target.inside = 1;
  }

  update(time, dt) {
    if (!this.enabled) return;
    const t = this.target;
    this.x = damp(this.x, t.x, 7, dt);
    this.y = damp(this.y, t.y, 7, dt);
    // parallax volta ao centro quando o cursor sai
    this.nx = damp(this.nx, t.nx * t.inside, 2.5, dt);
    this.ny = damp(this.ny, t.ny * t.inside, 2.5, dt);
    this.strength = damp(this.strength, t.inside, 3, dt);

    const overLogo = t.inside && t.x > LOGO_BOX.x0 && t.x < LOGO_BOX.x1 && t.y > LOGO_BOX.y0 && t.y < LOGO_BOX.y1;
    this.logoHover = damp(this.logoHover, overLogo ? 1 : 0, 3.5, dt);

    const d = Math.hypot(this.x - NUCLEUS.x, this.y - NUCLEUS.y);
    this.nucleus = Math.exp(-((d / 260) ** 2)) * this.strength;
  }

  /** Estado neutro (movimento reduzido). */
  reset() {
    Object.assign(this, { nx: 0, ny: 0, strength: 0, logoHover: 0, nucleus: 0 });
    this.target.inside = 0;
  }
}
