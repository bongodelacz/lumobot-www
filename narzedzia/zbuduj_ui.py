"""Buduje strona/ui/app.html: wierną kopię okna LumoBota z przykładową rozmową.

Bierze wyrenderowany DOM z działającej aplikacji (http://127.0.0.1:8770, Edge bez głowy),
oryginalny style.css, logo, buźki i fonty z folderu aplikacji, wycina pasek, panel boczny,
nagłówek agenta i pole pisania, a w miejsce prawdziwej rozmowy wstawia przykładową,
zbudowaną z tych samych klas co app.js.

Uruchom:  python narzedzia/zbuduj_ui.py   (LumoBot musi być włączony)
"""
import os
import html
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from wytnij import by  # noqa: E402

APP = Path(os.environ.get("LUMOBOT_SITE") or Path.home() / "Desktop" / "Neuro AI" / "lumobot" / "site")      # okno LumoBota z repo aplikacji
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "strona" / "ui"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
DUMP = Path(os.environ["TEMP"]) / "lumo-dump"


def dump() -> str:
    DUMP.mkdir(exist_ok=True)
    res = subprocess.run([EDGE, "--headless=new", "--disable-gpu", f"--user-data-dir={DUMP / 'prof'}", "--window-size=1344,880",
                          "--virtual-time-budget=6000", "--dump-dom", "http://127.0.0.1:8770/?nosplash=1&theme=dark&lang=pl"],
                         capture_output=True, timeout=120)
    html = res.stdout.decode("utf-8", "replace")
    if 'id="agents"' not in html:
        sys.exit("Nie udało się pobrać okna LumoBota. Włącz LumoBota i spróbuj jeszcze raz.")
    return html


def js_const(js: str, name: str) -> str:
    return re.search(r"(?:const |, )" + name + r" = '([^']*)'", js).group(1)


def demo_models(page: str, hidden: bool = True) -> str:
    """Przypina pokazowy wybór GPT, także w kopiach menu zapisanych w data-h.

    Katalog innych modeli pozostaje dostępny i nie jest przypisaniem agenta.
    """
    if hidden:
        page = re.sub(r'data-h="([^"]*)"', lambda m: 'data-h="' + html.escape(
            demo_models(html.unescape(m.group(1)), hidden=False), quote=True) + '"', page)

    icon = re.search(r'<button\b[^>]*(?:data-up|data-pp)="openai"[^>]*>\s*(<svg\b[\s\S]*?</svg>)', page)
    openai_icon = icon.group(1) if icon else ''
    image_icon = re.search(r'<button\b[^>]*(?:data-up|data-pp)="antigravity"[^>]*>\s*(<svg\b[\s\S]*?</svg>)', page)
    if openai_icon:
        badge = re.sub(r'width="\d+"|height="\d+"', lambda m: m.group(0).split('=')[0] + '="12"', openai_icon)
        page = re.sub(r'(<i class="ai">)<svg\b[\s\S]*?</svg>(</i>)', lambda m: m.group(1) + badge + m.group(2), page)
    if image_icon:
        badge = re.sub(r'width="\d+"|height="\d+"', lambda m: m.group(0).split('=')[0] + '="12"', image_icon.group(1))
        page = re.sub(r'(title="Paleta"[\s\S]*?<i class="ai">)<svg\b[\s\S]*?</svg>(</i>)', lambda m: m.group(1) + badge + m.group(2), page, count=1)
    page = re.sub(r'(<div class="who">)Claude(<small>)[^<]*(</small>)',
                  r'\1ChatGPT\2przykładowe dane\3', page)

    def choice(m: re.Match) -> str:
        tag = m.group(0)
        key = re.search(r'data-(up|pp|m)="([^"]*)"', tag)
        if not key:
            return tag
        cls = re.search(r'class="([^"]*)"', tag)
        tokens = cls.group(1).split() if cls else []
        tokens = [t for t in tokens if t != 'on']
        selected = key.group(2) == ('gpt-5.6-luna' if key.group(1) == 'm' else 'openai')
        if selected:
            tokens.append('on')
        value = 'class="' + ' '.join(tokens) + '"'
        return tag[:cls.start()] + value + tag[cls.end():] if cls else tag[:-1] + ' ' + value + '>'

    page = re.sub(r'<button\b[^>]*>', choice, page)

    def picker(m: re.Match) -> str:
        body = m.group(2)
        if openai_icon:
            body = re.sub(r'<svg\b[\s\S]*?</svg>', lambda _: openai_icon, body, count=1)
        body = re.sub(r'<span>[^<]*</span>', '<span>GPT-5.6 Luna · Średnia</span>', body, count=1)
        return m.group(1) + body + m.group(3)

    page = re.sub(r'(<div\b[^>]*id="modelPick"[^>]*><button\b[^>]*>)([\s\S]*?)(</button>)', picker, page)
    if 'class="mplist"' in page and 'data-m="gpt-5.6-luna"' not in page:
        row = ('<button type="button" class="mprow on" data-m="gpt-5.6-luna">'
               '<span class="mpn">GPT-5.6 Luna</span><svg viewBox="0 0 16 16" width="14" height="14">'
               '<path d="M3.5 8.4l3 3 6-6.6" fill="none" stroke="currentColor" '
               'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>')
        page = page.replace('<div class="mplist">', '<div class="mplist">' + row)
    page = re.sub(r'(runda \d+ · [^<]*? · )Sonnet 5\.5', r'\1GPT-5.6 Luna', page)
    return page


def main() -> None:
    h = dump()
    js = (APP / "app.js").read_text(encoding="utf-8")
    OKI, NOI, CHEV = js_const(js, "OKI"), js_const(js, "NOI"), js_const(js, "CHEV")
    FOLDER = '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M1.800 4.200a1 1 0 0 1 1-1h3.100l1.400 1.500h5.900a1 1 0 0 1 1 1v6.100a1 1 0 0 1-1 1H2.800a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.300" stroke-linejoin="round"></path></svg>'

    # --- pliki aplikacji 1:1
    OUT.mkdir(parents=True, exist_ok=True)
    for f in ("style.css", "logo.png", "app.png"):
        shutil.copy2(APP / f, OUT / f)
    for d in ("faces", "fonts"):
        shutil.copytree(APP / d, OUT / d, dirs_exist_ok=True)

    bar = by(h, 'class="bar"').replace('id="winBtns" hidden=""', 'id="winBtns"')
    side = by(h, 'class="side"')
    head = by(h, 'id="agentHead"')
    comp = by(h, 'id="composer"').replace('id="composer" hidden=""', 'id="composer"')

    # buźki agentów z panelu bocznego
    def face(name: str, px: int) -> str:
        row = re.search(r'<div class="agent[^"]*" data-id="[^"]+" title="' + re.escape(name) + r'"', side)
        f = by(side[row.start():], 'class="face ')
        return re.sub(r"width:\d+px;height:\d+px", f"width:{px}px;height:{px}px", f).replace(" busy", "")

    # krótkie opisy w panelu bocznym zamiast pełnych ról
    status = {
        "Lider": "Cel osiągnięty · 6 min",
        "Pióro": "Pisze teksty i hasła",
        "Kreska": "Buduje strony",
        "Lupa": "Testuje i szuka usterek",
        "Paleta": "Rysuje ikony i grafiki",
        "Radar": "Śledzi konkurencję",
    }
    for name, text in status.items():
        side = re.sub(r'(title="' + re.escape(name) + r'"[\s\S]*?<small>)[\s\S]*?(</small>)', r"\g<1>" + text + r"\g<2>", side, count=1)
    side = re.sub(r'(<div class="agent teamrow"[\s\S]*?<small>)[\s\S]*?(</small>)', r'\g<1><span class="working"><i></i><i></i><i></i><span>Pracują: 1</span></span>\g<2>', side, count=1)
    side = re.sub(r'(title="Lider"[^>]*>[\s\S]*?<span class="face[^"]*?) busy', r"\1", side, count=1)
    head = head.replace(" busy", "")

    # pole pisania: przykładowy folder zamiast prawdziwego
    comp = re.sub(r"C:\\Users\\[^<\"]+", r"C:\\Users\\ty\\Projekty\\kawiarnia-ziarno", comp)
    comp = re.sub(r'(<span id="folderName">)[^<]*', r"\1kawiarnia-ziarno", comp)
    comp = re.sub(r'(<div class="dd up" id="modelPick"><button type="button" class="ddbtn">[\s\S]*?<span>)[^<]*', r"\1GPT-5.6 Luna · Średnia", comp, count=1)
    comp = re.sub(r'(class="ctxbtn)( empty)?(" id="ctxBtn" title=")[^"]*("><svg[\s\S]*?</svg><span>)[^<]*', r"\1\3Kontekst: 38 tys. z 200 tys. tokenów\g<4>19%", comp, count=1)

    L, P, K, Lu, Pa = (face(n, 32) for n in ("Lider", "Pióro", "Kreska", "Lupa", "Paleta"))
    s28 = lambda n: face(n, 28)  # noqa: E731

    def crewrow(name: str, file: str, secs: str, task: str) -> str:
        return (f'<div class="crewrow done">{s28(name)}<div class="crewmain"><button type="button" class="crewtop"><b>{name}</b>'
                f'{f"<code>{file}</code>" if file else ""}<span class="crewstate">gotowe · {secs}</span>{CHEV}</button>'
                f'<p class="crewtask">{task}</p></div></div>')

    def steps(n: int, cmds: int, files: int) -> str:
        return (f'<div class="stepsbox"><button type="button" class="stepsum">{CHEV}<span>{n} kroków</span>'
                f'<i>polecenia: {cmds}</i><i>zmienione pliki: {files}</i></button></div>')

    plan = [
        "Zebrać treści: menu, godziny, adres",
        "Zlecić teksty Pióru i zdjęcia Palecie",
        "Zbudować stronę z rezerwacją stolika",
        "Sprawdzić widok na telefonie",
        "Pokazać stronę i zapisać ustalenia",
    ]
    plan_html = ('<div class="plancard"><div class="planhead"><b>Plan</b><span>5 / 5</span><u><i style="width:100%"></i></u></div>'
                 + "".join(f'<div class="planstep done"><i>{OKI}</i><span>{p}</span></div>' for p in plan) + "</div>")

    chat = f"""<div class="sep"><span>Dziś 14:05</span></div>
<div class="msg me"><div class="bubble">Zrób stronę kawiarni Ziarno: menu, godziny otwarcia, mapa dojazdu i rezerwacja stolika. Ma dobrze wyglądać na telefonie.</div><div class="where">{FOLDER}kawiarnia-ziarno</div></div>
{plan_html}
<div class="msg ai">{L}<div><div class="who"><b>Lider</b><span>runda 1 · 3 min 48 s · GPT-5.6 Luna</span></div>{steps(16, 5, 4)}
<div class="say"><p>Strona stoi: menu z cenami, godziny, mapa i formularz rezerwacji. Teksty napisał Pióro, zdjęcia kawy przygotowała Paleta.</p></div>
<div class="crewbox"><div class="crewhead"><b>Zespół</b><span>wszyscy skończyli</span><span>gotowe: 2 / 2</span></div>
{crewrow("Pióro", "teksty.md", "52 s", "Napisz hasło, opis kawiarni i nazwy pozycji w menu. Ciepło i krótko.")}
{crewrow("Paleta", "kawa.png", "1 min 06 s", "Narysuj ilustrację filiżanki na górę strony, 1200x600, ciepłe kolory.")}
</div>
<div class="verdict">{NOI}Sprawdzenie nie przeszło, agent pracuje dalej<button type="button">Szczegóły</button></div></div></div>
<div class="msg ai">{L}<div><div class="who"><b>Lider</b><span>runda 2 · 2 min 52 s · GPT-5.6 Luna</span></div>{steps(9, 3, 2)}
<div class="say"><p>Sprawdzający zauważył, że na telefonie menu wychodzi poza ekran. Poprawiłem siatkę i przycisk rezerwacji. Lupa przeklikała całą stronę na 390 px: bez błędów.</p></div>
<div class="crewbox"><div class="crewhead"><b>Zespół</b><span>wszyscy skończyli</span><span>gotowe: 1 / 1</span></div>
{crewrow("Lupa", "", "41 s", "Przeklikaj stronę na telefonie i komputerze. Zgłoś każdą usterkę.")}
</div>
<div class="verdict ok">{OKI}Sprawdzenie przeszło<button type="button">Szczegóły</button></div></div></div>
<div class="result done"><div class="rline"><span class="ric">{OKI}</span><b>Cel osiągnięty</b><em>2 rundy · 6 min 40 s</em></div></div>"""

    extra = """<style>
html,body{overflow:hidden}
#chat{scroll-behavior:auto}
.stepsum,.crewtop,.verdict button,.ddbtn{cursor:default}
</style>"""
    dots = """<script>
/* Kropki w tle rozmowy: ten sam rysunek co w aplikacji (dotsFor w app.js), bez danych z serwera. */
(function(){
  const cv = document.getElementById('dots'), g = cv.getContext('2d'), GAP = 22, host = document.getElementById('tab-agent');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const b = (css('--dot') || '118,118,128').split(','), x2 = (css('--dotx') || '120,156,255').split(',');
  let w = 0, h = 0, mx = -999, my = -999, last = 0;
  function size(){ const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; w = r.width; h = r.height; cv.width = Math.round(w*d); cv.height = Math.round(h*d); g.setTransform(d,0,0,d,0,0); }
  function frame(now){
    if(now - last > 32){ last = now; const t = now/1000, sp = .5; g.clearRect(0,0,w,h);
      for(let y = GAP/2; y < h; y += GAP) for(let x = GAP/2; x < w; x += GAP){
        const wave = Math.sin(x*.012 + y*.02 - t*sp) * Math.sin(y*.014 - x*.006 + t*sp*.6), dx = x - mx, dy = y - my, near = Math.exp(-(dx*dx + dy*dy)/9000);
        const a = .2 + Math.max(0, wave)*.4 + near*.6, k = Math.min(1, near*.7);
        g.fillStyle = `rgba(${Math.round(+b[0] + (x2[0]-b[0])*k)},${Math.round(+b[1] + (x2[1]-b[1])*k)},${Math.round(+b[2] + (x2[2]-b[2])*k)},${Math.min(1,a).toFixed(3)})`;
        const r = 1.3 + near*.7; g.fillRect(x - r/2, y - r/2, r, r); } }
    if(!still) requestAnimationFrame(frame);
  }
  new ResizeObserver(size).observe(cv);
  host.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  host.addEventListener('mouseleave', () => { mx = my = -999; });
  size(); requestAnimationFrame(frame);
  const chat = document.getElementById('chat'); chat.scrollTop = chat.scrollHeight;
  addEventListener('resize', () => chat.scrollTop = chat.scrollHeight);
})();
</script>"""

    page = f"""<!doctype html>
<html lang="pl" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1344">
<title>LumoBot</title>
<link rel="stylesheet" href="style.css">
{extra}
</head>
<body data-tab="agent">
{bar}
<div class="shell">
  {side}
  <main class="main">
    <section class="view chatview" id="tab-agent">
      <canvas id="dots" aria-hidden="true"></canvas>
      {head}
      <div class="chat" id="chat" style="--ac:#493093">{chat}</div>
      {comp}
    </section>
  </main>
</div>
{dots}
</body>
</html>
"""
    (OUT / "app.html").write_text(demo_models(page), encoding="utf-8", newline="\n")
    print("zapisano", OUT / "app.html", len(page))
    faces_for_site(side)


def faces_for_site(side: str) -> None:
    """Buźki agentów na stronie głównej: oryginalne reguły .face z style.css i znaczniki z aplikacji."""
    css = (APP / "style.css").read_text(encoding="utf-8")
    rules = []
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        sel = m.group(1).strip()
        if sel.startswith("@") or "/*" in sel:
            sel = sel.split("*/")[-1].strip()
        if re.match(r"^(\.face|\.fcol|\.fmul|\.fadd|:is\(\.agent,\.tpl,\.teamrow\):hover \.face)", sel) and "@" not in sel:
            rules.append(f"{sel}{{{m.group(2)}}}")
    names = set(re.findall(r"animation(?:-name)?:\s*([\w-]+)", "\n".join(rules)))
    names |= set(re.findall(r",\s*([a-z][\w-]+) [\d.]+s", "\n".join(rules)))
    frames = [m.group(0) for m in re.finditer(r"@keyframes\s+([\w-]+)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", css) if m.group(1) in names]
    root = "".join(re.findall(r"--(?:spring|ease):[^;]+;", css)[:2])
    out = (f"/* Wygenerowane z style.css LumoBota przez narzedzia/zbuduj_ui.py. Nie edytuj ręcznie. */\n:root{{{root}}}\n"
           + "\n".join(rules) + "\n" + "\n".join(frames) + "\n")
    (ROOT / "strona" / "faces.css").write_text(out, encoding="utf-8", newline="\n")

    idx = ROOT / "strona" / "index.html"
    if not idx.exists():
        return
    page = idx.read_text(encoding="utf-8")

    def repl(m: re.Match) -> str:
        name, px = m.group(1), int(m.group(2))
        row = re.search(r'<div class="agent[^"]*" data-id="[^"]+" title="' + re.escape(name) + r'"', side)
        if not row:
            return m.group(0)
        f = by(side[row.start():], 'class="face ')
        f = re.sub(r"width:\d+px;height:\d+px", f"width:{px}px;height:{px}px", f).replace(" busy", "")
        f = f.replace("url(faces/", "url(ui/faces/")
        return f'<span data-face="{name}" data-px="{px}">{f}</span><!--/face-->'

    page = re.sub(r'<span data-face="([^"]+)" data-px="(\d+)">[\s\S]*?</span><!--/face-->', repl, page)
    idx.write_text(page, encoding="utf-8", newline="\n")
    print("buźki wstawione do", idx)


if __name__ == "__main__":
    main()
