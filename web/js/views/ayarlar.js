// Ayarlar — own page (moved out of Profil on Damla's order, 2026-07-10): isim, alan, tema, çıkış, hesap silme.
import { S, save, applyTheme, wipeLocal } from '../state.js';
import { el, page } from '../ui.js';
import { refresh } from '../router.js';
import { onboard } from './onboard.js';
import { signOut, online, currentUser, deleteAccount, authErrMsg } from '../supa.js';

export function ayarlar() {
  const u = S.user || { name: 'Misafir', target: 'Sayısal' };
  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('div', 'crumb', 'AYARLAR'));
  d.appendChild(el('h1', null, 'Ayarlar'));
  d.appendChild(el('p', 'meta', 'Hesap ve uygulama tercihleri'));

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
  const r4 = el('div', 'setrow'); r4.innerHTML = `<div class="lbl"><b>Çıkış</b><span>verilerin ${online() && currentUser() ? 'hesabında güvende' : 'bu tarayıcıda kalır'}</span></div>`;
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
