"""Wyciąga wszystkie polskie teksty ze złożonych stron (strona/*.html) i skryptów strony do strona/i18n/pl.json.
Tłumacze tworzą en.json, es.json, ru.json: obiekt {"tekst po polsku": "tłumaczenie"}. Uruchom po zloz.py."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "strona"
SKIP = {"script", "style", "svg", "code", "noscript"}
ATTRS = ("placeholder", "aria-label", "title", "alt", "data-goal", "data-type")


class Zbieracz(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth_skip = 0
        self.out = set()

    def handle_starttag(self, tag, attrs):
        if tag in SKIP:
            self.depth_skip += 1
        for k, v in attrs:
            if k in ATTRS and v and re.search(r"[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{2}", v):
                self.out.add(v.strip())

    def handle_endtag(self, tag):
        if tag in SKIP and self.depth_skip:
            self.depth_skip -= 1

    def handle_data(self, data):
        t = " ".join(data.replace("\u00a0", " ").split())
        if not self.depth_skip and re.search(r"[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{2}", t):
            self.out.add(t)


def main():
    z = Zbieracz()
    # Zwykłe strony są na poziomie ROOT. Nową tabelę i nagłówki porównań
    # wyciągamy z ich fragmentów, bez dublowania całej treści podstron.
    # Od ładnych adresów podstrony leżą w folderach (funkcje/index.html), a funkcje.html to tylko przekierowanie.
    files = sorted(ROOT.glob("*.html")) + sorted(ROOT.glob("*/index.html"))
    for f in files:
        if f.parent.name == "app":
            continue
        text = f.read_text(encoding="utf-8")
        if 'http-equiv="refresh"' in text:      # przekierowania nie mają treści do tłumaczenia
            continue
        z.feed(text)
    source_parts = sorted((ROOT / "czesci").glob("strona-vs-*.html"))
    comparison = ROOT / "czesci" / "strona-porownanie.html"
    if comparison.exists():
        source_parts.append(comparison)
    for f in source_parts:
        source = f.read_text(encoding="utf-8")
        for block in re.findall(
            r'<div class="pg-head">.*?</div>|<section class="vs-tab2?"[\s\S]*?</section>|'
            r'<section class="vs-text"[\s\S]*?</section>|<section class="vs-faq"[\s\S]*?</section>',
            source,
            re.S,
        ):
            z.feed(block)
    # teksty wstawiane przez skrypty (wyspa, scena agentów, komunikaty)
    for js in ("js/strona.js", "js/sekcja-agenci.js", "js/wspolne.js"):
        p = ROOT / js
        if p.exists():
            for m in re.findall(r"'([^'\n]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^'\n]*)'", p.read_text(encoding="utf-8")):
                z.out.add(m.strip())
    skip = {"LumoBot", "Claude", "ChatGPT", "Antigravity", "OpenCode", "Lider", "Pióro", "Kreska", "Lupa", "Radar", "Paleta"}
    items = sorted(t for t in z.out if t not in skip and len(t) < 400)
    out = ROOT / "i18n"
    out.mkdir(exist_ok=True)
    (out / "pl.json").write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8", newline="\n")
    print("tekstów:", len(items))


if __name__ == "__main__":
    main()
