#!/usr/bin/env python3
# inkbee — kitap metnini KAZANIMLARA bağla: her kazanım için en ilgili kitap pasajlarını seç.
# Yöntem: kazanım başlığı+açıklamasının içerik kelimeleri ile sayfa metni arasında örtüşme skoru
# (kural tabanlı, AI yok). Soru üretimi buradan beslenir (o adım Edge/LLM — burada üretilmez).
# ÇIKTI: data/kitaplar/corpus.json  [{ uid, ders, kazanim, passages:[{source, page, text, score}] }]
import json, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
KAZ = os.path.join(ROOT, 'web', 'data', 'kazanimlar.json')
KDIR = os.path.join(ROOT, 'data', 'kitaplar')

DERS_SLUG = {'Biyoloji':'biyoloji','Fizik':'fizik','Kimya':'kimya','Matematik':'matematik','Tarih':'tarih','Coğrafya':'cografya','Felsefe':'felsefe'}
STOP = set('ve veya ile için gibi göre kadar sonra önce bu şu bir iki her tüm bazı diğer aynı olan olarak olduğu açıklar analiz eder değerlendirir belirtilir sağlanır ilişkin ilgili genel özel yer alan üzerinde durulur örneklerle kavramını açıklar'.split())

def words(t):
    return [w for w in re.findall(r'[a-zçğıöşüA-ZÇĞİÖŞÜ]{4,}', (t or '').lower()) if w not in STOP]

def load_pages(slug, grade):
    p = os.path.join(KDIR, f'{slug}_{grade}.json')
    if not os.path.exists(p):
        return []
    b = json.load(open(p, encoding='utf-8'))
    out = []
    for u in b['uniteler']:
        for pg in u['pages']:
            out.append({'unite': u['unite'], 'page': pg['p'], 'text': pg['text'], 'terms': set(words(pg['text']))})
    return out

def main():
    db = json.load(open(KAZ, encoding='utf-8'))
    corpus = []
    for ders in db['dersler']:
        slug = DERS_SLUG.get(ders['ders'])
        if not slug:
            continue
        # gather pages per grade present
        pages_by_grade = {}
        for u in ders['units']:
            g = u.get('grade')
            if g and g not in pages_by_grade:
                pages_by_grade[g] = load_pages(slug, g)
        for u in ders['units']:
            g = u.get('grade')
            pages = pages_by_grade.get(g, [])
            if not pages:
                continue
            for k in u['konular']:
                for z in k['kazanimlar']:
                    kterms = set(words(z.get('title', '') + ' ' + z.get('aciklama', '')))
                    if not kterms:
                        continue
                    scored = []
                    for pg in pages:
                        ov = len(kterms & pg['terms'])
                        if ov >= 2:
                            scored.append((ov, pg))
                    scored.sort(key=lambda x: -x[0])
                    passages = [{'source': f'{ders["ders"]} {g}. Sınıf · Ünite {pg["unite"]} · s.{pg["page"]}',
                                 'page': pg['page'], 'score': ov, 'text': pg['text'][:900]}
                                for ov, pg in scored[:3]]
                    if passages:
                        corpus.append({'uid': f'{slug[:3]}:{z["code"]}', 'ders': ders['ders'],
                                       'kazanim': z['title'], 'passages': passages})
    out = os.path.join(KDIR, 'corpus.json')
    json.dump(corpus, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    linked = len(corpus)
    withp = sum(1 for c in corpus if c['passages'])
    print(f'→ {out}: {linked} kazanım kitap pasajına bağlandı ({withp} tanesinde ≥1 pasaj)')

if __name__ == '__main__':
    main()
