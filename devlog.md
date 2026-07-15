# meyvetabagi — devlog (instagram build-in-public)

gelistirme surecini paylasiyoruz. her giris bir icerik: 30-60 sn'lik, **hook'u olan**
bir reels (ya da carousel/post). sinir yok. lowercase, durust, "bakisini ikinci saniyede
yakala" enerjisi. bu proje su an DURDURULDU — o yuzden tech diary + "neden durdurdum"
da icerik.

format:
- **hook:** ilk cumle. kaydirmayi durduran sey.
- **govde:** ne yaptim + neden. 30-60 sn konusma. (Damla sesi, TR)
- **on-video (EN):** ekrana basacagin kisa ingilizce metin.
- **gorsel:** ekranda ne gostereceğin.
- **format:** reel / carousel / post.

---

## reel 1 — once veri, sonra her sey
**hook:** bir YKS uygulamasina tasarimdan degil, resmi bir PDF'ten basladim.
**govde:** herkes parlak ekran cizerken ben MEB'in resmi 2026 kazanim listesini indirdim ve ders -> unite -> konu -> kazanim diye ayristirdim. 9 ders, 955 kazanim, hepsi gercek. cunku bir urun satacaksam once dogru olmali. en sexy parca degil ama moat bu: rakiplerden hicbiri resmi kazanim listesini calisma yuzeyi olarak acmiyor.
**on-video (EN):** 955 real MEB learning objectives. parsed, not invented.
**gorsel:** PDF -> python parse ciktisi -> yapisal JSON agaci.
**format:** reel

## reel 2 — bos koltugu bulmak
**hook:** YKS piyasasinda bir bosluk var ve kimse oturmuyor.
**govde:** iki uc: ucuz-cirkin konu takip araclari (~12 TL) ve kurumsal koclik (~3.800 TL/ay). ortasi bombos. ben o ~200-300 TL bandini hedefledim. bir de whimsy tasarimli tek bir YKS app'i yok — tur olarak fark bu.
**on-video (EN):** the middle price band was empty. that was the seat.
**gorsel:** iki uc + ortada bos koltuk grafigi.
**format:** carousel

## reel 3 — "koc" kelimesini yasakladim
**hook:** urunumde "koc" kelimesini kullanmayi yasakladim.
**govde:** piyasada her sey "koc" diyor ve o kelime artik guven degil satis kokuyor. onun yerine oneri yapan AI'ye isim verdim: cilek. meyve tabagindaki ilk meyve. sonra insan kocligu bile tamamen kaldirdim — sistem yeterince iyiyse aracya koc gerekmez, bahsim buydu.
**on-video (EN):** i banned the word "coach". the AI is a strawberry instead.
**gorsel:** UI'da "cilek oneriyor" etiketi.
**format:** reel

## reel 4 — bir gunde 40 commit, moru olduren adam
**hook:** bir gunde tasarimi 20 kez yeniden yazdim, sonra hepsini geri aldim.
**govde:** mat palet, mono font, "showgirl" mucevher temasi, sonra... moru actim. mor benim en sert AI-tell yasagim. commit'lerim resmen "kill the purple" diyor. beyaz zemine + canli meyve paletine dondum. ders: kor iterasyon tuzak, somut referans olmadan 2-3 turdan fazla deneme sadece yorgun gelistirici uretir.
**on-video (EN):** 40 commits in one day. lesson: stop blind-iterating.
**gorsel:** git log akisi, "kill the purple" commit'i yakin cekim, once/sonra palet.
**format:** carousel

## reel 5 — kendime cektigim reality check
**hook:** urunumu bitirdim sandim, sonra oturup dogruyu okudum: bu bir tiyatro.
**govde:** sosyal olan her sey, hesap olan her sey sahteydi. uyelik localStorage'a yaziyordu, "zaten hesabim var" bir prompt() kutusuydu, koc chat tek yonluydu kimse gormuyordu. tarayiciyi temizle = her sey gitti. bir demo ile gercek urun arasindaki duvar tek seydi: backend + gercek hesap.
**on-video (EN):** i shipped a demo and called it a product. honest audit day.
**gorsel:** "hesabim var" prompt() kutusu ekran kaydi + localStorage panel.
**format:** reel

## reel 6 — bir gunde 14 bug + bir XSS
**hook:** tek bir denetim gununde 14 mantik hatasi ve bir guvenlik acigi buldum.
**govde:** deneme tarihi hardcode'du, AYT secilemiyordu, koc plani gecmis gunlere gorev koyuyordu, siralama capalari kaynaksizdi. arama kutusunda esc() tirnak kacirmiyordu — yani stored-XSS'e acik. hepsini duzelttim. tech diary: bir feature'i "calisiyor" saymadan once kotu kullaniciyi da dusunmelisin.
**on-video (EN):** 14 logic bugs + one stored-XSS, found by auditing my own code.
**gorsel:** duzeltilen bug listesi kayarken tek tek isaretleniyor.
**format:** reel

## reel 7 — kaynaksiz sayilar yalandir
**hook:** uygulamam "120 net ~ 3.000. siralama" diyordu. bu tamamen uydurmaydi.
**govde:** siralama capalarinin hicbir kaynagi yoktu. gercekte tam TYT net top ~10-100'e denk gelir. guven bu urunun tum konumlanmasiydi, o yuzden uydurma sayiyi kodda "KAYNAK YOK" diye isaretledim ve AYT'de siralamayi hic gostermemeye gecirdim. gercek OSYM net->siralama tablosu bir lansman blokoru — yalan sayiyla cikmaktansa hic cikma.
**on-video (EN):** unsourced numbers are lies. i marked mine "NO SOURCE".
**gorsel:** kodda RANK_ANCHORS + "KAYNAK YOK" yorumu.
**format:** reel

## reel 8 — neden durdurdum
**hook:** bir urunu durdurmak basarisizlik degil — hangisini ne zaman tasiyacagina karar vermek.
**govde:** meyvetabagi'yi ayri bir Supabase'e baglayacaktim ama o proje hic yoktu, canli sayfa olu backend'e bakan guzel bir kabuktu. tek kisiyken bes ayri "gercek sistem"i ayni anda tasiyamam. durdum. plan net: tek cati veritabanina kendi semasi olarak kurulacak, migration'lar repoda, sonra tek config satiri. duvar hala orada ama artik nasil yikacagimi biliyorum. en durust commit'im: "durduruldu", nedeni de yaziyor.
**on-video (EN):** i paused it. and wrote down exactly why. that's founding too.
**gorsel:** "durduruldu" commit'i + repoda duran migration klasoru.
**format:** carousel
