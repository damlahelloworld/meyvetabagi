// Profil — account card, stats, activity heatmap, Damla ile birebir (randevu + mesaj), settings.
import { S, save, applyTheme, streak, dstr, wipeLocal } from '../state.js';
import { totals } from '../data.js';
import { el, esc, page, WD_SHORT, MON_SHORT } from '../ui.js';
import { refresh } from '../router.js';
import { onboard } from './onboard.js';
import { signOut, online, currentUser, deleteAccount, authErrMsg } from '../supa.js';

function heatmap() {
  const wrap = el('div', 'heatwrap');
  const total = Object.values(S.activity).reduce((a, b) => a + b, 0);
  wrap.appendChild(el('div', 'ht', `Son 12 hafta · ${total} tamamlama · ${streak()} gün seri`));
  const grid = el('div', 'heat');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const wd = (today.getDay() + 6) % 7;
  const start = new Date(today); start.setDate(today.getDate() - wd - 11 * 7);  // 11 tam hafta + içinde bulunulan hafta = 12 sütun
  for (let dt = new Date(start); dt <= today; dt.setDate(dt.getDate() + 1)) {
    const k = dstr(dt);
    const c = S.activity[k] || 0;
    const lvl = c === 0 ? '' : c < 2 ? 'l1' : c < 4 ? 'l2' : c < 6 ? 'l3' : 'l4';
    const cell = el('i', lvl); cell.title = `${k}: ${c} tamamlama`;
    grid.appendChild(cell);
  }
  wrap.appendChild(grid);
  const leg = el('div', 'heatleg');
  leg.innerHTML = `az <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> çok`;
  wrap.appendChild(leg);
  return wrap;
}

export function profil() {
  const u = S.user || { name: 'Misafir', target: 'Sayısal' };
  const initial = (u.name || '?').trim().charAt(0).toLocaleUpperCase('tr');
  const t = totals();
  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('div', 'crumb', 'HESAP'));
  const head = el('div', 'profhead');
  head.innerHTML = `<div class="bigava">${esc(initial)}</div><div><h1>${esc(u.name)}</h1>
    <p class="meta">${esc(u.target || 'Sayısal')} · YKS 2026</p></div>`;
  d.appendChild(head);

  const cards = el('div', 'grid cards prof');
  cards.appendChild(el('div', 'card c-teal', `<div class="k">Yeşil kazanım</div><div class="v">%${t.greenPct}<small> · ${t.green}/${t.total}</small></div>`));
  cards.appendChild(el('div', 'card c-blue', `<div class="k">Toplam çalışma</div><div class="v">${Object.values(S.activity).reduce((a, b) => a + b, 0)}</div>`));
  cards.appendChild(el('div', 'card c-pink', `<div class="k">Güncel seri</div><div class="v">${streak()}<small> gün</small></div>`));
  d.appendChild(cards);

  d.appendChild(el('div', 'seclabel', 'Aktivite'));
  d.appendChild(heatmap());

  d.appendChild(el('div', 'seclabel', 'Damla ile birebir'));
  d.appendChild(el('p', 'meta', 'Takıldığın yerde birebir görüşme alabilir, mesaj bırakabilirsin. Şimdilik bu tarayıcıda saklanır — canlı bağlantı yakında.'));
  const booked = new Set(S.randevu.map(r => r.date + ' ' + r.time));
  const now = new Date();
  const wrap = el('div', 'rvwrap');
  for (let i = 0; i < 7; i++) {
    const dt = new Date(); dt.setDate(dt.getDate() + i); const ds = dstr(dt);
    const dayEl = el('div', 'rvday');
    dayEl.appendChild(el('div', 'rvd', `${WD_SHORT[(dt.getDay() + 6) % 7]} ${dt.getDate()} ${MON_SHORT[dt.getMonth()]}`));
    const sl = el('div', 'slots');
    ['16:00', '18:00', '20:00'].forEach(tm => {
      if (i === 0 && parseInt(tm) <= now.getHours()) return;  // today's past hours are not bookable
      const key = ds + ' ' + tm; const b = el('button', 'slot' + (booked.has(key) ? ' taken' : ''), tm);
      if (booked.has(key)) b.disabled = true;
      else b.onclick = () => { S.randevu.push({ id: 'r' + Date.now(), date: ds, time: tm }); save(); refresh(); };
      sl.appendChild(b);
    });
    if (!sl.children.length) sl.appendChild(el('span', 'hint', 'bugünün saatleri geçti'));
    dayEl.appendChild(sl); wrap.appendChild(dayEl);
  }
  d.appendChild(wrap);

  if (S.randevu.length) {
    d.appendChild(el('div', 'seclabel', 'Randevularım'));
    const rset = el('div', 'setcard');
    S.randevu.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).forEach(r => {
      const row = el('div', 'setrow');
      row.innerHTML = `<div class="lbl"><b>${r.date} · ${r.time}</b><span>Damla ile birebir görüşme</span></div>`;
      const c = el('button', 'repminus', 'İptal'); c.onclick = () => { S.randevu = S.randevu.filter(x => x.id !== r.id); save(); refresh(); };
      row.appendChild(c); rset.appendChild(row);
    });
    d.appendChild(rset);
  }

  d.appendChild(el('div', 'seclabel', 'Mesajlar'));
  const chat = el('div', 'chat');
  const thread = el('div', 'thread');
  S.messages.forEach(m => { const b = el('div', 'msg ' + m.from); b.innerHTML = `<div class="bub">${esc(m.text)}</div>`; thread.appendChild(b); });
  chat.appendChild(thread);
  const bar = el('div', 'chatbar');
  const inp = el('input'); inp.placeholder = 'Damla\'ya yaz…';
  const send = el('button', 'btn', 'Gönder');
  const doSend = () => { const v = inp.value.trim(); if (!v) return; S.messages.push({ from: 'student', text: v }); save(); refresh(); };
  send.onclick = doSend; inp.onkeydown = e => { if (e.key === 'Enter') doSend(); };
  bar.appendChild(inp); bar.appendChild(send); chat.appendChild(bar);
  d.appendChild(chat);
  thread.scrollTop = thread.scrollHeight;

  d.appendChild(el('div', 'seclabel', 'Ayarlar'));
  const set = el('div', 'setcard');
  const r1 = el('div', 'setrow'); r1.innerHTML = `<div class="lbl"><b>İsim</b><span>uygulama seni böyle çağırır</span></div>`;
  const ni = el('input'); ni.value = u.name; ni.onchange = () => { S.user.name = ni.value.trim() || 'Öğrenci'; save(); refresh(); };
  r1.appendChild(ni); set.appendChild(r1);
  const r2 = el('div', 'setrow'); r2.innerHTML = `<div class="lbl"><b>Alan</b><span>çilek önerileri ve program önceliğin</span></div>`;
  const sel = el('select'); ['Sayısal', 'Eşit Ağırlık', 'Sözel', 'Dil'].forEach(o => { const op = el('option', null, o); op.value = o; if (o === u.target) op.selected = true; sel.appendChild(op); });
  sel.onchange = () => { S.user.target = sel.value; save(); refresh(); };
  r2.appendChild(sel); set.appendChild(r2);
  const r3 = el('div', 'setrow'); r3.innerHTML = `<div class="lbl"><b>Tema</b><span>koyu / açık</span></div>`;
  const tb = el('button', 'btn ghost', S.theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');
  tb.onclick = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); refresh(); };
  r3.appendChild(tb); set.appendChild(r3);
  const r4 = el('div', 'setrow'); r4.innerHTML = `<div class="lbl"><b>Çıkış</b><span>verilerin bu tarayıcıda kalır</span></div>`;
  const lo = el('button', 'btn ghost danger', 'Çıkış yap');
  lo.onclick = async () => { if (confirm('Çıkış yapılsın mı?')) { await signOut(); S.user = null; save(); location.hash = '#/bugun'; onboard(); } };
  r4.appendChild(lo); set.appendChild(r4);
  if (online() && currentUser()) {  // KVKK: permanent one-tap deletion, account + all rows
    const r5 = el('div', 'setrow'); r5.innerHTML = `<div class="lbl"><b>Hesabı kalıcı sil</b><span>hesabın ve tüm verilerin — geri alınamaz</span></div>`;
    const del = el('button', 'btn ghost danger', 'Hesabı sil');
    del.onclick = async () => {
      if (prompt('Bu işlem geri alınamaz: hesabın ve tüm verilerin kalıcı olarak silinir.\nOnaylamak için SİL yaz:') !== 'SİL') return;
      del.disabled = true; del.textContent = 'Siliniyor…';
      try { await deleteAccount(); wipeLocal(); location.reload(); }
      catch (e) { del.disabled = false; del.textContent = 'Hesabı sil'; alert('Silinemedi: ' + authErrMsg(e)); }
    };
    r5.appendChild(del); set.appendChild(r5);
  }
  d.appendChild(set);
}
