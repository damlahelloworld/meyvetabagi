// Onboarding - welcome → sign up → alan/sınıf/saat → ready. Answers FEED the çilek engine
// (alan → ders priority, saat → plan pacing). Local-only until the backend brings real accounts.
import { S, save } from '../state.js';
import { el, esc } from '../ui.js';
import { refresh } from '../router.js';
import { online, signUp, signIn, resetPassword, authErrMsg } from '../supa.js';

export function onboard() {
  document.querySelectorAll('.overlay').forEach(o => o.remove());
  const ov = el('div', 'overlay'); const box = el('div', 'onbox');
  const data = { email: '', name: '', target: '', grade: '', hours: '', pass: '' };
  let step = 0; const TOTAL = 5;
  const dots = on => Array.from({ length: TOTAL }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('');
  function chooser(key, title, sub, opts) {
    box.className = 'onbox';
    box.innerHTML = `<button class="onback">‹</button><div class="dots">${dots(step)}</div>
      <h2>${title}</h2><p>${sub}</p>
      <div class="opts">${opts.map(o => `<div class="opt${data[key] === o ? ' sel' : ''}" data-o="${esc(o)}">${esc(o)}</div>`).join('')}</div>
      <button class="btn" id="next">Devam</button>`;
    box.querySelectorAll('.opt').forEach(o => o.onclick = () => { data[key] = o.dataset.o; box.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x.dataset.o === data[key])); });
    box.querySelector('.onback').onclick = () => { step--; draw(); };
    box.querySelector('#next').onclick = () => { if (!data[key]) return; step++; draw(); };
  }
  function draw() {
    if (step === 0) {
      box.className = 'onbox welcome';
      box.innerHTML = `<div class="biglogo">m</div><h1>inkbee</h1>
        <p class="tag">Sabah kalkınca ne çalışacağını bilen yer. Resmi MEB kazanımları, tek yerde.</p>
        <button class="btn" id="signup">Ücretsiz üye ol</button>
        <button class="linkbtn" id="login">Zaten hesabım var</button>`;
      box.querySelector('#signup').onclick = () => { step = 1; draw(); };
      box.querySelector('#login').onclick = () => {
        if (!online()) { const nm = prompt('İsmin:'); if (nm && nm.trim()) { S.user = { name: nm.trim(), target: 'Sayısal' }; save(); ov.remove(); refresh(); } return; }
        box.className = 'onbox';
        box.innerHTML = `<button class="onback">‹</button>
          <h2>Giriş yap</h2><p>Hesabınla devam et - verilerin her cihazda seninle.</p>
          <label>E-posta</label><input id="em" type="email" placeholder="ornek@mail.com">
          <label>Şifre</label><input id="pw" type="password" placeholder="••••••••">
          <p id="err" class="hint"></p>
          <button class="btn" id="go">Giriş yap</button>
          <button class="linkbtn" id="forgot">Şifremi unuttum</button>`;
        box.querySelector('.onback').onclick = () => { step = 0; draw(); };
        box.querySelector('#go').onclick = async () => {
          const em = box.querySelector('#em').value.trim(), pw = box.querySelector('#pw').value;
          if (!em || !pw) return;
          try { await signIn(em, pw); ov.remove(); refresh(); }
          catch (e) { box.querySelector('#err').textContent = authErrMsg(e); }
        };
        box.querySelector('#forgot').onclick = async () => {
          const em = box.querySelector('#em').value.trim(), errEl = box.querySelector('#err');
          if (!em) { errEl.textContent = 'Önce e-postanı yaz, sonra tekrar tıkla.'; box.querySelector('#em').focus(); return; }
          errEl.textContent = 'Gönderiliyor…';
          try { await resetPassword(em); errEl.textContent = 'Sıfırlama bağlantısı gönderildi - gelen kutunu kontrol et.'; }
          catch (e) { errEl.textContent = authErrMsg(e); }
        };
      };
    } else if (step === 1) {
      box.className = 'onbox';
      box.innerHTML = `<button class="onback">‹</button><div class="dots">${dots(1)}</div>
        <h2>Hesabını oluştur</h2><p>Sana ismiyle hitap edelim, ilerlemeni kaydedelim.</p>
        <label>İsim</label><input id="nm" placeholder="örn. Damla" value="${esc(data.name)}">
        <label>E-posta</label><input id="em" type="email" placeholder="ornek@mail.com" value="${esc(data.email)}">
        ${online() ? '<label>Şifre</label><input id="pw" type="password" placeholder="en az 6 karakter">' : ''}
        <button class="btn" id="next">Devam</button>`;
      box.querySelector('.onback').onclick = () => { step = 0; draw(); };
      const go = () => {
        data.name = box.querySelector('#nm').value.trim(); data.email = box.querySelector('#em').value.trim();
        if (online()) { data.pass = box.querySelector('#pw').value; if (!data.pass || data.pass.length < 6) return box.querySelector('#pw').focus(); }
        if (!data.name) return box.querySelector('#nm').focus();
        if (online() && !data.email) return box.querySelector('#em').focus();
        step = 2; draw();
      };
      box.querySelector('#next').onclick = go;
      box.querySelector('#em').onkeydown = e => { if (e.key === 'Enter') go(); };
      setTimeout(() => box.querySelector('#nm').focus(), 30);
    } else if (step === 2) chooser('target', `${esc(data.name)}, alanın ne?`, 'öneriler ve programın buna göre önceliklenir.', ['Sayısal', 'Eşit Ağırlık', 'Sözel', 'Dil']);
    else if (step === 3) chooser('grade', 'Hangi seviyedesin?', 'Kazanımları buna göre diziyoruz.', ['9. sınıf', '10. sınıf', '11. sınıf', '12. sınıf', 'Mezun']);
    else if (step === 4) chooser('hours', 'Günde kaç saat çalışabilirsin?', 'program günlük bu tempoya göre kurulur.', ['2 saat', '4 saat', '6 saat', '8+ saat']);
    else {
      box.className = 'onbox';
      box.innerHTML = `<div class="logo">m</div><div class="dots">${dots(5)}</div>
        <h2>Hazırsın, ${esc(data.name)}!</h2>
        <p>${esc(data.target)} · ${esc(data.grade)} · günde ${esc(data.hours)}. Sana özel program ilk günden hazır.</p>
        <button class="btn" id="start">Başla</button>`;
      box.querySelector('#start').onclick = async () => {
        S.user = { name: data.name, email: data.email, target: data.target, grade: data.grade, hours: data.hours };
        save();
        if (online()) {
          try { await signUp(data.email, data.pass, { name: data.name, target: data.target, grade: data.grade, hours: data.hours }); }
          catch (e) { box.querySelector('.dots').insertAdjacentHTML('afterend', `<p class="hint">Hesap açılamadı: ${esc(authErrMsg(e))} - verilerin bu tarayıcıda güvende, sonra tekrar dene.</p>`); }
        }
        ov.remove(); refresh();
      };
    }
  }
  draw(); ov.appendChild(box); document.body.appendChild(ov);
}
