/**
 * Loop de animação único da Hero.
 *
 * Todos os sistemas animados (partículas, átomo…) se registram aqui e são
 * atualizados no MESMO requestAnimationFrame — mais eficiente do que cada
 * um ter seu próprio loop.
 *
 * O loop pausa sozinho quando:
 *  - a aba fica oculta (visibilitychange);
 *  - a Hero sai da tela (IntersectionObserver);
 *  - o usuário pede movimento reduzido (controlado por quem usa o loop).
 *
 * O tempo é ACUMULADO (não é o relógio do sistema): ao voltar de uma pausa
 * a animação continua de onde parou, sem saltos.
 */
export class AnimationLoop {
  constructor(observedElement) {
    this.systems = [];
    this.time = 0;
    this.enabled = false;     // permitido pelo usuário (reduced motion)
    this.pageVisible = !document.hidden;
    this.inView = true;
    this.rafId = 0;
    this.last = 0;
    this.tick = this.tick.bind(this);

    document.addEventListener('visibilitychange', () => {
      this.pageVisible = !document.hidden;
      this.sync();
    });

    if (observedElement && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting;
        this.sync();
      }).observe(observedElement);
    }
  }

  /** @param {{ update(time: number, delta: number): void }} system */
  add(system) {
    this.systems.push(system);
    system.update(this.time, 0);
  }

  start() { this.enabled = true; this.sync(); }

  stop() { this.enabled = false; this.sync(); }

  /**
   * Volta ao quadro estático (composição idêntica à referência).
   * Sistemas com animação de entrada implementam `reset()` para mostrar
   * o estado FINAL em vez do quadro 0 (ex.: circuitos já desenhados).
   */
  reset() {
    this.time = 0;
    for (const system of this.systems) {
      if (system.reset) system.reset();
      else system.update(0, 0);
    }
  }

  get running() { return this.rafId !== 0; }

  sync() {
    const shouldRun = this.enabled && this.pageVisible && this.inView;
    if (shouldRun && !this.running) {
      this.last = performance.now();
      this.rafId = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.running) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  tick(now) {
    // Limita o passo a 50 ms para evitar saltos após travamentos
    const delta = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.time += delta;
    for (const system of this.systems) system.update(this.time, delta);
    this.rafId = requestAnimationFrame(this.tick);
  }
}
