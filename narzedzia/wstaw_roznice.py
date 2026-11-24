"""Wstawia bloki "Najważniejsza różnica" z tresci/roznica-v14.md do section.vs-text na 6 stronach vs.
Format pliku: ## vs-x, potem akapity oddzielone pustą linią. Uruchom: python narzedzia/wstaw_roznice.py [plik.md]"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tresci" / "roznica-v14.md"
text = SRC.read_text(encoding="utf-8")
for key, body in re.findall(r"^## (vs-[a-z-]+)\s*\n(.*?)(?=^## |\Z)", text, re.S | re.M):
    paras = [p.strip() for p in body.strip().split("\n\n") if p.strip() and not p.strip().startswith(("#", ">", "Źródł", "Zrodl"))]
    f = ROOT / "strona" / "czesci" / f"strona-{key}.html"
    if not f.exists():
        print("brak pliku:", f.name)
        continue
    page = f.read_text(encoding="utf-8")
    new = "".join(f"<p>{html.escape(' '.join(p.split()), quote=False)}</p>" for p in paras)
    page2, n = re.subn(r'(<section class="vs-text"><h2 class="title">[^<]*</h2>).*?(</section>)',
                       lambda m: m.group(1) + new + m.group(2), page, count=1, flags=re.S)
    if n:
        f.write_text(page2, encoding="utf-8", newline="\n")
    print(key, "akapitów:", len(paras), "wstawiono" if n else "BRAK sekcji vs-text")
