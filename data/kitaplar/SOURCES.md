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
- Biyoloji | 12 | OGM Materyal etkileşimli kitap (Genden Proteine · Enerji Dönüşümleri · Bitki Biyolojisi · Canlılar ve Çevre) | KAYNAK BULUNDU, çekim bekliyor
- (diğer ders/sınıflar sırayla eklenecek)

## MLA künye şablonu
Millî Eğitim Bakanlığı. *<Ders> <Sınıf>. Sınıf Ders Kitabı.* T.C. MEB / OGM Materyal, <yıl>, ogmmateryal.eba.gov.tr.
