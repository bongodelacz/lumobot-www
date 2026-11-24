# Strona LumoBota v3: ustalenia zespołu

Użytkownik: strona jest za nudna, pasek mało czytelny. Chce poziomu "prawdziwej firmy": pasek w stylu Apple liquid glass,
ładniejsze animowane tło, efekty przy przewijaniu, coś, co robi wrażenie. Porównanie i pytania NIE są na stronie głównej,
tylko w osobnych zakładkach paska (porownanie.html, pytania.html).

## Zasady wyglądu (v3, ważniejsze niż wcześniejsze)
- Baza: ciemne tło #0a0a0a, ale ŻYWE: animowane tło (Forma) pod całą stroną. Zero białych teł i białych przycisków.
- Szkło (liquid glass): półprzezroczyste tło rgba(28,28,32,.55), backdrop-filter: blur(24px) saturate(1.8), cienka jasna krawędź u góry
  (inset 0 1px 0 rgba(255,255,255,.14)), delikatny połysk, zaokrąglenia 22-28 px. Używać w pasku, panelach i wybranych kartach.
- Kolor marki: niebieski #3a6bfc, wolno używać fioletu #7a5cff w tle i poświatach, z umiarem. Tekst #e8e8ed i #a1a1a6.
- Ruch: płynnie (cubic-bezier(.2,.7,.2,1)), 60 kl./s, transform i opacity, zawsze wyłączany przez prefers-reduced-motion i ?statycznie.
- Krój Inter. Tytuły duże i ciasne (letter-spacing -0.04em). Teksty prostym polskim, bez długich myślników.

## Kto co robi
| Część | Kto | Pliki |
|---|---|---|
| Badanie wzorców (pasek, tło, ruch) z najlepszych stron | Zwiad (Antigravity) | tresci/wzorce.md + zrzuty w .lumobot/zrzuty |
| Animowane tło całej strony + biblioteka efektów przy przewijaniu | Forma (Antigravity) | css/tlo.css, js/tlo.js, js/ruch.js |
| Pasek liquid glass z panelami (wszystkie strony) | Kreska | czesci/pasek.html, css/pasek.css, js/pasek.js |
| Nowe teksty strony głównej | Pióro | tresci/teksty-v3.md |
| Grafiki do paneli paska | Paleta | img/menu/*.png |
| Strona główna: hero z wyspą, historia, okno aplikacji, Neuro, agenci, składanie | Lider | szablony/index.html, css/sekcje.css, js/strona.js |
| Test całości na końcu | Lupa | (raport na kanale) |

Składanie: python narzedzia/zloz.py (szablony/index.html + czesci/*.html, podstrony ze wzoru w zloz.py). Podgląd: http://127.0.0.1:8790/.
Każda strona ładuje: css/baza.css, css/tlo.css, css/pasek.css, css/dol.css (+ swoje) i js/tlo.js, js/ruch.js, js/pasek.js, js/wspolne.js.
Nie zmieniaj cudzych plików; uzgodnienia na kanale (lumo powiedz / lumo zapytaj). Lider rozstrzyga.
Buźki agentów: <span data-face="Lider" data-px="40"></span> (wypełnia js/agenci.js). Ikony: img/ikony2/*.svg (duotone).
