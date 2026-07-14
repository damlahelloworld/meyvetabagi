// Kaynakça - full sources page (MLA), linked from the wordmark. Damla, 2026-07-10:
// heavy sourcing or it reads as made-up. Everything the product's content and çilek rest on, cited.
import { el, page } from '../ui.js';
import { allKaz } from '../data.js';

export function kaynakca() {
  const d = el('div', 'pagein'); page().appendChild(d);
  d.appendChild(el('h1', null, 'Kaynakça'));
  d.appendChild(el('p', 'meta', 'meyvetabagi içeriğinin kaynağı ve çalışma yöntemi - MLA biçiminde.'));

  d.appendChild(el('div', 'seclabel', 'birincil kaynak · kazanımlar'));
  const k1 = el('div', 'kaynakca wide');
  k1.innerHTML = `
    <p class="cite">Millî Eğitim Bakanlığı, Talim ve Terbiye Kurulu Başkanlığı. <i>2026 Yükseköğretim Kurumları Sınavına Esas Konu ve Kazanımlar.</i> T.C. Millî Eğitim Bakanlığı, 2025, ttkb.meb.gov.tr.</p>
    <p class="citenote">Uygulamadaki ${allKaz().length} kazanımın TAMAMI bu resmî belgeden ayrıştırılmıştır - kodlar, başlıklar ve açıklamalar birebir MEB metnidir. Üretilmiş, düzenlenmiş ya da uydurulmuş kazanım yoktur. (Mantık, Sosyoloji, Psikoloji ve İnkılap Tarihi bölümleri belgedeki teknik sorunlar nedeniyle henüz ayrıştırılamadı; eklenince burada belirtilecek.)</p>`;
  d.appendChild(k1);

  d.appendChild(el('div', 'seclabel', 'nasıl çalışır'));
  const k2 = el('div', 'kaynakca wide');
  k2.innerHTML = `
    <p class="citenote"><b>Değerlendirme ("anlat bakalım"):</b> yazdığın metin, ilgili kazanımın resmî MEB açıklamasındaki kavramlarla karşılaştırılır (kural tabanlı kapsama analizi, ek toleranslı kök eşleme). Yapay zekâ modeli KULLANILMAZ; metnin internete gönderilmez, hesaplama tarayıcında yapılır. Her değerlendirmenin altında hangi kaynağın kullanıldığı yazar.</p>
    <p class="citenote"><b>Öneri ve haftalık plan:</b> kendi işaretlerinden (kırmızı/sarı/yeşil, tekrarlar, netler) hesaplanan kural tabanlı bir motordur; ünite öncelikleri ön şart zincirine göre belirlenir. Veri kaynağı yalnızca senin çalışman + resmî kazanım listesidir.</p>
    <p class="citenote"><b>Sıralama:</b> kaynaklı gerçek ÖSYM verisi eklenene kadar tahminî sıralama GÖSTERİLMEZ - uydurma kesinlik satmıyoruz.</p>`;
  d.appendChild(k2);

  d.appendChild(el('div', 'seclabel', 'kitaplar'));
  const kb = el('div', 'kaynakca wide');
  kb.innerHTML = `
    <p class="citenote">Tek meşru kitap kaynağı: <b>OGM Materyal / EBA</b> (T.C. MEB'in resmî ortaöğretim ders kitapları, ogmmateryal.eba.gov.tr). 2026/2027 YKS eski 2018 programına dayandığı için o programın kitapları kullanılır. Özel yayınevi kaynağı ya da çıkmış ÖSYM sorusu asla barındırılmaz.</p>
    <p class="cite">Millî Eğitim Bakanlığı. <i>Biyoloji, Fizik, Kimya, Matematik, Coğrafya, Tarih ve Felsefe ders kitapları</i> (9-12. sınıf, eski 2018 programı). T.C. MEB / OGM Materyal, ogmmateryal.eba.gov.tr. <span class="badge ok">23 kitap · ~4.700 sayfa çekildi · kazanımlara bağlandı</span></p>
    <p class="citenote">Anahtar terimler bu kitaplardan otomatik ve kural tabanlı çıkarılır (resmî tanım cümleleri; yapay zekâ yok). Her terimin altında geldiği kitap, sınıf, ünite ve sayfa yazar. Türk Dili ve Edebiyatı, Din Kültürü ve İnkılap Tarihi kitapları henüz eklenmedi.</p>
    <p class="citenote">Her kitap işlendikçe MLA künyesi ve hangi kazanımda hangi pasajın kullanıldığı buraya tek tek eklenecek. Künyesi burada olmayan hiçbir içerik üründe yer almaz.</p>`;
  d.appendChild(kb);

  d.appendChild(el('div', 'seclabel', 'yolda · henüz uygulamada değil'));
  const k3 = el('div', 'kaynakca wide');
  k3.innerHTML = `
    <p class="citenote"><b>MEB ders kitapları:</b> soru üretimi için kazanım başına resmî ders kitabı pasajları eklenecek; her pasaj kaynağıyla yukarıdaki KİTAPLAR bölümüne girecek.</p>
    <p class="citenote"><b>Çıkmış sorular:</b> telif hakları nedeniyle uygulamada asla barındırılmaz; yalnızca soru kalitesini ayarlamak için stil referansı olarak kullanılacak ve bu da burada açıkça yazacak.</p>`;
  d.appendChild(k3);

  d.appendChild(el('div', 'seclabel', 'uygulamanın kendisi'));
  const k4 = el('div', 'kaynakca wide');
  k4.innerHTML = `
    <p class="citenote"><b>Yazılım:</b> meyvetabagi, nosey-dewdrop tarafından geliştirilir. Hesap ve eşitleme altyapısı: Supabase (Frankfurt/AB veri merkezi). Yazı tipi: Arial (sistem yazı tipi). Analitik, reklam ve izleme aracı kullanılmaz - ayrıntı için <a href="gizlilik.html">gizlilik sayfası</a>.</p>`;
  d.appendChild(k4);
}
