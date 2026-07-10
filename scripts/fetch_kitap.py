#!/usr/bin/env python3
# meyvetabagi — resmî OGM Materyal / EBA ders kitaplarından kazanım corpus'u için ham metin çekimi.
# Kaynak: ogmmateryal.eba.gov.tr etkileşimli kitap → basic-html metin fallback'i (sayfa sayfa).
# ÇIKTI: data/kitaplar/<ders>_<sinif>.json  { ders, sinif, uniteler:[{ unite, pages:[{p, text}] }] }
# Ham kitap dosyası repoya konmaz — yalnızca temizlenmiş metin. Hiçbir soru/çeldirici üretilmez (o Edge'de).
import json, os, re, html, sys, time, urllib.request

BASE = 'https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'kitaplar')

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode('utf-8', 'ignore')

def page_text(book, grade, unite, p):
    url = f'{BASE}/{book}/{grade}/unite{unite}/files/basic-html/page{p}.html'
    try:
        s = get(url)
    except Exception:
        return None
    t = re.sub(r'<script.*?</script>', ' ', s, flags=re.S)
    t = re.sub(r'<style.*?</style>', ' ', t, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t)
    t = re.sub(r'\s+', ' ', t).strip()
    # strip the flip-book chrome that wraps every page
    t = re.sub(r'^﻿?\s*Page \d+ - .*?Basic HTML Version Table of Contents View Full Version ', '', t)
    t = re.sub(r'Page \d+ - [^.]*? P\. \d+ ', '', t)
    return t

def fetch_unit(book, grade, unite, max_pages=260):
    pages, miss = [], 0
    for p in range(1, max_pages + 1):
        t = page_text(book, grade, unite, p)
        if t is None:
            miss += 1
            if miss >= 3:  # 3 ardışık 404 = ünite bitti
                break
            continue
        miss = 0
        if len(t) > 40:  # boş/kapak sayfalarını atla
            pages.append({'p': p, 'text': t})
        time.sleep(0.05)
    return pages

def fetch_book(book, grade, units):
    uniteler = []
    for u in units:
        pages = fetch_unit(book, grade, u)
        print(f'  {book} {grade} ünite{u}: {len(pages)} sayfa metin')
        uniteler.append({'unite': u, 'pages': pages})
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f'{book}_{grade}.json')
    total = sum(len(u['pages']) for u in uniteler)
    words = sum(len(p['text'].split()) for u in uniteler for p in u['pages'])
    json.dump({'ders': book, 'sinif': grade, 'kaynak': 'OGM Materyal / EBA', 'uniteler': uniteler},
              open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'→ {path}  ({total} sayfa, ~{words} kelime)')

JOBS = {  # book: {grade: [units]}
    'biyoloji': {11: [1, 2], 12: [1, 2, 3, 4]},
}

if __name__ == '__main__':
    for book, grades in JOBS.items():
        for g, units in grades.items():
            fetch_book(book, g, units)
