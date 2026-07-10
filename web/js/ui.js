// meyvetabagi — DOM helpers, icons, date/label constants. No app state here.
export const $ = (s, r = document) => r.querySelector(s);
export const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
export const esc = s => (s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
export const fmt = n => n.toLocaleString('tr-TR');
export const norm = s => (s || '').toLocaleLowerCase('tr').replace(/[çğıiöşü]/g, m => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' }[m]));

// count-up animation on view entry (dynamic numbers)
export function animateCounts() {
  document.querySelectorAll('.cnt').forEach(elm => {
    const raw = elm.getAttribute('data-count'); const to = parseFloat(raw); if (isNaN(to)) return;
    const dec = (String(raw).split('.')[1] || '').length; const dur = 650; let s = null;
    const fmtN = v => v.toLocaleString('tr-TR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    function step(t) { if (s === null) s = t; const p = Math.min((t - s) / dur, 1); const e = 1 - Math.pow(1 - p, 3); elm.textContent = fmtN(to * e); if (p < 1) requestAnimationFrame(step); else elm.textContent = fmtN(to); }
    elm.textContent = '0'; requestAnimationFrame(step);
  });
}
export const cnt = v => `<span class="cnt" data-count="${v}">${v}</span>`;

const SVG = s => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
export const ICON = {
  bugun: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>'),
  konular: SVG('<path d="M4 6.5l1.5 1.5L8 5.5"/><path d="M4 12l1.5 1.5L8 11"/><path d="M4 17.5l1.5 1.5L8 16.5"/><line x1="11" y1="6.5" x2="20" y2="6.5"/><line x1="11" y1="12" x2="20" y2="12"/><line x1="11" y1="17.5" x2="20" y2="17.5"/>'),
  takvim: SVG('<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/>'),
  denemeler: SVG('<path d="M4 20h16"/><path d="M6 20v-6"/><path d="M12 20V7"/><path d="M18 20v-9"/>'),
  check: SVG('<path d="M5 12.5l4 4L19 7"/>'),
  mag: SVG('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>'),
  spark: SVG('<path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/>'),
  moon: SVG('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
  sun: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"/>'),
  cog: SVG('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
  user: SVG('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  logout: SVG('<path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>'),
};

// ders renk kimliği — 9 ders, 9 renk (kırmızı/sarı durum renkleriyle çakışmaz)
const DERS_COLOR = {
  'Matematik': 'pink', 'Fizik': 'blue', 'Kimya': 'orange', 'Biyoloji': 'green',
  'Türk Dili ve Edebiyatı': 'purple', 'Tarih': 'yellow', 'Coğrafya': 'teal',
  'Felsefe': 'brown', 'Din Kültürü ve Ahlak Bilgisi': 'amber',
};
export const dersColor = name => DERS_COLOR[name] || 'pink';
export const dersDot = name => `<span class="ddot dd-${dersColor(name)}"></span>`;

// date/label constants
export const WD_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const WD_LONG = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const MON_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);  // 08:00–22:00

export function mondayOf(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
export function weekDates(offset) { const m = mondayOf(new Date()); m.setDate(m.getDate() + offset * 7); return WD_SHORT.map((_, i) => { const d = new Date(m); d.setDate(m.getDate() + i); return d; }); }

// single full-width page container (topbar shell) — views build their own layout inside
export function page(wide) {
  const p = $('#page'); p.innerHTML = '';
  p.className = 'page' + (wide ? ' wide' : '');
  return p;
}

// contextual chips slot in the topbar — the current view owns it, cleared on every render
export function setChips(node) {
  const c = $('#pagechips'); c.innerHTML = '';
  if (node) c.appendChild(node);
}
