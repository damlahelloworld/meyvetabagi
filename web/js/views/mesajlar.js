// Mesajlar — Damla ile mesajlaşma (own page; moved out of Profil on Damla's order, 2026-07-10).
import { S, save } from '../state.js';
import { el, esc, page } from '../ui.js';
import { refresh } from '../router.js';

export function mesajlar() {
  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('div', 'crumb', 'MESAJLAR'));
  d.appendChild(el('h1', null, 'Mesajlar'));
  d.appendChild(el('p', 'meta', 'Takıldığın yeri yaz — şimdilik bu tarayıcıda saklanır, canlı bağlantı yakında.'));

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
}
