// meyvetabagi — ambient twinkling glyph field (character, à la vibecodedflopware).
// Deterministic seeded positions (no layout jump), fruit-toned, drifts + twinkles, behind everything.
// Honours prefers-reduced-motion. Pure decoration; zero effect on content or state.
const GLYPHS = ['✦', '✧', '·', '◦', '⋆', '✵', '✷', '˖', '⁺'];
const COLORS = ['--gold', '--rose', '--coral', '--amber', '--pink'];  // few warm sparkles on white

// tiny seeded PRNG so positions are stable across reloads (Math.random would jump every paint)
function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function initGlyphs() {
  if (document.getElementById('glyphfield')) return;
  const field = document.createElement('div');
  field.id = 'glyphfield';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = seeded(20260710);
  const N = reduce ? 6 : 12;
  for (let i = 0; i < N; i++) {
    const g = document.createElement('span');
    g.className = 'glyph';
    g.textContent = GLYPHS[Math.floor(rnd() * GLYPHS.length)];
    g.style.left = (rnd() * 100).toFixed(2) + 'vw';
    g.style.color = `var(${COLORS[Math.floor(rnd() * COLORS.length)]})`;
    g.style.fontSize = (9 + rnd() * 8).toFixed(1) + 'px';
    g.style.setProperty('--fall', (36 + rnd() * 48).toFixed(1) + 's');
    g.style.setProperty('--fd', (-rnd() * 60).toFixed(1) + 's');
    g.style.setProperty('--tw', (5 + rnd() * 5).toFixed(1) + 's');
    g.style.setProperty('--td', (-rnd() * 6).toFixed(1) + 's');
    const inner = document.createElement('span');
    inner.className = 'glyph-inner';
    inner.textContent = g.textContent; g.textContent = '';
    inner.style.setProperty('--tw', g.style.getPropertyValue('--tw'));
    g.appendChild(inner);
    field.appendChild(g);
  }
  document.body.insertBefore(field, document.body.firstChild);
}
