#!/usr/bin/env python3
"""Parse the official MEB 2026 YKS PDF text into a multi-subject kazanim DB.
Handles variable code depth (3-level: Din/Tarih/Coğrafya · 4-level: Mat/Fiz/Kim/Biyo).
Output: web/data/kazanimlar.json  ->  { dersler: [ {ders, units:[{grade,code,name,konular:[{code,name,kazanimlar}]}]} ] }
"""
import json, re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data/kazanimlar/full.txt")
OUT = os.path.join(ROOT, "web/data/kazanimlar.json")

# (name, start_line, end_line) — numeric-coded core subjects
SECTIONS = [
    ("Din Kültürü ve Ahlak Bilgisi", 1497, 2453),
    ("Tarih", 2454, 3284),
    ("T.C. İnkılap Tarihi", 3285, 3539),
    ("Coğrafya", 3540, 3952),
    ("Matematik", 3953, 4903),
    ("Fizik", 5037, 6732),
    ("Kimya", 6733, 7619),
    ("Biyoloji", 7620, 8299),
    ("Felsefe", 8300, 8688),
]

CODE = re.compile(r"^\s*(\d{1,2}(?:\.\d{1,2}){1,3})\.?\s+(\S.*)$")
PAGE = re.compile(r"^\s*\d{1,3}\s*$")
clean = lambda s: re.sub(r"\s+", " ", s).strip()

with open(SRC, encoding="utf-8") as f:
    LINES = f.readlines()

def parse_section(start, end):
    lines = LINES[start-1:end]
    # pass 1: max code depth among substantial code lines
    maxdepth = 0
    for ln in lines:
        m = CODE.match(ln)
        if m and len(m.group(2)) > 12:
            maxdepth = max(maxdepth, len(m.group(1).split(".")))
    if maxdepth < 3:
        maxdepth = 3
    units = {}
    cur_kaz = None
    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip() or PAGE.match(line):
            continue
        if "SINIF" in line and ("ÜNİTE" in line or "KAZANIM" in line or "ÖĞRENME" in line):
            cur_kaz = None
            continue
        m = CODE.match(line)
        if m:
            segs = m.group(1).split(".")
            depth = len(segs)
            text = clean(m.group(2))
            a = int(segs[0])
            uc = ".".join(segs[:2])
            if depth == maxdepth:                       # kazanım
                u = units.setdefault(uc, {"code": uc, "grade": a, "name": "", "konular": {}})
                kc = ".".join(segs[:3]) if maxdepth == 4 else uc
                k = u["konular"].setdefault(kc, {"code": kc, "name": "", "kazanimlar": []})
                cur_kaz = {"code": m.group(1), "grade": a, "title": text, "aciklama": []}
                k["kazanimlar"].append(cur_kaz)
            elif depth == 2:                            # unit name
                units.setdefault(uc, {"code": uc, "grade": a, "name": "", "konular": {}})["name"] = text
                cur_kaz = None
            elif depth == 3 and maxdepth == 4:          # konu name
                u = units.setdefault(uc, {"code": uc, "grade": a, "name": "", "konular": {}})
                u["konular"].setdefault(".".join(segs[:3]), {"code": ".".join(segs[:3]), "name": "", "kazanimlar": []})["name"] = text
                cur_kaz = None
            else:
                cur_kaz = None
            continue
        # continuation / açıklama
        if cur_kaz is not None:
            if not cur_kaz["title"].rstrip().endswith((".", "?", ":", ")")):
                cur_kaz["title"] = clean(cur_kaz["title"] + " " + line)
            else:
                cur_kaz["aciklama"].append(clean(line))
    # finalize
    out = []
    for uc, u in units.items():
        kon = []
        for kc, k in u["konular"].items():
            if not k["kazanimlar"]:
                continue
            for z in k["kazanimlar"]:
                z["aciklama"] = " ".join(z["aciklama"]).strip()
            kon.append({"code": k["code"], "name": k["name"] or u["name"], "kazanimlar": k["kazanimlar"]})
        if kon:
            out.append({"code": u["code"], "grade": u["grade"],
                        "name": u["name"] or f"{u['grade']}. sınıf · ünite {uc}", "konular": kon})
    out.sort(key=lambda u: [int(x) for x in u["code"].split(".")])
    return out

LETTER = re.compile(r"^\s*([A-ZÇĞİÖŞÜ])\.\s*(\d+)\.\s*(\d+)\.?\s+(\S.*)$")   # A.1. 2. text
ALAN = re.compile(r"^\s*([A-ZÇĞİÖŞÜ])\)\s+([A-ZÇĞİÖŞÜ].+)$")                  # A) OKUMA
def parse_edebiyat(start, end):
    lines = LINES[start-1:end]
    alan_names = {}
    units = {}
    cur = None
    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip() or PAGE.match(line):
            continue
        a = ALAN.match(line)
        if a:
            alan_names[a.group(1)] = clean(a.group(2)); cur = None; continue
        m = LETTER.match(line)
        if m:
            al, b, c, text = m.groups()
            uc = al
            u = units.setdefault(uc, {"code": uc, "grade": 0, "name": alan_names.get(al, al), "konular": {}})
            kc = f"{al}.{b}"
            k = u["konular"].setdefault(kc, {"code": kc, "name": u["name"], "kazanimlar": []})
            cur = {"code": f"{al}.{b}.{c}", "grade": 0, "title": clean(text), "aciklama": []}
            k["kazanimlar"].append(cur)
            continue
        if cur is not None:
            if not cur["title"].rstrip().endswith((".", "?", ":", ")")):
                cur["title"] = clean(cur["title"] + " " + line)
            else:
                cur["aciklama"].append(clean(line))
    out = []
    for uc, u in units.items():
        u["name"] = alan_names.get(uc, u["name"])
        kon = []
        for kc, k in u["konular"].items():
            if not k["kazanimlar"]:
                continue
            for z in k["kazanimlar"]:
                z["aciklama"] = " ".join(z["aciklama"]).strip()
            kon.append({"code": k["code"], "name": u["name"], "kazanimlar": k["kazanimlar"]})
        if kon:
            out.append({"code": u["code"], "grade": 0, "name": u["name"], "konular": kon})
    return out

dersler = []
edeb = parse_edebiyat(35, 557)
en = sum(len(k["kazanimlar"]) for u in edeb for k in u["konular"])
if edeb:
    dersler.append({"ders": "Türk Dili ve Edebiyatı", "units": edeb})
print(f"{'Türk Dili ve Edebiyatı':32} units={len(edeb):3} kazanım={en}")
for name, s, e in SECTIONS:
    units = parse_section(s, e)
    n = sum(len(k["kazanimlar"]) for u in units for k in u["konular"])
    if units:
        dersler.append({"ders": name, "units": units})
    print(f"{name:32} units={len(units):3} kazanım={n}")

db = {"source": "TTKB 2026 YKS - resmi konu ve kazanımlar", "dersler": dersler}
total = sum(len(k["kazanimlar"]) for d in dersler for u in d["units"] for k in u["konular"])
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)
print(f"\nTOPLAM {total} kazanım · {len(dersler)} ders -> {OUT}")
