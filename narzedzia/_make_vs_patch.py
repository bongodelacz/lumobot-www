import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
TABLE = (ROOT / 'tresci' / 'tabela-v9.md').read_text(encoding='utf-8')
VS = (ROOT / 'tresci' / 'vs-v8.md').read_text(encoding='utf-8')
PAGES = {
    'vs-openbot': ('strona/czesci/strona-vs-openbot.html', 'openbot.svg', '#2dd4bf', '#cffafe'),
    'vs-grok-bot': ('strona/czesci/strona-vs-grok-bot.html', 'grok.svg', '#f472b6', '#fce7f3'),
    'vs-claude-cowork': ('strona/czesci/strona-vs-claude-cowork.html', 'claude.svg', '#34d399', '#ecfccb'),
    'vs-manus': ('strona/czesci/strona-vs-manus.html', 'manus.svg', '#fb923c', '#ffedd5'),
    'vs-openclaw': ('strona/czesci/strona-vs-openclaw.html', 'openclaw.svg', '#60a5fa', '#dbeafe'),
    'vs-devin': ('strona/czesci/strona-vs-devin.html', 'devin.svg', '#a78bfa', '#ede9fe'),
}

def esc(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def esc_re(s):
    return re.escape(s)

def status(s):
    m = re.match(r'^(Tak|Częściowo|Nie|Brak danych):\s*', s, re.I)
    if not m:
        return 'part', '◐', 'Częściowo', s
    value = m.group(1).lower()
    if value == 'tak':
        return 'yes', '✓', 'Tak', s[m.end():]
    if value == 'nie':
        return 'no', '✕', 'Nie', s[m.end():]
    return 'part', '◐', 'Częściowo', s[m.end():]

def section_for(slug):
    m = re.search(r'### TEKSTY: [^\n]+ \(strona ' + esc_re(slug) + r'\)\n(.*?)(?=\n### TEKSTY:|\Z)', TABLE, re.S)
    if not m:
        raise RuntimeError('missing table section: ' + slug)
    return m.group(1)

def vs_text_for(rival):
    m = re.search(r'## \d+\. LumoBot vs ' + esc_re(rival) + r'\n(.*?)(?=\n---|\n## |\Z)', VS, re.S)
    if not m:
        raise RuntimeError('missing vs text: ' + rival)
    block = m.group(1)
    get = lambda label: re.search(r'\*\*' + label + r':\*\*\s*(.+)', block).group(1).strip()
    return get('Nagłówek'), get('Podtytuł'), get('Lead')

def table_html(slug, icon):
    sec = section_for(slug)
    title = re.search(r'\*\*Tytuł tabeli:\*\*\s*(.+)', sec).group(1).strip()
    summary = re.search(r'\*\*Podsumowanie:\*\*\s*(.+)', sec).group(1).strip()
    encouragement = re.search(r'\*\*Zachęta pod tabelą:\*\*\s*(.+)', sec).group(1).strip()
    rival = re.search(r'\| Kryterium \| LumoBot \| ([^|]+) \|', sec).group(1).strip()
    count = int(re.search(r'LumoBot lepszy w (\d+) z 16', summary).group(1))
    draws = int(re.search(r'remis w (\d+)', summary).group(1))
    rival_wins = int(re.search(re.escape(rival) + r' lepszy w (\d+)', summary).group(1))
    pct = ('%.2f' % (count / 16 * 100)).rstrip('0').rstrip('.')
    groups = []
    for gm in re.finditer(r'\*\*Grupa \d+: ([^*]+)\*\*\n\n(.*?)(?=\n\*\*Grupa \d+:|\n\*\*Podsumowanie:)', sec, re.S):
        name, body = gm.group(1).strip(), gm.group(2)
        rows = []
        for line in body.splitlines():
            if not line.startswith('|') or line.startswith('|---') or re.match(r'^\|\s*Kryterium\s*\|', line):
                continue
            bits = [x.strip() for x in line.split('|')[1:-1]]
            if len(bits) == 4:
                rows.append(bits)
        lumo_wins = sum(1 for r in rows if r[3].lower() == 'lumobot')
        rival_wins_group = sum(1 for r in rows if r[3].lower() not in ('lumobot', 'remis'))
        label = 'Przewaga LumoBota' if lumo_wins > rival_wins_group else ('Przewaga ' + rival if rival_wins_group > lumo_wins else 'Remis')
        verdict = re.search(r'\*\*Werdykt grupy:\*\*\s*(.+)', body).group(1).strip()
        row_html = []
        for crit, lumo, other, _point in rows:
            lm_cls, lm, lm_aria, lm_text = status(lumo)
            rm_cls, rm, rm_aria, rm_text = status(other)
            row_html.append(
                f'\n            <div class="vs-cmp-row" role="row">\n'
                f'              <div class="vs-cmp-crit" role="rowheader">{esc(crit)}</div>\n'
                f'              <div class="vs-cmp-cell vs-cmp-cell--lumo" role="cell" data-who="LumoBot">\n'
                f'                <span class="vs-mark vs-mark--{lm_cls}" aria-label="{lm_aria}">{lm}</span>\n'
                f'                <span class="vs-cmp-val">{esc(lm_text).replace("0 zł", "0&nbsp;zł")}</span>\n'
                f'              </div>\n'
                f'              <div class="vs-cmp-cell" role="cell" data-who="{esc(rival)}">\n'
                f'                <span class="vs-mark vs-mark--{rm_cls}" aria-label="{rm_aria}">{rm}</span>\n'
                f'                <span class="vs-cmp-val">{esc(rm_text).replace("0 zł", "0&nbsp;zł")}</span>\n'
                f'              </div>\n'
                f'            </div>'
            )
        groups.append(
            f'\n          <div class="vs-cmp-group" role="rowgroup">\n'
            f'            <div class="vs-cmp-group-head">\n'
            f'              <span class="vs-cmp-group-title">{esc(name)}</span>\n'
            f'              <span class="vs-cmp-group-verdict">{esc(label)}</span>\n'
            f'              <p class="vs-cmp-group-verdict-copy">{esc(verdict).replace("0 zł", "0&nbsp;zł")}</p>\n'
            f'            </div>{"".join(row_html)}\n'
            f'          </div>'
        )
    return (
        f'    <section class="vs-tab" aria-labelledby="vs-cmp-heading">\n'
        f'      <h2 id="vs-cmp-heading" class="title">{esc(title)}</h2>\n'
        f'      <div class="vs-cmp">\n'
        f'        <div class="vs-cmp-summary">\n'
        f'          <div>\n'
        f'            <p class="vs-cmp-score">LumoBot lepszy w {count} z 16</p>\n'
        f'            <p class="vs-cmp-sub">remis w {draws}, {esc(rival)} lepszy w {rival_wins}</p>\n'
        f'          </div>\n'
        f'          <div class="vs-cmp-meter" aria-hidden="true">\n'
        f'            <div class="vs-cmp-bar"><span style="width:{pct}%"></span></div>\n'
        f'            <p class="vs-cmp-pct">{count} / 16 kryteriów</p>\n'
        f'          </div>\n'
        f'        </div>\n\n'
        f'        <div class="vs-cmp-box" role="table" aria-label="Porównanie funkcji">\n'
        f'          <div class="vs-cmp-head" role="row">\n'
        f'            <div class="vs-cmp-th vs-cmp-th--crit" role="columnheader">Kryterium</div>\n'
        f'            <div class="vs-cmp-th vs-cmp-th--lumo" role="columnheader"><img src="img/logo.png" alt=""><span>LumoBot</span></div>\n'
        f'            <div class="vs-cmp-th vs-cmp-th--rv" role="columnheader"><img src="img/rywale/{icon}" alt=""><span>{esc(rival)}</span></div>\n'
        f'          </div>{"".join(groups)}\n'
        f'        </div>\n\n'
        f'        <p class="vs-note">Znaczki: ✓ pełne wsparcie, ◐ częściowo, ✕ brak.</p>\n'
        f'        <div class="vs-cmp-cta">\n'
        f'          <p>{esc(encouragement).replace("0 zł", "0&nbsp;zł")}</p>\n'
        f'          <a class="spo-full" href="pobierz.html">Pobierz LumoBota</a>\n'
        f'        </div>\n'
        f'      </div>\n'
        f'    </section>'
    )

def patch_for(path, old_block, new_block):
    return '\n'.join(['*** Update File: ' + path, '@@'] + ['-' + x for x in old_block.split('\n')] + ['+' + x for x in new_block.split('\n')])

patches = []
wanted = sys.argv[1] if len(sys.argv) > 1 else ''
for slug, (rel, icon, c1, c2) in PAGES.items():
    if wanted and slug != wanted:
        continue
    path = ROOT / rel
    cur = path.read_text(encoding='utf-8').replace('\r\n', '\n')
    rival = re.search(r'### TEKSTY: [^\n]+ \(strona ' + esc_re(slug) + r'\)\n.*?\| Kryterium \| LumoBot \| ([^|]+) \|', TABLE, re.S).group(1).strip()
    h1, kicker, lead = vs_text_for(rival)
    start = cur.index('    <a class="vs-crumb"')
    end = cur.index('\n    <p class="vs-kicker">', start)
    old_head = cur[start:end]
    new_head = (
        '    <a class="vs-crumb" href="porownanie.html"><span aria-hidden="true">‹ </span>Wszystkie porównania</a>\n'
        '    <div class="pg-head">\n'
        f'      <span class="pg-icon" data-pal="artykul" style="--c1:{c1};--c2:{c2}" aria-hidden="true"><img src="img/rywale/{icon}" alt="" width="34" height="34"></span>\n'
        f'      <h1 class="display vs-title">{esc(h1)}</h1>\n'
        '    </div>'
    )
    table_start = cur.index('    <section class="vs-tab">')
    table_end = cur.index('\n    <section class="vs-text"', table_start)
    old_table = cur[table_start:table_end]
    new_table = table_html(slug, icon)
    changed = cur.replace(old_head, new_head).replace(old_table, new_table)
    changed = changed.replace(re.sub(r'\s+', ' ', '<p class="vs-kicker">'), '<p class="vs-kicker">') if False else changed
    # Only the source fragment is edited here. The generated pages are rebuilt by zloz.py.
    old_kicker = re.search(r'    <p class="vs-kicker">.*?</p>', changed, re.S).group(0)
    old_lead = re.search(r'    <p class="vs-lead">.*?</p>', changed, re.S).group(0)
    changed = changed.replace(old_kicker, f'    <p class="vs-kicker">{esc(kicker)}</p>', 1)
    changed = changed.replace(old_lead, f'    <p class="vs-lead">{esc(lead)}</p>', 1)
    changed = changed.replace('0 zł', '0&nbsp;zł')
    if changed == cur:
        raise RuntimeError('no change: ' + rel)
    patches.append(patch_for(rel, cur, changed))

if not wanted:
    compare = ROOT / 'strona/czesci/strona-porownanie.html'
    cur = compare.read_text(encoding='utf-8').replace('\r\n', '\n')
    changed = cur.replace('0 zł', '0&nbsp;zł')
    patches.append(patch_for('strona/czesci/strona-porownanie.html', cur, changed))

print('*** Begin Patch')
print('\n'.join(patches))
print('*** End Patch')
