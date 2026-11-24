"""Sprawdza linki wewnętrzne strony: czy każda strona i każda kotwica (#id) istnieje. Uruchom: python narzedzia/sprawdz_linki.py
Strona ma ładne adresy: index.html w korzeniu i podstrony w folderach (funkcje/index.html), linki "funkcje/#neuro" i "./".
Stare pliki funkcje.html to tylko przekierowania, więc nie są sprawdzane jako strony."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "strona"
pages = {"": (ROOT / "index.html").read_text(encoding="utf-8")}
for p in ROOT.glob("*/index.html"):
    t = p.read_text(encoding="utf-8")
    if p.parent.name != "app" and 'http-equiv="refresh"' not in t:   # przekierowania (pobierz, aplikacja) to nie strony
        pages[p.parent.name] = t
ids = {n: set(re.findall(r'\sid="([^"]+)"', t)) for n, t in pages.items()}
bad = []
for name, text in pages.items():
    for href in re.findall(r'<a [^>]*href="([^"]+)"', text):
        if href.startswith(("http", "mailto:")):
            continue
        path, _, frag = href.partition("#")
        if path.startswith("app/") or "." in path.rsplit("/", 1)[-1]:
            if path and not (ROOT / path).exists():
                bad.append((name or "index", href, "brak pliku"))
            continue
        target = name if (path == "" and not name) else path.strip("./").rstrip("/") if path not in ("./", "") else ""
        if path == "" and name:
            target = name
        if target not in pages:
            bad.append((name or "index", href, "brak strony"))
        elif frag and frag not in ids[target]:
            bad.append((name or "index", href, "brak kotwicy"))
for b in sorted(set(bad)):
    print(*b, sep="  |  ")
print("stron:", len(pages), "złych linków:", len(set(bad)))
sys.exit(1 if bad else 0)
