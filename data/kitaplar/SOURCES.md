# meyvetabagi — ders kitabı corpus kaynakları

Tek meşru kaynak: **OGM Materyal / EBA** (ogmmateryal.eba.gov.tr) — MEB'in resmî ortaöğretim
ders kitapları, ders × sınıf × ünite. 2026/2027 YKS = ESKİ 2018 programı; 2028'de Maarif Modeli'ne
geçilince yeni kitaplar yeniden çekilecek.

## Kural
- Sadece resmî MEB/EBA kitapları. Özel yayınevi soru bankası / çıkmış ÖSYM sorusu ASLA barındırılmaz.
- Her pasaj kazanım uid'sine bağlanır ve kaynağı (kitap, ünite, sayfa) `corpus(uid, source, text)` içinde saklanır.
- Barındırma değil, işleme: kitaplardan kazanım-başı özet/pasaj çıkarılır; ham kitap dosyası repoya konmaz (boyut + haklar).

## Toplama durumu (10 Tem 2026 — 23 kitap çekildi)
Biyoloji 9-12, Fizik 9-12, Kimya 9-12, Matematik 10-12, Coğrafya 10-12, Tarih 9-11, Felsefe 10-11.
Toplam ~4.700 sayfa, ~1,4M kelime. corpus.json: 707 kazanım pasaja bağlı. terimler.json: 503 kazanımda 448 benzersiz terim.
Eksik: Türk Dili ve Edebiyatı, Din Kültürü, İnkılap Tarihi (OGM slug'ları farklı, sonra eklenecek).
Not: terim çıkarımı "TERİM: açıklama" kalıbına dayanır — fen dersleri zengin, sözel dersler (tarih/felsefe/coğrafya) daha az terim verir; sözel için ek kalıp gerekecek.