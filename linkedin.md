# meyvetabagi — linkedin (build-in-public essay stogu)

300-500+ kelime, numarali DAMLA-ESSAY zinciri. her essay bir karar: ne yaptim, neden,
sonra ne oldu. dürüst — bu proje su an DURDURULDU, ve "neden durdurdum" da bir hikaye.
yazi Damla'nin sesi, lowercase, AI gibi durmasin.

---

## DAMLA-ESSAY 1 — pazarin bos koltugu

YKS piyasasina bakmadan tek satir kod yazmadim. iki uc vardi: bir tarafta ucuz ama cirkin
konu-takip araclari (Pandorina, Konu Takip, ~12 TL), diger tarafta kurumsal koclik
(Kopilot ~3.800 TL/ay, Tonguc 8-13k). ortasi — ~200-300 TL bandi — bombostu. rakiplerin
hicbiri de resmi MEB kazanim listesini calisma yuzeyi olarak acmiyordu. moat orada
duruyordu: kazanim granulligu. ilk kararim su oldu — bir "koc uygulamasi" degil, bir
"kazanim omurgasi" kuracaktim, ustune her sey onun uzerine otursun.

o yuzden once veriyi cozdum. resmi 2026 YKS kazanim PDF'ini indirdim, ders -> unite ->
konu -> kazanim seklinde ayristirdim. 9 ders, 955 kazanim, hepsi gercek, hepsi kaynakli.
uydurma tek satir yok. bir urunu once en zor ve en az sexy parcasindan kurdum: veri.
cunku bir sey satacaksam once dogru olmali.

## DAMLA-ESSAY 2 — cilek ve "koc" kelimesini yasaklamak

tuhaf bir karar aldim: urun metninde "koc" kelimesini tamamen yasakladim. sebebi su —
piyasadaki her sey "koc" diyor ve o kelime artik guven degil, satis kokuyor. bunun yerine
oneriyi ve degerlendirmeyi yapan AI'ye bir isim verdim: cilek. meyve tabagindaki ilk
meyve. ileride elma da gelecek. tek bir marka altinda, whimsy bir dunya.

daha da radikal bir sey yaptim: koclugu tamamen kaldirdim. mentor yok, davet kodu yok,
insan koc yok. "AI ve motorumuz cok guclu olacak, o yeter de artar" dedim. urundeki tek
insan bendim. bu bir bahis: sistem yeterince iyiyse aracya insan koc gerekmez.

## DAMLA-ESSAY 3 — 40 commitlik tasarim savasi

tek gunde bu urunun tasarimini yirmi kez yeniden yazdim. mat palet, canli palet, mono
font, arial, bordersiz, hairline, "fate of ophelia" mucevher tonlu showgirl temasi... ve
sonra hepsini geri aldim. cunku moru actim ve mor benim en sert AI-tell yasagim. commit
mesajlarim resmen "kill the purple" diyor. beyaz zemine, canli meyve paletine, birkac
altin simle dondum.

buradan cikardigim ders aci ama gercek: kor iterasyon bir tuzak. somut referans olmadan
2-3 turdan fazla tasarim denemek token ve enerji yakiyor. iyi bir urun degil, sadece
yorgun bir gelistirici uretiyor. tasarim bende degildi, benim tahminimdeydi — ve o fark
her seyi bozuyor.

## DAMLA-ESSAY 4 — kendime cektigim reality check

en zor essay bu. urunu bitirdim sandim, sonra oturup dedigim gibi degil oldugu gibi
okudum. verdict tek cumleyle: bu bir tek-kisilik localStorage demosu. sosyal olan her sey,
"koclik" olan her sey, "hesap" olan her sey tiyatroydu. uyelik? isim+email localStorage'a
gidiyordu, "zaten hesabim var" bir prompt() kutusuydu. koc chat? tek yonlu, kimse gormuyor.
siralama capalari? kaynaksiz — 120 net ~ 3.000. siralama (gercek: tam TYT net top ~10-100).

o gun 14 mantik bug'i ve bir stored-XSS acigini duzelttim. deneme tarihi hardcode'du,
AYT secilemiyordu, koc plani gecmis gunlere gorev koyuyordu. hepsini duzelttim. ama asil
mesele bunlar degildi. asil mesele suydu: urun ile gercek arasindaki duvar TEK bir seydi —
backend + gercek hesaplar. o dusmedikce roadmap'teki hicbir sey onemli degildi.

## DAMLA-ESSAY 5 — neden durdurdum

ve durdurdum. dürüst olmam gereken essay bu. meyvetabagi'yi ayri bir Supabase projesine
baglayacaktim — ama o proje hic yoktu, aslinda db'si hic olmamis. canli sayfa olu bir
backend'e bakan guzel bir kabuktu. iki secenegim vardi: aylarca tek basima gercek bir
backend + auth + KVKK + odeme + gercek OSYM siralama tablosu insa etmek, ya da durup
"bu simdi benim tasiyabilecegim yuk mu" diye sormak.

durdum. cunku para hedefim kalmamisti ve tek kisiyken bes ayri "gercek sistem" projesini
ayni anda tasiyamam. karar su oldu: meyvetabagi olmedi, ertelendi. plani da net —
tek bir cati veritabanina kendi semasi olarak kurulacak (migration'lar repoda), sonra tek
bir config satiri + redirect. yani duvar hala orada, ama artik onu nasil yikacagimi
biliyorum. bir urunu durdurmak basarisizlik degil; hangi urunu ne zaman tasiyacagina
karar vermek kuruculuk. bu benim en dürüst commit'im: "durduruldu", ve nedeni yaziyor.
