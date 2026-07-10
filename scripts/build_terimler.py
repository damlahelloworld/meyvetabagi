#!/usr/bin/env python3
# meyvetabagi — MEB kitabından ANAHTAR TERİM + TANIM çıkar (uydurma yok, hepsi kitap metninden).
# Kalıplar: "<TERİM>: açıklama" ve "... <TERİM> denir/adı verilir".
# Terimler ÜNİTE bazında kazanımlara bağlanır (ünite = konu kapsamı).
# ÇIKTI: web/data/terimler.json  { uid: [ {terim, tanim, source} ] }
import json, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
KDIR = os.path.join(ROOT, 'data', 'kitaplar')
KAZ = os.path.join(ROOT, 'web', 'data', 'kazanimlar.json')
OUT = os.path.join(ROOT, 'web', 'data', 'terimler.json')

DERS_NAMES = {'biyoloji': 'Biyoloji'}
SLUG3 = {'biyoloji': 'biy'}

def clean(t):
    return re.sub(r'\s+', ' ', t).strip(' .;:,→')

# başlık gürültüsü: iki+ ardışık BÜYÜK-HARF kelime, ya da tek harf/rakam kalıntısı
def is_header_noise(term):
    if re.search(r'\b[A-ZÇĞİÖŞÜ]{3,}\s+[A-ZÇĞİÖŞÜ]{3,}', term):
        return True
    if len(term) < 3 or len(term) > 40:
        return True
    if not re.search(r'[a-zçğıöşü]', term):  # tümü büyük harf = başlık
        return True
    if any(w in term.lower() for w in ('görsel', 'tablo', 'grafik', 'sayfa', 'ünite', 'fizyolojisi', 'ekolojisi', 'bilgi')):
        return True
    return False

# "<TERİM>: Açıklama cümlesi."  → en temiz kalıp (Astigmatizm:, Tiroksin:, Adrenalin (Epinefrin):)
COLON = re.compile(r'(?:^|[.!?]\s|\s)([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-Za-zÇĞİÖŞÜçğıöşü]+){0,2}(?:\s*\([^)]{1,22}\))?)\s*:\s+([A-ZÇĞİÖŞÜ][^:]{25,240}?[.!?])')
# "... <son cümle parçası> <TERİM> denir"  → terim son 1-3 küçük harf başlayan kelime
DENIR = re.compile(r'([a-zçğıöşü][^.!?;:]{15,170}?)\b([a-zçğıöşü]+(?:\s+[a-zçğıöşü]+){0,2})\s+(?:denir|denilir|adı verilir|adını alır)\b')

def extract(text):
    # Sadece "<TERİM>: Açıklama." kalıbı — flip-book metninde kelimeler bölündüğü için
    # "denir" kalıbı kırık terim üretiyor; kaliteyi korumak için yalnız iki nokta kalıbı.
    out = []
    for m in COLON.finditer(text):
        term, tanim = clean(m.group(1)), clean(m.group(2))
        if is_header_noise(term):
            continue
        # tanımda kırık/başlık kalıntısı çok fazlaysa ele (büyük harf blokları)
        if re.search(r'\b[A-ZÇĞİÖŞÜ]{4,}\b', tanim.replace(term.upper(), '')):
            continue
        out.append((term, tanim))
    return out

def main():
    # ders/sınıf/ünite -> [ {terim,tanim,source} ]
    unit_terms = {}
    for fn in sorted(os.listdir(KDIR)):
        m = re.match(r'([a-z]+)_(\d+)\.json$', fn)
        if not m:
            continue
        slug, grade = m.group(1), int(m.group(2))
        dname = DERS_NAMES.get(slug, slug.title())
        b = json.load(open(os.path.join(KDIR, fn), encoding='utf-8'))
        for u in b['uniteler']:
            key = (slug, grade, u['unite'])
            seen, terms = set(), []
            for pg in u['pages']:
                for term, tanim in extract(pg['text']):
                    tl = term.lower()
                    if tl in seen:
                        continue
                    seen.add(tl)
                    terms.append({'terim': term, 'tanim': tanim,
                                  'source': f'{dname} {grade}. Sınıf · Ünite {u["unite"]} · s.{pg["p"]}'})
            unit_terms[key] = terms

    db = json.load(open(KAZ, encoding='utf-8'))
    result = {}
    for ders in db['dersler']:
        slug = {'Biyoloji': 'biyoloji'}.get(ders['ders'])
        if not slug:
            continue
        s3 = SLUG3[slug]
        for u in ders['units']:
            g = u.get('grade')
            # kazanımın kitaptaki ünite numarasını koddan al: "11.1.1.1" -> ünite 1
            for k in u['konular']:
                for z in k['kazanimlar']:
                    parts = z['code'].split('.')
                    unite = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
                    terms = unit_terms.get((slug, g, unite), [])
                    if terms:
                        result[f'{s3}:{z["code"]}'] = terms[:60]
    json.dump(result, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    tot = sum(len(v) for v in result.values())
    uniq = len({t['terim'].lower() for v in result.values() for t in v})
    print(f'→ {OUT}: {len(result)} kazanıma bağlandı, {uniq} benzersiz terim (ünite bazında)')

if __name__ == '__main__':
    main()
