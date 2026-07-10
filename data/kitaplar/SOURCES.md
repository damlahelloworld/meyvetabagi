# meyvetabagi — ders kitabı corpus kaynakları

Tek meşru kaynak: **OGM Materyal / EBA** (ogmmateryal.eba.gov.tr) — MEB'in resmî ortaöğretim
ders kitapları, ders × sınıf × ünite. 2026/2027 YKS = ESKİ 2018 programı; 2028'de Maarif Modeli'ne
geçilince yeni kitaplar yeniden çekilecek.

## Kural
- Sadece resmî MEB/EBA kitapları. Özel yayınevi soru bankası / çıkmış ÖSYM sorusu ASLA barındırılmaz.
- Her pasaj kazanım uid'sine bağlanır ve kaynağı (kitap, ünite, sayfa) `corpus(uid, source, text)` içinde saklanır.
- Barındırma değil, işleme: kitaplardan kazanım-başı özet/pasaj çıkarılır; ham kitap dosyası repoya konmaz (boyut + haklar).

## Toplama durumu (ders · sınıf · ünite)
Biçim: ders | sınıf | kaynak | durum
- Biyoloji | 11 | OGM Materyal (Ünite 1-2) | ÇEKİLDİ (130 sayfa ~36k kelime) → biyoloji_11.json
- Biyoloji | 12 | OGM Materyal (Ünite 1-4) | ÇEKİLDİ (197 sayfa ~38k kelime) → biyoloji_12.json
- corpus.json: 60 biyoloji kazanımı kitap pasajlarına bağlandı (kural tabanlı örtüşme; scripts/build_corpus.py)
- (diğer ders/sınıflar sırayla eklenecek)

## MLA künye şablonu
Millî Eğitim Bakanlığı. *<Ders> <Sınıf>. Sınıf Ders Kitabı.* T.C. MEB / OGM Materyal, <yıl>, ogmmateryal.eba.gov.tr.
