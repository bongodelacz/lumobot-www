"""Karty z gradientem, które prowadzą do innych stron LumoBota (wzór: "Inne porównania" i siatka kart OpenBota).

Pisze trzy części w strona/czesci/:
  karty-porownania.html  6 kart porównań (komponent .pj-card ze stron vs)
  karty-wtyczki.html     6 kafli podstron wtyczek (gradient z tytułem w środku)
  karty-artykuly.html    4 artykuły i dziennik zmian (gradient z tytułem w środku)
Uruchom:  python narzedzia/karty.py, potem narzedzia/zloz.py
"""
from html import escape
from pathlib import Path

C = Path(__file__).resolve().parent.parent / "strona" / "czesci"
ARROW = '<span class="pj-ar" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>'

RIVALS = [
    ("vs-openbot", "OpenBot", "openbot.svg", "lagoon", 0, "Lokalny zespół agentów i serwer dla firm"),
    ("vs-grok-bot", "Grok Bot", "grok.svg", "rose", 5, "Lokalny folder LumoBota, komputer w chmurze Grok Bota"),
    ("vs-claude-cowork", "Claude Cowork", "claude.svg", "forest", 10, "Wielu dostawców AI kontra modele Claude"),
    ("vs-manus", "Manus", "manus.svg", "ember", 15, "Twój plan AI kontra kredyty w chmurze"),
    ("vs-openclaw", "OpenClaw", "openclaw.svg", "ocean", 20, "Gotowa aplikacja kontra asystent, którego stawiasz sam"),
    ("vs-devin", "Devin", "devin.svg", "violet", 25, "Twój komputer kontra programista w chmurze"),
]

PLUGINS = [
    ("wtyczka-google", "Gmail i Kalendarz Google", "Poczta i plan dnia", "rose", 31),
    ("wtyczka-notion-dysk", "Notion i Dysk Google", "Notatki i pliki", "ember", 32),
    ("wtyczka-przegladarka", "Przeglądarka i dokumentacja", "Strony, formularze, kod", "lagoon", 33),
    ("wtyczka-slack-discord", "Slack i Discord", "Kanały i wiadomości", "violet", 34),
    ("wtyczka-github-figma", "GitHub i Figma", "Kod i projekty", "forest", 35),
    ("wtyczka-wzory", "Gotowe wzory planu", "Praca o stałej godzinie", "ocean", 36),
]

ARTICLES = [
    ("nowosc-gotowe-znaczy-sprawdzone", "Gotowe znaczy sprawdzone", "Zasady · 18 listopada 2026", "lagoon", 41),
    ("nowosc-haslo-zostaje-u-ciebie", "Agent nie musi znać twojego hasła", "Bezpieczeństwo · 17 listopada 2026", "rose", 42),
    ("nowosc-zespol-nie-solista", "Jeden agent to za mało", "Jak pracujemy · 16 listopada 2026", "forest", 43),
    ("nowosc-twoj-plan-nasz-program", "Płacisz za AI raz, nie dwa razy", "Ceny · 15 listopada 2026", "ember", 44),
    ("nowosci", "Dziennik zmian", "Wszystkie wersje LumoBota", "violet", 45),
]

ONAS = [
    ("dokumentacja", "Dokumentacja", "Instalacja, pierwsze zadanie, zespół, modele i wtyczki", "violet", 71),
    ("nowosci", "Aktualizacje", "Dziennik zmian, od najnowszej wersji", "ocean", 72),
    ("porownanie", "Porównania", "Czego LumoBot jeszcze nie ma i jak wypada przy innych", "lagoon", 73),
    ("status", "Status", "Wersja aplikacji i usługi, z których korzysta", "forest", 74),
    ("firmy", "Dla firm", "Licencja komercyjna od 31 grudnia 2026", "ember", 75),
    ("ai", "Świat AI", "Teksty o zasadach, na których stoi LumoBot", "rose", 76),
]

STYLE = """<style>
/* kafle z gradientem (zt-): gradient z tytułem w środku, pod spodem opis i tytuł; bez ramek */
.zt{padding-top:96px}
.zt-h{margin:0 0 32px;font-size:clamp(32px,3.4vw,44px);line-height:1.1;letter-spacing:-.03em;color:#f5f5f7}
.zt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px 24px}
.zt-card{display:flex;flex-direction:column;gap:12px;color:#f5f5f7;text-decoration:none;border-radius:20px}
.zt-art{position:relative;isolation:isolate;overflow:hidden;display:grid;place-items:center;aspect-ratio:16/9;border-radius:20px;background:#1e3a8a;padding:24px;text-align:center}
.zt-art .kf-grain{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
.zt-art b{position:relative;z-index:1;max-width:16ch;font-size:clamp(20px,1.9vw,26px);line-height:1.15;letter-spacing:-.02em;font-weight:700;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.35);transition:transform .35s cubic-bezier(.22,1,.36,1)}
.zt-meta{font-size:13px;color:#86868b}
.zt-t{font-size:17px;font-weight:600;line-height:1.35;color:#f5f5f7}
.zt-card:hover .zt-art b{transform:scale(1.04)}
.zt-card:hover .zt-t{text-decoration:underline;text-underline-offset:3px}
.zt-card:active{opacity:.75}
.zt-card:focus-visible{outline:2px solid #f5f5f7;outline-offset:4px}
.zt .pj-grid{margin-top:0}
@media (max-width:900px){.zt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:600px){.zt{padding-top:64px}.zt-grid{grid-template-columns:1fr;gap:24px}}
@media (prefers-reduced-motion:reduce){.zt-art b{transition:none}}
</style>
<script>
(function(){
  const run = () => { if(!window.lumoGrain) return;
    document.querySelectorAll('.zt-art').forEach(box => { let seen = false;
      new IntersectionObserver(es => { seen = es[0].isIntersecting; if(seen) window.lumoGrain.wake(); }).observe(box);
      window.lumoGrain.add(box, () => seen, +box.dataset.seed, box.dataset.pal); }); };
  document.readyState === 'complete' ? run() : addEventListener('load', run);
})();
</script>
"""


def tiles(title, items):
    cards = "\n".join(
        f'      <a class="zt-card" href="{h}.html">\n'
        f'        <span class="zt-art" data-pal="{pal}" data-seed="{seed}"><b>{escape(t)}</b></span>\n'
        f'        <span class="zt-meta">{escape(meta)}</span>\n'
        f'        <span class="zt-t">{escape(t)}</span>\n      </a>'
        for h, t, meta, pal, seed in items)
    return (f'<section class="zt wrap" aria-label="{escape(title)}">\n  <h2 class="zt-h">{escape(title)}</h2>\n'
            f'  <div class="zt-grid">\n{cards}\n  </div>\n</section>\n')


def main():
    pj = "\n".join(
        f'      <a class="pj-card" href="{h}.html">\n'
        f'        <span class="pj-art" data-pal="{pal}" data-seed="{seed}">\n'
        f'          <span class="pj-me"><img src="img/logo.png" alt="LumoBot"></span><em>vs</em><span class="pj-rv"><img src="img/rywale/{logo}" alt="{escape(n)}"></span></span>\n'
        f'        <span class="pj-txt"><b>LumoBot vs {escape(n)}</b><small>{escape(sub)}</small></span>\n        {ARROW}\n      </a>'
        for h, n, logo, pal, seed, sub in RIVALS)
    (C / "karty-porownania.html").write_text(
        f'<section class="zt wrap" aria-label="Porównania jeden na jeden">\n  <h2 class="zt-h">Porównania jeden na jeden</h2>\n'
        f'  <div class="pj-grid">\n{pj}\n  </div>\n</section>\n' + STYLE, encoding="utf-8", newline="\n")
    (C / "karty-wtyczki.html").write_text(tiles("Wszystkie wtyczki", [(h, t, m, p, s) for h, t, m, p, s in PLUGINS]) + STYLE, encoding="utf-8", newline="\n")
    (C / "karty-artykuly.html").write_text(tiles("Poczytaj dalej", ARTICLES) + STYLE, encoding="utf-8", newline="\n")
    (C / "karty-onas.html").write_text(tiles("Gdzie dalej", ONAS) + STYLE, encoding="utf-8", newline="\n")
    print("zapisano karty-onas, karty-porownania, karty-wtyczki, karty-artykuly")


if __name__ == "__main__":
    main()
