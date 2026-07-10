#!/usr/bin/env python3
"""Parse the official MEB 2026 YKS PDF text into a structured kazanim DB.
Template subject: Matematik (regular level, grades 9-12).
Output: data/kazanimlar/matematik.json
"""
import json, re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data/kazanimlar/full.txt")
OUT = os.path.join(ROOT, "data/kazanimlar/matematik.json")

# Matematik (regular) region in the layout text.
START, END = 3953, 4903

CODE = re.compile(r"^\s*(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.?\s+(.*)$")   # kazanim  a.b.c.d
KONU = re.compile(r"^\s*(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.?\s+(.+)$")               # konu     a.b.c
UNIT = re.compile(r"^\s*(\d{1,2})\.(\d{1,2})\.?\s+(.+)$")                          # unite    a.b
PAGE = re.compile(r"^\s*\d{1,3}\s*$")                                              # bare page number

with open(SRC, encoding="utf-8") as f:
    lines = f.readlines()[START-1:END]

units = {}          # "9.1" -> {code,name,konular:{}}
cur_unit = cur_konu = cur_kaz = None

def clean(s):
    return re.sub(r"\s+", " ", s).strip()

for raw in lines:
    line = raw.rstrip("\n")
    if not line.strip() or PAGE.match(line):
        continue
    if "SINIF" in line and "ÖĞRENME" in line:      # grade header
        continue

    m = CODE.match(line)
    if m:
        a, b, c, d, text = m.groups()
        uc, kc = f"{a}.{b}", f"{a}.{b}.{c}"
        code = f"{a}.{b}.{c}.{d}"
        konu = units.get(uc, {}).get("konular", {}).get(kc)
        if konu is None:                              # safety: skip orphans
            cur_kaz = None
            continue
        cur_kaz = {"code": code, "grade": int(a), "title": clean(text), "aciklama": []}
        konu["kazanimlar"].append(cur_kaz)
        continue

    m = KONU.match(line)
    if m:
        a, b, c, name = m.groups()
        uc, kc = f"{a}.{b}", f"{a}.{b}.{c}"
        u = units.get(uc)
        if u is None:
            cur_kaz = None
            continue
        u["konular"].setdefault(kc, {"code": kc, "name": clean(name), "kazanimlar": []})
        cur_konu, cur_kaz = kc, None
        continue

    m = UNIT.match(line)
    if m:
        a, b, name = m.groups()
        uc = f"{a}.{b}"
        units.setdefault(uc, {"code": uc, "grade": int(a), "name": clean(name), "konular": {}})
        cur_unit, cur_konu, cur_kaz = uc, None, None
        continue

    # non-code line -> continuation of kazanim title (until it ends with a period) or aciklama
    if cur_kaz is not None:
        if not cur_kaz["title"].rstrip().endswith((".", "?", ":")):
            cur_kaz["title"] = clean(cur_kaz["title"] + " " + line)
        else:
            cur_kaz["aciklama"].append(clean(line))

# flatten to ordered lists, join aciklama
out_units = []
for uc, u in units.items():
    konular = []
    for kc, k in u["konular"].items():
        for kz in k["kazanimlar"]:
            kz["aciklama"] = " ".join(kz["aciklama"]).strip()
        konular.append({"code": k["code"], "name": k["name"], "kazanimlar": k["kazanimlar"]})
    out_units.append({"code": u["code"], "grade": u["grade"], "name": u["name"], "konular": konular})

db = {
    "ders": "Matematik",
    "source": "TTKB 2026 YKS'ye esas dersler - konu ve kazanimlar (resmi PDF)",
    "level": "regular (9-12)",
    "units": out_units,
}

total = sum(len(k["kazanimlar"]) for u in out_units for k in u["konular"])
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"units={len(out_units)} konular={sum(len(u['konular']) for u in out_units)} kazanimlar={total}")
print("->", OUT)
