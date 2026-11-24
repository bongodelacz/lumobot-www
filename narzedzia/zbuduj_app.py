"""Buduje strona/app/: prawdziwą aplikację LumoBot (index.html, app.js, i18n.js, style.css...) 1:1,
która działa bez serwera. Zapytania do /api/* obsługuje strona/app/mock.js, a dane startowe są w dane.js.

Dane: nagrane z działającego LumoBota (narzedzia/nagraj_api.py), wyczyszczone z prywatnych rzeczy
i uzupełnione przykładową rozmową (strona kawiarni). Uruchom:  python narzedzia/zbuduj_app.py
"""
import getpass
import copy
import json
import os
import re
import importlib.util
import shutil
import sys
import tempfile
from pathlib import Path

# Pliki aplikacji LumoBota: zmienna LUMOBOT_APP albo domyślne miejsce w katalogu domowym (bez nazwy użytkownika w kodzie).
APP = Path(os.environ["LUMOBOT_APP"]) if os.environ.get("LUMOBOT_APP") else Path.home() / "Desktop" / "Neuro AI" / "lumobot" / "site"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "strona" / "app"
REC = Path(tempfile.gettempdir()) / "lumo-dump" / "api"
FOLDER = "C:\\Users\\ty\\Projekty\\moj-projekt"
T0 = 1794850000000  # 16.11.2026, ok. 18:46


def _find_changelog():
    """Wspólne źródło dziennika zmian: find_changelog() z zloz.py (działa też przy python -I, bez sys.path)."""
    spec = importlib.util.spec_from_file_location("zloz", Path(__file__).with_name("zloz.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.find_changelog()


def wersja_lumo():
    """Najnowsza wersja z CHANGELOG.md LumoBota, ta sama co na stronie."""
    m = re.search(r"^## ([\d.]+) \(", _find_changelog().read_text(encoding="utf-8"), re.M)
    return m.group(1) if m else "0.14.2"


def rec(name):
    return json.loads((REC / name).read_text(encoding="utf-8"))


# Pola, których wartość tekstowa nigdy nie trafia do publicznego dane.js (liczniki "tokens" to liczby, więc zostają).
USER = getpass.getuser()      # nazwa użytkownika Windows: znika z nagranych danych
SECRET_KEY = re.compile(r"(?i)(api[_-]?key|apikey|secret|passw|token|bearer|cookie|credential|private[_-]?key|e-?mail|(?<![a-z])key$)")
# Wartości wyglądające na klucze, tokeny albo adresy e-mail.
SECRET_VALUE = re.compile(
    r"(sk-[A-Za-z0-9_-]{12,}|sk_(live|test)_[A-Za-z0-9]{12,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}"
    r"|xox[abprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,}|ya29\.[0-9A-Za-z_-]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}"
    r"|(?i:bearer)\s+[A-Za-z0-9._-]{16,})")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
SAFE_EMAIL = "ty@example.com"
# Ścieżki domowe dowolnego użytkownika: C:\Users\x, C:\\Users\\x (w JSON), C:/Users/x, /home/x, /Users/x. Dozwolony tylko "ty".
USER_PATH_WIN = re.compile(r'(?i)([A-Z]:(?:\\+|/)Users(?:\\+|/))(?!ty(?:\\|/|"|$))([^\\/"\s]+)')
USER_PATH_NIX = re.compile(r'((?<![A-Za-z]:)(?:/home/|/Users/))(?!ty(?:/|"|$))([^/"\s]+)')


def scrub(v, key=""):
    """Usuwa prywatne ścieżki, nazwę użytkownika, e-maile, klucze i tokeny z nagranych danych."""
    if isinstance(v, dict):
        return {k: scrub(x, k) for k, x in v.items()}
    if isinstance(v, list):
        return [scrub(x, key) for x in v]
    if isinstance(v, str):
        if v and SECRET_KEY.search(key):
            return ""
        v = USER_PATH_WIN.sub(lambda m: m.group(1) + "ty", v)    # każda nazwa użytkownika w ścieżce, nie tylko jedna
        v = USER_PATH_NIX.sub(lambda m: m.group(1) + "ty", v)
        v = SECRET_VALUE.sub("", v)
        v = EMAIL.sub(SAFE_EMAIL, v)
        return re.sub("(?i)" + re.escape(USER), "ty", v) if USER else v
    return v


def check_private(blob):
    """Ostatnia straż przed zapisem publicznego pliku: zwykły if, działa też przy python -O."""
    found = []
    if USER and USER.lower() in blob.lower():
        found.append("nazwa użytkownika")
    paths = {m.group(0) for m in USER_PATH_WIN.finditer(blob)} | {m.group(0) for m in USER_PATH_NIX.finditer(blob)}
    if paths:
        found.append("ścieżka użytkownika: " + ", ".join(sorted(paths))[:80])
    if SECRET_VALUE.search(blob):
        found.append("klucz albo token: " + SECRET_VALUE.search(blob).group(0)[:6] + "...")
    other = {m for m in EMAIL.findall(blob) if m != SAFE_EMAIL}
    if other:
        found.append("e-mail: " + ", ".join(sorted(other))[:80])
    if found:
        raise RuntimeError("dane.js nie zapisany, zostały prywatne dane: " + "; ".join(found))


def must_replace(text, old, new, what, count=-1):
    """Podmiana, która głośno zgłasza, gdy wzorzec przestał pasować (np. po zmianie app.js w LumoBocie)."""
    if old not in text:
        raise RuntimeError(f"nie znaleziono wzorca do podmiany: {what}. Sprawdź, czy {APP} się nie zmienił.")
    return text.replace(old, new, count)


def must_sub(pattern, new, text, what):
    out, n = re.subn(pattern, new, text, count=1)
    if not n:
        raise RuntimeError(f"nie znaleziono wzorca do podmiany: {what}. Sprawdź, czy {APP} się nie zmienił.")
    return out


ROLES = {  # krótkie, żeby mieściły się w panelu bocznym bez ucinania
    "Lider": "Prowadzi zespół",
    "Pióro": "Pisze teksty",
    "Kreska": "Buduje strony",
    "Lupa": "Testuje wszystko",
    "Radar": "Śledzi rynek",
    "Paleta": "Rysuje grafiki",
}

# Ustalenia zespołu: Lider i specjaliści pracują na GPT, Lupa (testy) na Claude Haiku 5.5,
# a agent od obrazów na Gemini.
AGENT_MODELS = {
    "Lider": "gpt-5.6-luna",
    "Pióro": "gpt-5.6-luna",
    "Kreska": "gpt-5.6-luna",
    "Lupa": "claude-haiku-5-5",
    "Radar": "gpt-5.6-luna",
    "Paleta": "agy:gemini-4-argon-medium",
}
# Wysiłek Lidera w demo; zgodny z zadaniem kawiarni w cafe_run (config.effort).
AGENT_EFFORT = {"Lider": "medium"}


def step(kind, text, full=None, out=None, who=None):
    s = {"kind": kind, "text": text}
    if full:
        s["full"] = full
    if out:
        s["out"] = out
    if who:
        s["who"] = who
    return s


def cafe_run(lider, pioro, paleta, lupa):
    t = T0
    r1_steps = [
        step("think", ""),
        step("find", "*", full="Get-ChildItem -Recurse", out="menu.txt\nzdjecia\\\nlogo-ziarno.png"),
        step("read", "menu.txt", out="Espresso 9 zł\nFlat white 14 zł\nCappuccino 13 zł\nSernik baskijski 16 zł"),
        step("team", "Pióro: hasło i opisy do menu"),
        step("team", "Paleta: ilustracja filiżanki"),
        step("edit", "index.html"),
        step("edit", "style.css"),
        step("edit", "rezerwacja.js"),
        step("run", "lumo zrzut index.html --telefon", full="lumo zrzut index.html --telefon", out="Zrzut zapisany: .lumobot\\zrzuty\\01-index-telefon.png (390x844)\nKonsola strony: bez błędów."),
    ]
    r2_steps = [
        step("think", ""),
        step("read", "style.css"),
        step("edit", "style.css"),
        step("team", "Lupa: przeklikaj stronę na 390 px"),
        step("run", "lumo strona index.html rozmiar 390x844 kliknij \"Zarezerwuj\" zrzut", out="kliknij Zarezerwuj: OK\nBłędy strony: brak."),
    ]
    team1 = [
        {"id": 1, "from": lider["id"], "to": pioro["id"], "name": "Pióro", "q": "Napisz hasło na górę strony kawiarni Ziarno i krótkie opisy pozycji z menu.txt. Ciepło, max 8 słów na opis.",
         "a": "Hasło: **Kawa, która ma czas.**\n\n- Espresso: krótko, mocno, bez gadania.\n- Flat white: aksamit w małej filiżance.\n- Sernik baskijski: przypalony z premedytacją.",
         "work": True, "state": "done", "seconds": 48, "round": 1, "t": t + 40_000, "failed": None, "began": t + 40_000},
        {"id": 2, "from": lider["id"], "to": paleta["id"], "name": "Paleta", "q": "Narysuj ilustrację filiżanki na górę strony, 1200x600, ciepłe brązy, do pliku obrazy/kawa.png.",
         "a": "Gotowe: obrazy/kawa.png (1200x600). Filiżanka z parą, tło kremowe, bez tekstu.",
         "work": True, "state": "done", "seconds": 66, "round": 1, "t": t + 42_000, "failed": None, "began": t + 42_000},
    ]
    team2 = [
        {"id": 3, "from": lider["id"], "to": lupa["id"], "name": "Lupa", "q": "Przeklikaj stronę na telefonie i komputerze. Zgłoś każdą usterkę z miejscem.",
         "a": "Sprawdziłem 390 px i 1440 px. Formularz rezerwacji działa, menu mieści się w ekranie, konsola czysta. Usterek brak.",
         "work": True, "state": "done", "seconds": 41, "round": 2, "t": t + 300_000, "failed": None, "began": t + 300_000},
    ]
    rounds = [
        {"n": 1, "t": t + 1000, "agent": "Strona stoi: menu z cenami, godziny, mapa dojazdu i formularz rezerwacji stolika. Hasło i opisy napisał Pióro, ilustrację filiżanki narysowała Paleta.",
         "check": "Nie przechodzi: na telefonie (390 px) tabela menu wychodzi poza ekran i trzeba przewijać w bok.", "passed": False, "seconds": 228, "cost": 0.0,
         "turns": None, "tokens": 48211, "model": lider["model"], "nudged": False, "steps": r1_steps, "team": team1},
        {"n": 2, "t": t + 240_000, "agent": "Poprawiłem siatkę menu: na telefonie pozycje układają się w jedną kolumnę, a przycisk Zarezerwuj ma pełną szerokość. Lupa przeklikał całość na 390 px: bez błędów.",
         "check": "Przechodzi: strona ma menu, godziny, mapę i działającą rezerwację, a na telefonie nic nie wychodzi poza ekran.", "passed": True, "seconds": 172, "cost": 0.0,
         "turns": None, "tokens": 21877, "model": lider["model"], "nudged": False, "steps": r2_steps, "team": team2},
    ]
    diff = [
        {"path": "index.html", "kind": "new", "add": 86, "rem": 0, "cut": 0, "text": "@@ -0,0 +1,12 @@\n+<!doctype html>\n+<html lang=\"pl\">\n+<head>\n+<meta charset=\"utf-8\">\n+<title>Ziarno: kawa, która ma czas</title>\n+<link rel=\"stylesheet\" href=\"style.css\">\n+</head>\n+<body>\n+<header class=\"hero\"><h1>Kawa, która ma czas.</h1>\n+<a class=\"btn\" href=\"#rezerwacja\">Zarezerwuj stolik</a></header>\n+<section id=\"menu\">...</section>\n+<section id=\"rezerwacja\">...</section>"},
        {"path": "style.css", "kind": "new", "add": 142, "rem": 0, "cut": 0, "text": "@@ -0,0 +1,8 @@\n+:root{--kawa:#5b3a29;--krem:#f6efe6}\n+body{margin:0;font:17px/1.6 Inter,sans-serif;background:var(--krem);color:#2a1d16}\n+.menu{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}\n+@media (max-width:600px){\n+  .menu{grid-template-columns:1fr}\n+  .btn{width:100%}\n+}"},
        {"path": "rezerwacja.js", "kind": "new", "add": 38, "rem": 0, "cut": 0, "text": "@@ -0,0 +1,6 @@\n+// rezerwacja stolika: sprawdza datę i liczbę osób\n+const form = document.querySelector('#rezerwacja form');\n+form.addEventListener('submit', e => {\n+  e.preventDefault();\n+  form.querySelector('.ok').hidden = false;\n+});"},
    ]
    plan = [{"text": x, "done": True} for x in (
        "Przeczytać menu i zdjęcia z folderu", "Zlecić hasło Pióru i ilustrację Palecie",
        "Zbudować stronę z menu, mapą i rezerwacją", "Sprawdzić widok na telefonie", "Pokazać stronę")]
    return {
        "running": False, "id": "20261116-184640", "status": "Cel osiągnięty.", "outcome": "done", "error": None,
        "started": t, "ended": t + 412_000, "round": 2, "rounds": rounds,
        "config": {"folder": FOLDER, "goal": "Zrób stronę kawiarni Ziarno: menu, godziny otwarcia, mapa dojazdu i rezerwacja stolika. Ma dobrze wyglądać na telefonie.",
                   "check": "", "rules": "", "mode": "full", "max_rounds": 30, "checkpoints": True, "agent": lider["id"], "role": "",
                   "model": lider["model"], "effort": "medium", "how": "niezależna ocena AI", "team": [], "files": []},
        "branch": None, "cost": 0.0, "notes": [], "changes": None, "diff": diff, "confirm": None,
        "live": {"n": 0, "steps": [], "say": ""}, "team": team1 + team2, "plan": plan, "asks": [], "servers": [],
        "undo": 0, "undone": False, "phase": "done", "talk": None, "question": None, "shots": [], "tkv": 2, "saved_ctx": 0, "thread": 1,
    }


def pioro_run(pioro):
    t = T0 - 3_600_000
    return {
        "running": False, "id": "20261116-174640", "status": "Cel osiągnięty.", "outcome": "done", "error": None,
        "started": t, "ended": t + 95_000, "round": 1,
        "rounds": [{"n": 1, "t": t + 500, "agent": "Trzy hasła na plakat w oknie kawiarni:\n\n1. **Kawa, która ma czas.**\n2. **Tu się nie spieszy. Tu się parzy.**\n3. **Espresso dla ludzi, którzy wiedzą.**\n\nZapisałem je w pliku hasla.md.",
                    "check": "Przechodzi: są trzy hasła, krótkie i bez długich myślników.", "passed": True, "seconds": 95, "cost": 0.0, "turns": None,
                    "tokens": 6120, "model": pioro["model"], "nudged": False,
                    "steps": [step("think", ""), step("read", "menu.txt"), step("edit", "hasla.md")], "team": []}],
        "config": {"folder": FOLDER, "goal": "Wymyśl trzy hasła na plakat w oknie kawiarni Ziarno.", "check": "", "rules": "", "mode": "full",
                   "max_rounds": 30, "checkpoints": True, "agent": pioro["id"], "role": "", "model": pioro["model"], "effort": "", "how": "niezależna ocena AI", "team": [], "files": []},
        "branch": None, "cost": 0.0, "notes": [], "changes": None,
        "diff": [{"path": "hasla.md", "kind": "new", "add": 3, "rem": 0, "cut": 0, "text": "@@ -0,0 +1,3 @@\n+1. Kawa, która ma czas.\n+2. Tu się nie spieszy. Tu się parzy.\n+3. Espresso dla ludzi, którzy wiedzą."}],
        "confirm": None, "live": {"n": 0, "steps": [], "say": ""}, "team": [], "plan": [], "asks": [], "servers": [], "undo": 0, "undone": False,
        "phase": "done", "talk": None, "question": None, "shots": [], "tkv": 2, "saved_ctx": 0, "thread": 1,
    }


def profil(agents):
    """Pokazowy Profil: rok aktywności z naturalnym rytmem, kilku dostawców, modele i tylko agenci z demo."""
    import datetime
    import random
    rnd = random.Random(1611)
    end = datetime.date(2026, 11, 16)
    cells, tokens, rounds, active = [], 0, 0, 0
    for i in range(365):
        d = end - datetime.timedelta(days=364 - i)
        ramp = 0.35 + 0.65 * (i / 364)                      # z czasem pracuje się więcej
        weekend = d.weekday() >= 5
        if rnd.random() < (0.55 if weekend else 0.12):
            t = r = 0
        else:
            t = int(rnd.lognormvariate(14.2, 0.9) * ramp * (0.45 if weekend else 1))
            r = max(1, int(t / 900_000 + rnd.random() * 4))
        cells.append({"d": d.isoformat(), "tokens": t, "rounds": r})
        tokens += t; rounds += r; active += 1 if t else 0
    best = max(cells, key=lambda c: c["tokens"])
    # serie: dni z rzędu z aktywnością
    run, best_run, best_range, start = 0, 0, ["", ""], None
    for c in cells:
        if c["tokens"]:
            run += 1; start = start or c["d"]
            if run > best_run: best_run, best_range = run, [start, c["d"]]
        else:
            run, start = 0, None
    now = 0
    for c in reversed(cells):
        if not c["tokens"]: break
        now += 1
    share = [("claude", .46), ("openai", .27), ("antigravity", .15), ("opencode", .08), ("ollama", .04)]
    providers = [{"id": p, "tokens": int(tokens * s), "rounds": int(rounds * s), "share": s} for p, s in share]
    models = [{"id": m, "tokens": int(tokens * s), "rounds": int(rounds * s)} for m, s in
              [("claude-sonnet-5-5", .29), ("claude-opus-5-5", .12), ("gpt-5.6-luna", .2), ("agy:gemini-4-hydrogen-medium", .1),
               ("claude-haiku-5-5", .07), ("gpt-6-luna", .07), ("agy:gemini-4-argon-medium", .05), ("oc:opencode/glm-5.3-flash-free", .06),
               ("ollama:qwen3-coder", .04)]]
    weights = {"Lider": .31, "Kreska": .22, "Pióro": .16, "Lupa": .13, "Radar": .1, "Paleta": .08}
    ags = [{"id": a["id"], "name": a["name"], "tokens": int(tokens * weights.get(a["name"], .05)), "rounds": int(rounds * weights.get(a["name"], .05))} for a in agents]
    ags.sort(key=lambda a: -a["tokens"])
    return {"cells": cells, "tokens": tokens, "rounds": rounds, "active": active,
            "record": {"d": best["d"], "tokens": best["tokens"]},
            "streak": {"now": now, "best": best_run, "range": best_range, "since": cells[-now]["d"] if now else end.isoformat()},
            "tasks": int(rounds / 2.3), "done": int(rounds / 2.3 * .83), "providers": providers, "models": models, "agents": ags}


def demo_app_models(source):
    """Lokalne demo zaczyna od modelu GPT, także w kreatorze agenta."""
    source = must_replace(
        source,
        "MODELS.models.find(x => x.id === value) || MODELS.models[0] || {name:'', provider:'claude'}",
        "MODELS.models.find(x => x.id === value) || MODELS.models.find(x => x.id === ((S && S.defaults && S.defaults.model) || 'gpt-5.6-luna')) || {id:'gpt-5.6-luna', name:'GPT-5.6 Luna', provider:'openai'}",
        "domyślny model w app.js",
    )
    return must_replace(
        source,
        "access:'ask', purpose:'', model:'', ...(preset",
        "access:'ask', purpose:'', model:(S && S.defaults && S.defaults.model) || 'gpt-5.6-luna', ...(preset",
        "model w kreatorze agenta w app.js",
    )


def main():
    # Najpierw sprawdzamy źródła i wersję, żeby błąd nie zostawił połowicznie zapisanego strona/app/.
    need = [APP / f for f in ("index.html", "app.js", "i18n.js", "style.css", "logo.png", "app.png", "claude.svg", "faces", "fonts")]
    lack = [str(x) for x in need if not x.exists()]
    if lack:
        sys.exit("Nie znalazłem plików aplikacji LumoBota:\n  " + "\n  ".join(lack) + "\nUstaw zmienną LUMOBOT_APP na folder site LumoBota.")
    wersja = wersja_lumo()
    OUT.mkdir(parents=True, exist_ok=True)
    for f in ("index.html", "app.js", "i18n.js", "style.css", "logo.png", "app.png", "claude.svg"):
        shutil.copy2(APP / f, OUT / f)
    app_js = OUT / "app.js"
    app_src = demo_app_models(app_js.read_text(encoding="utf-8"))
    # maski buziek z data: przy stronie otwartej z dysku (file://); window.LUMO_MASKS daje js/maski.js z zloz.py
    app_src = must_replace(app_src, "--m:url(faces/${sh}-mul.png)",
                           "--m:url(${(window.LUMO_MASKS && LUMO_MASKS[sh]) || 'faces/' + sh + '-mul.png'})", "maski buziek w app.js")
    app_js.write_text(app_src, encoding="utf-8", newline="\n")
    for d in ("faces", "fonts"):
        shutil.copytree(APP / d, OUT / d, dirs_exist_ok=True)

    agents = scrub(rec("agents.json"))
    by = {a["name"]: a for a in agents}
    for a in agents:
        a.update({"folder": FOLDER, "project": FOLDER, "session": None, "ctx": 18000, "ctx_parts": {}, "photo": "", "pack": "p1"})
        a["purpose"] = ROLES.get(a["name"], a.get("purpose", ""))
        if a["name"] in AGENT_MODELS:
            a["model"] = AGENT_MODELS[a["name"]]
        if a["name"] in AGENT_EFFORT:
            a["effort"] = AGENT_EFFORT[a["name"]]
    lider, pioro, kreska, lupa, radar, paleta = (by[n] for n in ("Lider", "Pióro", "Kreska", "Lupa", "Radar", "Paleta"))
    cafe = cafe_run(lider, pioro, paleta, lupa)

    threads = {a["id"]: [] for a in agents}  # decyzja użytkownika: czaty puste na start
    idle = {"running": False, "id": None, "status": "", "outcome": None, "error": None, "started": None, "ended": None, "round": 0, "rounds": [],
            "config": {"folder": FOLDER, "goal": "", "check": "", "mode": "full", "max_rounds": 30, "agent": lider["id"], "model": lider["model"], "team": [], "files": []},
            "branch": None, "cost": 0, "notes": [], "changes": None, "diff": [], "confirm": None, "live": {"n": 0, "steps": [], "say": ""}, "team": [], "plan": [],
            "asks": [], "servers": [], "undo": 0, "undone": False, "phase": "", "talk": None, "question": None, "shots": [], "history": []}

    settings = scrub(rec("settings.json"))
    settings["model"] = lider["model"]
    settings["rules"] = ""
    # Demo nie uruchamia CLI i nie udaje lokalnej instalacji któregoś dostawcy.
    settings["agent"] = {"path": "", "version": "", "data": ""}
    teamconfig = scrub(rec("teamconfig.json"))
    teamconfig["leader"] = lider["id"]
    queue = scrub(rec("queue.json"))
    packs = {"items": [{"id": "p1", "name": "Mój projekt", "count": len(agents)}], "current": "p1",
             "everyone": [{k: a.get(k) for k in ("id", "name", "color", "face", "shape", "model", "pack")} for a in agents]}

    def item(a, goal, mins_ago, rounds, files, add):
        return {"id": f"r{mins_ago}", "agent": a["id"], "name": a["name"], "goal": goal, "group": "done", "outcome": "done", "rounds": rounds,
                "seconds": rounds * 180, "ended": T0 - mins_ago * 60_000, "files": files, "add": add, "rem": 0, "asks": [], "accepted": True}
    inbox_items = [item(lider, cafe["config"]["goal"], -7, 2, 3, 266), item(pioro, "Wymyśl trzy hasła na plakat w oknie kawiarni Ziarno.", 60, 1, 1, 3),
                   item(kreska, "Dodaj ciemny motyw do strony kawiarni.", 180, 1, 2, 41), item(lupa, "Sprawdź, czy formularz rezerwacji działa na iPhonie.", 240, 1, 0, 0)]
    report = scrub(rec("report.json"))
    report.update({"items": [], "counts": {"failed": 0, "ask": 0, "running": 0, "stopped": 0, "done": len(inbox_items), "questions": 0}, "new": False})
    neuro = scrub(rec("neuro.json"))
    neuro["file"] = "C:\\Users\\ty\\.lumobot\\neuro.bin"

    data = {
        "agents": agents, "threads": threads, "super": {**idle, "defaults": {k: settings.get(k) for k in ("saver", "computer", "rules", "mode", "max_rounds", "checkpoints", "model", "theme", "notify")},
                                                         "queue": 0, "queue_paused": False, "report_new": False, "agent": True, "chat_seen": {}},
        "models": scrub(rec("models.json")), "settings": settings, "teamconfig": teamconfig, "queue": queue,
        "plugins": {**scrub(rec("plugins.json")), "tools": []}, "inbox": {"items": [], "queue": [], "attention": 0}, "report": report, "drafts": {},
        "update": {"version": wersja, "build": "", "source": "", "behind": 0, "notes": [], "checked": T0, "error": None},
        "servers": [], "packs": packs, "teamfeed": {"events": [], "running": False, "lead": lider["id"], "run": cafe["id"]},
        "schedule": scrub(rec("schedule.json")), "neuro": neuro, "voice_status": scrub(rec("voice_status.json")), "profile": profil(agents),
        "usage": scrub(rec("usage.json")), "orders": {"items": []}, "templates": scrub(rec("templates.json")),
    }
    blob = json.dumps(data, ensure_ascii=False)
    check_private(blob)
    (OUT / "dane.js").write_text("window.LUMO_DANE = " + blob + ";\n", encoding="utf-8", newline="\n")

    prefs = {"lumobot-theme": "dark", "lumobot-lang": "pl", "lumobot-agent": lider["id"], "lumobot-island": "0", "lumobot-usep": "openai",
             "lumobot-colors": "[\"#493093\",\"#3a6bfc\",\"#d6409f\",\"#0a703f\",\"#bd1922\",\"#12a594\"]"}
    (OUT / "prefs.js").write_text("(function(){var P=" + json.dumps(prefs, ensure_ascii=False) + ";window.LUMOPREFS=P;try{for(var k in P)localStorage.setItem(k,P[k]);}catch(e){}})();\n",
                                  encoding="utf-8", newline="\n")

    html = (OUT / "index.html").read_text(encoding="utf-8")
    html = re.sub(r'<script\b[^>]*\bsrc=["\x27]setup\.js(?:\?[^"\x27]*)?["\x27][^>]*>\s*</script>', '', html)  # setup.js bywa nieobecny
    loader = '<script>if(location.protocol==="file:")document.write(\'<script src="../js/maski.js"><\\/script>\')</script>'
    html = must_replace(html, '<script src="prefs.js"></script>', loader + '\n<script src="prefs.js"></script>\n<script src="dane.js"></script>\n<script src="mock.js"></script>', "wpięcie dane.js i mock.js w index.html", 1)
    if 'data-theme="dark"' not in html:
        html = must_replace(html, 'data-theme="light"', 'data-theme="dark"', "ciemny motyw w index.html", 1)
    html = must_sub(r'<div id="splash"[\s\S]*?</div></div>\s*<script>if\(/\[\?&\]\(demo\|nosplash\)=/[\s\S]*?</script>', '', html, "ekran ładowania w index.html")  # bez animacji ładowania
    (OUT / "index.html").write_text(html, encoding="utf-8", newline="\n")
    print("zapisano", OUT, "dane.js:", len(blob))
    faces_js(agents)


def faces_js(agents):
    """strona/js/agenci.js: dane agentów i oryginalna funkcja face() z app.js, żeby strona rysowała te same buźki."""
    js = (APP / "app.js").read_text(encoding="utf-8")
    consts = re.search(r"const SHAPES = [^;]+;", js).group(0) + "\n" + re.search(r"const FACES = [^;]+;", js).group(0)
    start = js.index("function face(")
    end = js.index("\n", js.index("</i></i></span>`; }", start)) + 1
    fn = js[start:end].replace("url(faces/", "url(${FACEDIR}")
    fn = must_replace(fn, "--m:url(${FACEDIR}${sh}-mul.png)",
                      "--m:url(${(window.LUMO_MASKS && LUMO_MASKS[sh]) || FACEDIR + sh + '-mul.png'})", "maski buziek w agenci.js")
    small = [{k: a.get(k) for k in ("id", "name", "color", "face", "shape", "model", "kind")} for a in agents]
    out = ("/* Wygenerowane przez narzedzia/zbuduj_app.py z app.js LumoBota. Nie edytuj ręcznie. */\n(function(){\n"
           "const FACEDIR = 'app/faces/';\n" + consts + "\n" + fn +
           "window.LUMO_AGENCI = " + json.dumps(small, ensure_ascii=False) + ";\n"
           "window.lumoFace = face; window.LUMO_SHAPES = SHAPES; window.LUMO_EYES = FACES; window.LUMO_FACEDIR = FACEDIR;\n"
           "function fill(root){ (root || document).querySelectorAll('[data-face]').forEach(el => { const a = LUMO_AGENCI.find(x => x.name === el.dataset.face);"
           " if(a && !el.firstElementChild) el.innerHTML = face(a, +(el.dataset.px || 40)); }); }\n"
           "window.lumoFaces = fill; if(document.readyState !== 'loading') fill(); else document.addEventListener('DOMContentLoaded', () => fill());\n})();\n")
    (ROOT / "strona" / "js" / "agenci.js").write_text(out, encoding="utf-8", newline="\n")
    print("zapisano strona/js/agenci.js")


if __name__ == "__main__":
    main()
