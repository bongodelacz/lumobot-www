"""Składa wszystkie strony LumoBota.
- strona/index.html z strona/szablony/index.html (znaczniki <!--#include czesci/X.html-->),
- podstrony (funkcje, porownanie, pytania, nowosci) ze wspólnego wzoru: pasek, treść z czesci/strona-X.html, stopka.
- czesci/strona-nowosci.html powstaje sam z prawdziwego dziennika zmian LumoBota (CHANGELOG.md).
Brakująca część strony z PAGES przerywa składanie błędem (kod wyjścia 1), żeby żadna strona nie zniknęła po cichu.
Dziennik zmian: zmienna LUMOBOT_CHANGELOG, potem CHANGELOG.md w folderze projektu, obok niego albo w ~/Desktop/Neuro AI.
Uruchom: python narzedzia/zloz.py
"""
import html
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "strona"


def find_changelog() -> Path:
    """Dziennik zmian LumoBota bez ścieżki wpisanej na sztywno; czytelny błąd, gdy pliku nie ma."""
    proj = ROOT.parent
    cands = [Path(os.environ["LUMOBOT_CHANGELOG"])] if os.environ.get("LUMOBOT_CHANGELOG") else []
    cands += [proj / "CHANGELOG.md", proj.parent / "CHANGELOG.md", Path.home() / "Desktop" / "Neuro AI" / "CHANGELOG.md"]
    for c in cands:
        if c.is_file():
            return c
    sys.exit("Nie znalazłem CHANGELOG.md LumoBota. Sprawdziłem:\n  " + "\n  ".join(map(str, cands))
             + "\nUstaw zmienną LUMOBOT_CHANGELOG na ścieżkę do pliku i uruchom ponownie.")


CHANGELOG = find_changelog()

PAGES = {
    "funkcje": ("Funkcje LumoBota", "Praca do skutku, Neuro, zespół z Liderem, wyspa i głos, własna przeglądarka i więcej.", ["vs-styl", "baner-funkcje", "strona-funkcje", "bezpieczenstwo"]),
    "wtyczki": ("Wtyczki LumoBota", "Co podłączysz do LumoBota: połączenia z kontami, narzędzia, dostawcy AI i modele lokalne.", ["vs-styl", "strona-wtyczki", "bezpieczenstwo"]),
    "porownanie": ("Czego LumoBot jeszcze nie ma | LumoBot", "Gdzie inni są dziś lepsi, ze źródłami, i co z tym zrobimy. Pytania o rozwój LumoBota.", ["vs-styl", "baner-rywale", "strona-porownanie", "karty-porownania"]),
    "wtyczka-google": ("Gmail i Kalendarz Google w LumoBocie", "Jak agenci LumoBota pracują z pocztą i kalendarzem Google. Logujesz się sam, agent nie zna hasła.", ["vs-styl", "strona-wtyczka-google", "karty-wtyczki"]),
    "wtyczka-notion-dysk": ("Notion i Dysk Google w LumoBocie", "Jak agenci LumoBota pracują z notatkami, dokumentami i plikami.", ["vs-styl", "strona-wtyczka-notion-dysk", "karty-wtyczki"]),
    "wtyczka-przegladarka": ("Przeglądarka agenta w LumoBocie", "Własna przeglądarka Playwright i aktualna dokumentacja dla agentów LumoBota.", ["vs-styl", "strona-wtyczka-przegladarka", "karty-wtyczki"]),
    "wtyczka-slack-discord": ("Slack i Discord w LumoBocie", "Jak agenci LumoBota pracują z kanałami zespołu i wiadomościami.", ["vs-styl", "strona-wtyczka-slack-discord", "karty-wtyczki"]),
    "wtyczka-github-figma": ("GitHub i Figma w LumoBocie", "Jak agenci LumoBota pracują z repozytoriami, zgłoszeniami i projektami.", ["vs-styl", "strona-wtyczka-github-figma", "karty-wtyczki"]),
    "wtyczka-wzory": ("Gotowe wzory planu w LumoBocie", "Sprawdzone przebiegi pracy, które uruchamiasz jednym kliknięciem.", ["vs-styl", "strona-wtyczka-wzory", "karty-wtyczki"]),
    "vs-openbot": ("LumoBot vs OpenBot", "Lokalny zespół agentów kontra aplikacja i serwer dla firm. Ceny, platformy i fakty ze źródeł.", ["vs-styl", "strona-vs-openbot"]),
    "vs-grok-bot": ("LumoBot vs Grok Bot", "Lokalny folder kontra komputer w chmurze. Ceny, wybór modelu i dane ze źródeł.", ["vs-styl", "strona-vs-grok-bot"]),
    "vs-claude-cowork": ("LumoBot vs Claude Cowork", "Wielu dostawców kontra modele Claude. Ceny, pliki lokalne i sesje chmurowe ze źródeł.", ["vs-styl", "strona-vs-claude-cowork"]),
    "vs-manus": ("LumoBot vs Manus", "Model lokalny bez klucza kontra planowanie w chmurze i kredyty. Fakty ze źródeł.", ["vs-styl", "strona-vs-manus"]),
    "vs-openclaw": ("LumoBot vs OpenClaw", "Lokalna aplikacja kontra Windows Hub, komunikatory i otwarty kod. Fakty ze źródeł.", ["vs-styl", "strona-vs-openclaw"]),
    "vs-devin": ("LumoBot vs Devin", "Model lokalny kontra chmurowe modele Devina. Quick Review, ceny i pliki ze źródeł.", ["vs-styl", "strona-vs-devin"]),
    "nowosci": ("Co nowego w LumoBocie", "Wszystkie zmiany w LumoBocie, od najnowszych.", ["vs-styl", "baner-dziennik", "strona-nowosci", "karty-artykuly"]),
    "ai": ("Świat AI: jak myślimy o agentach", "Zasady, na których stoi LumoBot, i uczciwe granice.", ["vs-styl", "baner-ai", "strona-ai"]),
    "firmy": ("LumoBot dla firm: licencja komercyjna", "Do 30 grudnia 2026 LumoBot jest za darmo także w firmie. Od 31 grudnia 2026 praca komercyjna wymaga licencji.", ["vs-styl", "baner-firmy", "strona-firmy"]),
    "status": ("Status LumoBota", "Wersja aplikacji i usługi, z których korzysta LumoBot. Aplikacja działa na twoim komputerze.", ["vs-styl", "baner-status", "strona-status"]),
    "dokumentacja": ("Dokumentacja LumoBota", "Instalacja, pierwsze zadanie, zespół z Liderem, modele, wtyczki i bezpieczeństwo.", ["vs-styl", "baner-dokumentacja", "strona-dokumentacja"]),
    "o-nas": ("O nas | LumoBot", "Kim jesteśmy i gdzie znajdziesz dokumentację, aktualizacje, porównania i status LumoBota.", ["vs-styl", "baner-o-nas", "strona-o-nas", "karty-onas"]),
    "cennik": ("Cennik LumoBota: 0 zł", "LumoBot kosztuje 0 zł. Płacisz tylko za plan AI, który już masz, albo nic przy modelu lokalnym.", ["vs-styl", "baner-cennik", "strona-cennik", "bezpieczenstwo"]),
    "nowosc-gotowe-znaczy-sprawdzone": ('Gotowe znaczy sprawdzone', 'Agent AI potrafi napisać „zrobione” po każdym zadaniu. LumoBot nie pisze tego słowa, dopóki ktoś inny niż autor nie sprawdzi wyniku.', ["vs-styl", "baner-nowosc-gotowe-znaczy-sprawdzone", "strona-nowosc-gotowe-znaczy-sprawdzone", "karty-artykuly"]),
    "nowosc-haslo-zostaje-u-ciebie": ('Agent nie musi znać twojego hasła', 'Żeby agent coś zrobił na twoim koncie, nie musi wiedzieć, jak się do niego logujesz. W LumoBocie hasło wpisujesz ty, a agent pracuje dopiero na gotowej sesji.', ["vs-styl", "baner-nowosc-haslo-zostaje-u-ciebie", "strona-nowosc-haslo-zostaje-u-ciebie", "karty-artykuly"]),
    "nowosc-zespol-nie-solista": ('Jeden agent to za mało', 'Jeden model, który planuje, pisze, buduje i sam się ocenia, przypomina firmę zatrudniającą jedną osobę. LumoBot dzieli tę pracę na role.', ["vs-styl", "baner-nowosc-zespol-nie-solista", "strona-nowosc-zespol-nie-solista", "karty-artykuly"]),
    "nowosc-twoj-plan-nasz-program": ('Płacisz za AI raz, nie dwa razy', 'Masz już plan Claude albo ChatGPT. LumoBot nie dokłada do niego drugiego abonamentu, tylko pracuje na tym, za co już płacisz.', ["vs-styl", "baner-nowosc-twoj-plan-nasz-program", "strona-nowosc-twoj-plan-nasz-program", "karty-artykuly"]),
}
CSS = ["baza", "tlo", "aurora", "pasek", "dol", "zorza", "strony", "tytul", "rozmycie", "zabawa", "artykul"]


MISSING: list = []   # brakujące części (szablon, pasek, stopka...): na końcu main() kończą skrypt kodem 1


def read(rel: str) -> str:
    f = ROOT / rel
    if not f.exists():
        print("BRAK części:", rel)
        MISSING.append(rel)
        return f"<!-- brak: {rel} -->"
    return f.read_text(encoding="utf-8-sig").strip()


def includes(page: str) -> str:
    return re.sub(r"<!--#include ([\w/.\-]+)-->", lambda m: read(m.group(1)), page)


def slug(v: str) -> str:
    return "v" + v.replace(".", "-")


MIES_KROTKO = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]
MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]


def rodzaj(t: str) -> str:
    """Rodzaj zmiany po słowach w opisie: naprawa, nowość albo ulepszenie."""
    low = t.lower()
    if re.search(r"\bnaprawa\b|nie (startował|wstawało|myli|wyskakuje|skacze)|błąd|błędu|zniknęła|koniec z", low):
        return "naprawa"
    if re.search(r"\bnow(y|a|e|ych)\b|polecenie lumo|osobnym typem|sterowanie komputerem|przeglądarka agenta: każdy|rozmowa głosowa|aktywność na discordzie|propozycje na pustym", low):
        return "nowosc"
    return "ulepszenie"


def nowosci() -> None:
    """Zakładka Co nowego: pełny dziennik zmian z prawdziwego CHANGELOG.md.
    Po lewej przyklejona lista wersji (z wyszukiwarką), po prawej cały dziennik."""
    text = CHANGELOG.read_text(encoding="utf-8")
    parts = re.findall(r"^## ([\d.]+) \(([\d-]+)\)\n(.*?)(?=^## |\Z)", text, re.S | re.M)
    kategorie = [("nowosc", "NOWE"), ("ulepszenie", "ULEPSZENIA"), ("naprawa", "NAPRAWY")]
    nav, log = [], []
    grupa = None
    for i, (v, d, body) in enumerate(parts):
        items = [x.strip()[2:].strip() for x in body.strip().splitlines() if x.strip().startswith("- ")]
        y, m, dd = d.split("-")
        data = f"{int(dd)} {MIESIACE[int(m) - 1]} {y}"
        major = ".".join(v.split(".")[:2])
        if major != grupa:
            if grupa:
                nav.append("</div>")
            nav.append(f'<div class="cl-group"><p class="cl-gname">Wersja {major}</p>')
            grupa = major
        nav.append(f'<a class="cl-link" href="#{slug(v)}" data-v="{slug(v)}"><b>{v}</b><small><time datetime="{d}">{int(dd)} {MIES_KROTKO[int(m) - 1]} {y}</time></small></a>')
        by_cat = {"nowosc": [], "ulepszenie": [], "naprawa": []}
        for t in items:
            r = rodzaj(t)
            by_cat[r].append(f'<li class="cl-item" data-r="{r}"><span class="cl-copy">{html.escape(t)}</span></li>')
        cats = []
        for r, label in kategorie:
            if by_cat[r]:
                cats.append(
                    f'<div class="cl-cat cl-cat-{r}" data-cat="{r}">'
                    f'<p class="cl-cat-head"><span class="cl-dot" aria-hidden="true"></span><span class="cl-cat-name">{label}</span><span class="cl-cat-count">{len(by_cat[r])}</span></p>'
                    f'<ul class="cl-list">{"".join(by_cat[r])}</ul>'
                    f'</div>'
                )
        badge = '<span class="cl-latest">Najnowsza</span>' if i == 0 else ""
        log.append(f'<article class="cl-ver" id="{slug(v)}"><header class="cl-vhead"><h2>{v}</h2>{badge}<time datetime="{d}">{data}</time></header>'
                   f'{"".join(cats)}</article>')
    nav.append("</div>")
    out = f"""<section class="cl-body wrap" id="wszystkie">
  <aside class="cl-side">
  <div class="cl-tools">
    <label class="cl-search"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><input type="search" id="clSearch" placeholder="Szukaj w zmianach" autocomplete="off"></label>
    <div class="cl-filters" role="group" aria-label="Rodzaj zmian">
      <button type="button" class="cl-f is-on" data-f="all">Wszystko</button><button type="button" class="cl-f" data-f="nowosc">Nowości</button><button type="button" class="cl-f" data-f="ulepszenie">Ulepszenia</button><button type="button" class="cl-f" data-f="naprawa">Naprawy</button>
    </div>
  </div>
  <nav class="cl-nav" aria-label="Wersje">{''.join(nav)}</nav>
  </aside>
  <div class="cl-log">
    {''.join(log)}
    <p class="cl-empty" id="clEmpty" hidden>Nic nie pasuje do wyszukiwania. Spróbuj innego słowa.</p>
  </div>
  <p class="cl-more"><a class="cl-gh" href="https://github.com/bongodelacz/lumobot-releases/releases" rel="noopener">Starsze wydania na GitHubie →</a></p>
</section>
"""
    (ROOT / "czesci" / "strona-nowosci.html").write_text(out, encoding="utf-8", newline="\n")


def subpage(name: str, title: str, desc: str, parts: list) -> str:
    own = [p for p in dict.fromkeys(parts + [name]) if (ROOT / "css" / f"{p}.css").exists()]
    shared = ["pytania"]                             # pytania w tym samym wyglądzie co na głównej
    if name.startswith(("vs-", "wtyczka-", "nowosc-")) or name in ("porownanie", "nowosci", "wtyczki", "ai", "cennik", "funkcje", "firmy", "status", "dokumentacja", "o-nas"):
        shared = ["sekcja-pojedynki", "pytania"]     # banery .pj-art z gradientem (data-pal) 1:1 jak na głównej
    # wspólne style zawsze przed własnym css strony, żeby strona mogła je doprecyzować
    css = CSS + [c for c in shared if c not in own] + own
    links = "\n".join(f'<link rel="stylesheet" href="css/{c}.css">' for c in css)
    body = "\n".join(f"<!--#include czesci/{p}.html-->" for p in parts)
    return f"""<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="img/og.png">
<meta name="theme-color" content="#0a0a0a">
<link rel="icon" href="img/app.png">
<link rel="preload" href="fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
{links}
<link rel="stylesheet" href="faces.css">
<script>if(/[?&]statycznie/.test(location.search)) document.documentElement.classList.add('static');</script>
</head>
<body class="sub sub-{name}">
<!--#include czesci/pasek.html-->
<main id="tresc" class="st-main">
{body}
</main>
<!--#include czesci/dol.html-->
<script src="js/agenci.js"></script>
<script src="js/jezyki.js" defer></script>
<script src="js/ruch.js" defer></script>
<script src="js/grain.js" defer></script>
<script src="js/pasek.js" defer></script>
<script src="js/wspolne.js" defer></script>
<script src="js/zabawa-teksty.js" defer></script>
<script src="js/zabawa.js" defer></script>
<script src="js/rozmycie.js" defer></script>
<script src="js/fale.js" defer></script>
<script src="js/waz.js" defer></script>
{f'<script src="js/strona-{name}.js" defer></script>' if (ROOT / "js" / f"strona-{name}.js").exists() else ""}
</body>
</html>
"""


def latest() -> str:
    m = re.search(r"^## ([\d.]+) \(", CHANGELOG.read_text(encoding="utf-8"), re.M)
    return m.group(1) if m else "0.13.4"


def nowosci_menu() -> str:
    """Ostatnie zmiany do panelu Aktualizacje w pasku: po lewej najnowsza wersja z datą i linkiem, po prawej 3-4 wiersze zmian."""
    text = CHANGELOG.read_text(encoding="utf-8")
    parts = re.findall(r"^## ([\d.]+) \(([\d-]+)\)\n(.*?)(?=^## |\Z)", text, re.S | re.M)[:4]
    if not parts:
        return ""
    v0, d0, _ = parts[0]
    y0, m0, dd0 = d0.split("-")
    data0 = f"{int(dd0)} {MIESIACE[int(m0) - 1]} {y0}"
    left = (
        f'<div class="wy-up-left">'
        f'<small class="wy-up-kicker">Najnowsza</small>'
        f'<b class="wy-up-ver">{v0}</b>'
        f'<time class="wy-up-date" datetime="{d0}">{data0}</time>'
        f'<a class="wy-all wy-up-all" href="nowosci.html">Cały dziennik zmian →</a>'
        f'</div>'
    )
    rows = []
    for v, d, body in parts:
        first = next((x.strip()[2:].strip() for x in body.strip().splitlines() if x.strip().startswith("- ")), "")
        sent = re.split(r"(?<=\.)\s+", first)[0].strip() if first else ""
        if not sent:
            sent = first
        y, m, dd = d.split("-")
        data = f"{int(dd)} {MIESIACE[int(m) - 1]} {y}"
        rows.append(
            f'<a class="wy-up-row" href="nowosci.html#{slug(v)}">'
            f'<span class="wy-up-txt">{html.escape(sent)}</span>'
            f'<small class="wy-up-meta">Wersja {v} · {data}</small>'
            f'</a>'
        )
    return left + f'<div class="wy-list wy-up-list">{"".join(rows)}</div>'


OFFLINE_HEAD = ('<script>if(location.protocol==="file:")document.write(\'<script src="js/maski.js"><\\/script>'
                '<link rel="stylesheet" href="css/font-plik.css">\')</script>')


def offline() -> None:
    """Strona otwarta z dysku (file://): Chrome blokuje maski CSS i fonty z plików (CORS), więc buźki wychodzą szare.
    Budujemy wersje wpisane w plik: js/maski.js (maski kształtów jako data:) i css/font-plik.css (Inter jako data:).
    Ładują się tylko przy file://, przez serwer strona dalej używa zwykłych plików."""
    import base64
    faces = ROOT / "app" / "faces"
    maski = {p.name[:-len("-mul.png")]: "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()
             for p in sorted(faces.glob("*-mul.png"))}
    import json
    (ROOT / "js" / "maski.js").write_text("/* Wygenerowane przez narzedzia/zloz.py: maski buziek dla strony otwartej z dysku. */\nwindow.LUMO_MASKS="
                                         + json.dumps(maski) + ";\n", encoding="utf-8", newline="\n")
    css = ["/* Wygenerowane przez narzedzia/zloz.py: Inter wpisany w plik dla strony otwartej z dysku. */"]
    baza = (ROOT / "css" / "baza.css").read_text(encoding="utf-8")
    for m in re.finditer(r"@font-face\{[^}]*\}", baza):
        rule = m.group(0)
        u = re.search(r"url\(\.\./fonts/([\w\-.]+)\)", rule)
        if u:
            data = base64.b64encode((ROOT / "fonts" / u.group(1)).read_bytes()).decode()
            css.append(rule.replace(u.group(0), f"url(data:font/woff2;base64,{data})"))
    (ROOT / "css" / "font-plik.css").write_text("\n".join(css) + "\n", encoding="utf-8", newline="\n")
    # js/agenci.js, app/app.js i app/index.html generuje narzedzia/zbuduj_app.py razem z obsługą masek;
    # składanie ich nie zmienia. Gdy są ze starszej wersji generatora, tylko ostrzegamy.
    for f in (ROOT / "js" / "agenci.js", ROOT / "app" / "app.js"):
        if f.exists() and "LUMO_MASKS" not in f.read_text(encoding="utf-8"):
            print("UWAGA:", f.relative_to(ROOT), "nie obsługuje masek przy file://; uruchom narzedzia/zbuduj_app.py")


PRELOAD = '<link rel="preload" href="fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>'
PRELOAD_SAFE = ('<script>if(location.protocol!=="file:")document.write(\'<link rel="preload" href="fonts/inter-latin-wght-normal.woff2" '
                'as="font" type="font/woff2" crossorigin>\')</script>')


HREF_RE = re.compile(r'(href|data-href|action)="(?:\./)?([a-z0-9-]+)\.html(#[^"]*)?"')


def pretty(html: str, name: str = "index") -> str:
    """Ładne adresy: funkcje.html#neuro -> funkcje/#neuro, index.html -> ./ (wszystko względem korzenia strony).
    Podstrony leżą w folderach (funkcje/index.html) i mają <base href="../">, więc css, js i obrazy działają bez zmian."""
    def rep(m):
        page, anchor = m.group(2), m.group(3) or ""
        if page == "pobierz":   # pobieranie jest teraz sekcją pod ceną, bez osobnej podstrony
            page, anchor = "index", "#pobierz"
        elif page == "aplikacja":
            page, anchor = "index", ""
        return f'{m.group(1)}="{"./" if page == "index" else page + "/"}{anchor}"'
    out = HREF_RE.sub(rep, html)
    out = out.replace('href="app/index.html"', 'href="app/"')          # okno aplikacji też bez .html
    # numer wersji przy css i js: przeglądarka nie pokazuje starych stylów i skryptów z pamięci podręcznej
    def bust(m):
        f = ROOT / m.group(2)
        return f'{m.group(1)}="{m.group(2)}?v={int(f.stat().st_mtime)}"' if f.is_file() else m.group(0)
    out = re.sub(r'\b(href|src)="((?:css|js)/[\w.-]+\.(?:css|js))"', bust, out)
    if name == "index":                                                  # wpisany ręcznie /index.html przechodzi na /
        out = out.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<script>if(/^https?:$/.test(location.protocol)&&/\\/index\\.html$/.test(location.pathname))history.replaceState(null,"",location.pathname.replace(/index\\.html$/,"")+location.search+location.hash)</script>', 1)
    if name != "index":
        out = out.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">', 1)
        out = re.sub(r'href="(#[^"]*)"', lambda m: f'href="{name}/{m.group(1)}"', out)
    return out


def redirect_stub(name: str) -> str:
    return (f'<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>LumoBot</title>'
            f'<link rel="canonical" href="{name}/"><meta http-equiv="refresh" content="0; url={name}/">'
            f'<script>location.replace("{name}/" + location.hash)</script></head><body><a href="{name}/">Przejdź dalej</a></body></html>\n')


def retired_stub(target: str) -> str:
    return (f'<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>LumoBot</title>'
            f'<link rel="canonical" href="{target}"><meta http-equiv="refresh" content="0; url={target}">'
            f'<script>location.replace("{target}")</script></head><body><a href="{target}">Przejdź dalej</a></body></html>\n')


def main() -> None:
    offline()
    nowosci()
    ver = latest()
    menu = nowosci_menu()
    idx = includes((ROOT / "szablony" / "index.html").read_text(encoding="utf-8"))
    idx = idx.replace('<link rel="stylesheet" href="faces.css">', '<link rel="stylesheet" href="faces.css">\n' + OFFLINE_HEAD, 1).replace(PRELOAD, PRELOAD_SAFE)
    (ROOT / "index.html").write_text(pretty(idx.replace("{{WERSJA}}", ver).replace("{{WERSJA2}}", ".".join(ver.split(".")[:2])).replace("{{NOWOSCI_MENU}}", menu)), encoding="utf-8", newline="\n")
    braki = []
    for name, (title, desc, parts) in PAGES.items():
        missing = [p for p in parts if not (ROOT / "czesci" / f"{p}.html").exists()]
        if missing:
            braki.append(f"{name}: {', '.join(missing)}")
            continue
        page = includes(subpage(name, title, desc, parts)).replace('<link rel="stylesheet" href="faces.css">', '<link rel="stylesheet" href="faces.css">\n' + OFFLINE_HEAD, 1).replace(PRELOAD, PRELOAD_SAFE)
        (ROOT / name).mkdir(exist_ok=True)
        (ROOT / name / "index.html").write_text(pretty(page.replace("{{WERSJA}}", ver).replace("{{WERSJA2}}", ".".join(ver.split(".")[:2])).replace("{{NOWOSCI_MENU}}", menu), name), encoding="utf-8", newline="\n")
        (ROOT / f"{name}.html").write_text(redirect_stub(name), encoding="utf-8", newline="\n")   # stare adresy przekierowują na ładne
    dane = ROOT / "app" / "dane.js"          # okno aplikacji pokazuje tę samą wersję co strona
    if dane.exists():
        t = dane.read_text(encoding="utf-8")
        dane.write_text(re.sub(r'("update": ?\{"version": ?)"[\d.]+"', lambda m: f'{m.group(1)}"{ver}"', t), encoding="utf-8", newline="\n")
    # Pobieranie jest sekcją pod ceną. Dawny widok aplikacji prowadzi na główną.
    for gone in ("pobierz", "aplikacja", "pytania"):  # zakładek pobierz, aplikacja i pytania nie ma (decyzje użytkownika)
        anchor = "#pobierz" if gone == "pobierz" else ""
        (ROOT / f"{gone}.html").write_text(retired_stub("./" + anchor), encoding="utf-8", newline="\n")
        (ROOT / gone).mkdir(exist_ok=True)
        (ROOT / gone / "index.html").write_text(retired_stub("../" + anchor), encoding="utf-8", newline="\n")
    if braki:
        sys.exit("Nie złożyłem stron, bo brakuje części w strona/czesci/:\n  " + "\n  ".join(braki))
    if MISSING:
        sys.exit("Strony złożone niepełne, bo brakuje plików (menu, stopka albo szablon):\n  " + "\n  ".join(sorted(set(MISSING))))
    print("zapisano: index +", ", ".join(PAGES), "| wersja", ver)


if __name__ == "__main__":
    main()
