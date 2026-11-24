"""Wstawia pytania z tresci/pytania-v14.md do stron (główna, /pytania/, /porownanie/, 6 stron vs).
Format pliku: ## klucz (vs-openbot, porownanie, glowna, strona-pytania), linia "Lead: ...",
#### Nazwa grupy (tylko strona-pytania), ### pytanie, pod spodem akapity odpowiedzi.
Uruchom: python narzedzia/wstaw_pytania.py [plik.md]"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CZ = ROOT / "strona" / "czesci"
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tresci" / "pytania-v14.md"
CHEV = ('<span class="fq-chev" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" '
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>')
FILES = {"glowna": "pytania.html", "strona-pytania": "strona-pytania.html", "porownanie": "strona-porownanie.html",
         "wtyczki": "strona-wtyczki.html"}


def esc(s):
    s = html.escape(s.strip(), quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"\1", s)


def parse(text):
    data, cur, grp, q = {}, None, None, None
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("## "):
            cur = s[3:].strip().lower()
            data[cur] = {"lead": None, "groups": [[None, []]]}
            grp, q = data[cur]["groups"][0], None
        elif cur is None:
            continue
        elif s.lower().startswith("lead:"):
            data[cur]["lead"] = s[5:].strip()
        elif s.startswith("#### "):
            grp = [s[5:].strip(), []]
            data[cur]["groups"].append(grp)
            q = None
        elif s.startswith("### "):
            q = [s[4:].strip(), []]
            grp[1].append(q)
        elif s and q is not None and not s.startswith("#"):
            q[1].append(s)
    for d in data.values():
        d["groups"] = [g for g in d["groups"] if g[1]]
    return data


def items(qs, indent="      "):
    out = []
    for q, ans in qs:
        paras = "".join(f"<p>{esc(a)}</p>" for a in ans)
        out.append(f'{indent}<details class="fq-item">\n{indent}  <summary class="fq-q"><span>{esc(q)}</span>{CHEV}</summary>\n'
                   f'{indent}  <div class="fq-a">{paras}</div>\n{indent}</details>')
    return "\n".join(out)


def replace_list(page, start, qs):
    """Podmienia zawartość pierwszego <div class="fq-list"> od pozycji start."""
    i = page.index('<div class="fq-list">', start) + len('<div class="fq-list">')
    depth, j = 1, i
    for m in re.finditer(r"<div\b|</div>", page[i:]):
        depth += 1 if m.group(0) == "<div" else -1
        if depth == 0:
            j = i + m.start()
            break
    line_start = page.rfind("\n", 0, j) + 1
    indent = re.match(r"\s*", page[line_start:j]).group(0)
    return page[:i] + "\n" + items(qs, indent + "  ") + "\n" + indent + page[j:]


def set_lead(page, start, lead):
    if not lead:
        return page
    m = re.compile(r'(<p class="fq-lead">)(.*?)(</p>)', re.S).search(page, start)
    return page[:m.start(2)] + esc(lead) + page[m.end(2):] if m else page


def main():
    data = parse(SRC.read_text(encoding="utf-8"))
    done = []
    for key, d in data.items():
        fname = FILES.get(key) or (f"strona-{key}.html" if key.startswith("vs-") else None)
        if not fname or not (CZ / fname).exists():
            print("pomijam:", key)
            continue
        f = CZ / fname
        page = f.read_text(encoding="utf-8")
        if key == "strona-pytania":
            for name, qs in d["groups"]:
                m = re.search(r'<h2 class="fq-group-h">' + re.escape(html.escape(name or "", quote=False)) + "</h2>", page)
                if not m:
                    print("brak grupy:", name)
                    continue
                page = replace_list(page, m.end(), qs)
        else:
            qs = [q for g in d["groups"] for q in g[1]]
            start = page.find('class="vs-faq') if key != "glowna" else 0
            if start < 0:
                print("brak sekcji pytań:", fname)
                continue
            page = set_lead(page, start, d["lead"])
            page = replace_list(page, start, qs)
        f.write_text(page, encoding="utf-8", newline="\n")
        done.append(f"{fname}:{sum(len(g[1]) for g in d['groups'])}")
    print("wstawiono:", ", ".join(done))


if __name__ == "__main__":
    main()
