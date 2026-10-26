import * as THREE from 'three';
import { PALETTE } from '../config.js';
import { intro, fx } from '../core/state.js';
import { stageMapping } from './particle-field.js';

/* =========================================================================
   QUANTUM PARTICLE WAVE — renderizador Three.js (WebGL)
   -------------------------------------------------------------------------
   Todas as partículas formam UM único THREE.Points com um BufferGeometry.
   O movimento é calculado no vertex shader (na GPU): o JavaScript só envia
   o tempo a cada quadro, então milhares de pontos custam quase nada à CPU.

   Movimentos (todos valem 0 em uTime = 0, para o quadro inicial ser igual
   à composição aprovada na Etapa 1):
     1. torção 3D das fitas, que viaja da esquerda para a direita;
     2. onda senoidal propagando da esquerda para a direita;
     3. oscilação vertical global suave;
     4. flutuação independente de algumas partículas;
     5. pulso de energia ocasional atravessando o campo.

   Etapa 4 (interação):
     6. parallax — fios "da frente" se deslocam mais que os do fundo;
     7. o cursor afasta as partículas próximas e as ilumina (volta suave);
     8. entrada — a nuvem começa dispersa e converge para as ondas;
     9. onda do ENTER — um anel de energia sai do núcleo e cruza o campo.
   ========================================================================= */

const vertexShader = /* glsl */ `
  attribute vec2 aNormal;
  attribute vec4 aStrand;   // s, meia-largura, fase inicial, parâmetro tp
  attribute vec4 aMotion;   // amplitude, frequência, flutuação, semente
  attribute vec3 aLook;     // raio, opacidade, peso da profundidade

  uniform float uTime;
  uniform float uScale;       // px de tela por unidade da referência
  uniform vec2  uOffset;      // origem da referência em px do canvas
  uniform vec2  uViewport;    // tamanho do canvas em px CSS
  uniform float uPixelRatio;
  uniform float uPulseX;      // posição x (referência) do pulso de energia
  uniform vec2  uParallax;    // deslocamento de parallax (-1 … 1)
  uniform vec2  uPointer;     // cursor (coordenadas da referência)
  uniform float uPointerStrength;
  uniform float uIntro;       // 0 = nuvem dispersa, 1 = ondas formadas
  uniform vec2  uWaveCenter;  // núcleo atômico
  uniform float uWaveRadius;
  uniform float uWaveStrength;

  varying float vAlpha;
  varying float vPulse;
  varying float vRadius;
  varying float vSize;

  const float TAU = 6.28318530718;

  void main() {
    float s     = aStrand.x;
    float halfW = aStrand.y;
    float tp    = aStrand.w;
    float seed  = aMotion.w * TAU;

    // 1. Torção 3D: oscila em torno da fase original e "viaja" ao longo da fita
    float ph = aStrand.z + 0.5 * (sin(uTime * 0.21 - tp * 2.0) - sin(-tp * 2.0));

    // 2. Onda propagando da esquerda para a direita
    float wave = aMotion.x * sin(TAU * aMotion.y * tp - uTime * 0.9 + s * 2.0);

    vec2 p = position.xy + aNormal * (s * halfW * cos(ph) + wave);

    // 3. Oscilação vertical global
    p.y += 7.0 * (sin(uTime * 0.55 + p.x * 0.0035) - sin(p.x * 0.0035));

    // 4. Flutuação independente (círculos lentos com fase própria)
    p += aMotion.z * vec2(
      sin(uTime * (0.25 + 0.2 * aMotion.w) + seed) - sin(seed),
      cos(uTime * (0.2 + 0.25 * aMotion.w) + seed * 1.7) - cos(seed * 1.7)
    );

    // Profundidade: fios "na frente" ficam maiores e mais opacos
    float depth = (s * sin(ph) + 1.0) * 0.5;

    // 6. Parallax proporcional à profundidade
    p += uParallax * (6.0 + 16.0 * depth);

    // 8. Entrada: cada partícula parte de um ponto disperso e converge
    vec2 scatter = vec2(cos(seed * 1.3), sin(seed * 1.3)) * (120.0 + 260.0 * aMotion.w);
    p += scatter * (1.0 - uIntro);
    float appear = clamp(uIntro * 1.6 - aMotion.w * 0.6, 0.0, 1.0);

    // 7. Cursor: empurra as partículas próximas (deformação suave)
    vec2 toPointer = p - uPointer;
    float pointerDist = max(length(toPointer), 0.001);
    float influence = exp(-pow(pointerDist / 150.0, 2.0)) * uPointerStrength;
    p += toPointer / pointerDist * influence * 32.0;

    // 9. Onda do ENTER: anel que se expande a partir do núcleo
    vec2 fromCore = p - uWaveCenter;
    float coreDist = max(length(fromCore), 0.001);
    float ring = exp(-pow((coreDist - uWaveRadius) / 90.0, 2.0)) * uWaveStrength;
    p += fromCore / coreDist * ring * 40.0;

    // 5. Pulso de energia
    float pulse = exp(-pow((p.x - uPulseX) / 110.0, 2.0));
    float energy = max(max(pulse, ring), influence * 0.6);
    vPulse = energy;

    vAlpha = aLook.y * mix(1.0, 0.45 + 0.55 * depth, aLook.z)
           * (1.0 + 0.9 * pulse + 1.0 * influence + 1.4 * ring) * appear;

    float radiusPx = max((aLook.x + 1.35 * depth * aLook.z) * (1.0 + 0.35 * energy) * uScale, 0.55);
    vRadius = radiusPx * uPixelRatio;
    vSize = (radiusPx * 2.0 + 2.0) * uPixelRatio;   // +2 px de margem para o antisserrilhado
    gl_PointSize = vSize;

    vec2 px = uOffset + p * uScale;
    gl_Position = vec4(px.x / uViewport.x * 2.0 - 1.0, 1.0 - px.y / uViewport.y * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uPulseColor;

  varying float vAlpha;
  varying float vPulse;
  varying float vRadius;
  varying float vSize;

  void main() {
    // Círculo nítido com borda suavizada (cobertura calculada em pixels)
    float dist = length(gl_PointCoord - 0.5) * vSize;
    float coverage = clamp(vRadius + 0.5 - dist, 0.0, 1.0);
    float alpha = min(coverage * vAlpha, 1.0);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(mix(uColor, uPulseColor, vPulse * 0.7), alpha);
  }
`;

/** Cor hexadecimal → vec3 sem conversão de espaço de cor (o shader escreve direto). */
function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Pulso: atravessa a faixa em 5 s, a cada 9 s (o primeiro começa em ~2 s). */
function pulsePosition(time) {
  const cycle = (time + 7) % 9;
  return -300 + Math.min(cycle / 5, 1) * 2700;
}

export function createParticleRenderer(canvas, stage, field, interaction) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const geometry = new THREE.BufferGeometry();
  const position = new Float32Array(field.count * 3);
  for (let i = 0; i < field.count; i++) {
    position[i * 3] = field.base[i * 2];
    position[i * 3 + 1] = field.base[i * 2 + 1];
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('aNormal', new THREE.BufferAttribute(field.normal, 2));
  geometry.setAttribute('aStrand', new THREE.BufferAttribute(field.strand, 4));
  geometry.setAttribute('aMotion', new THREE.BufferAttribute(field.motion, 4));
  geometry.setAttribute('aLook', new THREE.BufferAttribute(field.look, 3));

  const uniforms = {
    uTime: { value: 0 },
    uScale: { value: 1 },
    uOffset: { value: new THREE.Vector2() },
    uViewport: { value: new THREE.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uPulseX: { value: pulsePosition(0) },
    uColor: { value: hexToVec3(PALETTE.particle) },
    uPulseColor: { value: hexToVec3(PALETTE.neon) },
    uParallax: { value: new THREE.Vector2() },
    uPointer: { value: new THREE.Vector2(1024, 1010) },
    uPointerStrength: { value: 0 },
    uIntro: { value: 1 },
    uWaveCenter: { value: new THREE.Vector2(823, 1009) }, // núcleo (ponto do "O")
    uWaveRadius: { value: 0 },
    uWaveStrength: { value: 0 },
  };

  /** Copia o estado compartilhado (cursor, entrada, ENTER) para os uniforms. */
  function syncState() {
    const i = interaction;
    uniforms.uParallax.value.set(-(i?.nx ?? 0), -(i?.ny ?? 0) * 0.6);
    uniforms.uPointer.value.set(i?.x ?? 1024, i?.y ?? 1010);
    uniforms.uPointerStrength.value = i?.strength ?? 0;
    // easing na própria leitura: a convergência desacelera no fim
    uniforms.uIntro.value = 1 - (1 - intro.particles) ** 3;
    uniforms.uWaveRadius.value = fx.waveRadius;
    uniforms.uWaveStrength.value = fx.waveStrength;
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false; // a posição é calculada no shader

  const scene = new THREE.Scene();
  scene.add(points);
  const camera = new THREE.Camera(); // não usada: o shader já gera coordenadas de tela

  const render = () => renderer.render(scene, camera);

  return {
    kind: 'webgl',

    resize() {
      // até 1.5×: em telas 3× (iPhone) o ganho visual é mínimo e o custo da GPU, alto
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const m = stageMapping(canvas, stage);
      renderer.setPixelRatio(dpr);
      renderer.setSize(m.width, m.height, false);
      uniforms.uPixelRatio.value = dpr;
      uniforms.uScale.value = m.scale;
      uniforms.uOffset.value.set(m.ox, m.oy);
      uniforms.uViewport.value.set(m.width, m.height);
      render();
    },

    update(time) {
      syncState();
      uniforms.uTime.value = time;
      uniforms.uPulseX.value = pulsePosition(time); // em t = 0 o pulso está fora da tela
      render();
    },

    draw: render,
  };
}
