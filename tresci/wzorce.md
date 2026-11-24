# Wzorce wzornictwa v3 (apple.com, linear.app, raycast.com, openbot.run/pl, vercel.com)

Zrzuty referencyjne w `.lumobot/zrzuty/`:
- `138-www-apple-com-iphone.png` (Apple: pasek i podmenu ikonowe)
- `133-linear-app.png`, `142-linear-app.png` (Linear: pasek, pigułka pod kursorem i dwuwarstwowy panel)
- `139-www-raycast-com.png` (Raycast: pływająca wyspa paska ze szkłem i ukośne smugi światła w tle)
- `136-openbot-run-pl.png`, `144-openbot-run-pl.png` (OpenBot: środkowa kapsuła zakładek, panel z dużą kartą graficzną po lewej i listą po prawej)
- `137-vercel-com.png`, `145-vercel-com.png` (Vercel: czysty układ wielokolumnowego panelu i siatka w tle)

---

## 1. PASEK liquid glass (`css/pasek.css`, `czesci/pasek.html`, `js/pasek.js`)

Połączenie pływającej kapsuły z Raycast i OpenBot z optyką szkła Apple oraz dwuwarstwowym panelem z Linear.

### Wymiary i pozycjonowanie paska
- Układ: przyklejony u góry (`position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 1000`).
- Szerokość: `width: min(1120px, calc(100vw - 32px))`, wysokość: `height: 56px`, odstęp wewnętrzny: `padding: 0 12px 0 20px`.
- Zaokrąglenie głównej kapsuły paska: `border-radius: 28px` (zgodnie z v3: 22-28 px).
- Na telefonie (`max-width: 768px`): `top: 12px`, `height: 52px`, `border-radius: 24px`, `width: calc(100vw - 24px)`.

### Szkło, kolory tła, krawędzie i cień (Liquid Glass)
- Tło spoczynkowe: `background: rgba(28, 28, 32, 0.55)`.
- Tło po przewinięciu (`scrollY > 24px`) lub otwarciu panelu: `background: rgba(28, 28, 32, 0.72)`.
- Filtr szkła: `backdrop-filter: blur(24px) saturate(1.8); -webkit-backdrop-filter: blur(24px) saturate(1.8)`.
- Obramowanie zewnętrzne: `border: 1px solid rgba(255, 255, 255, 0.08)`.
- Krawędź świetlna i cień (`box-shadow`):
  ```css
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04),
    0 16px 40px -8px rgba(0, 0, 0, 0.55),
    0 4px 12px rgba(0, 0, 0, 0.35);
  ```
- Delikatny połysk u góry (`::before`): `height: 1px`, `background: linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.28) 50%, transparent 90%)`.

### Typografia zakładek i przyciski
- Krój: `Inter`, rozmiar tekstu zakładek: `font-size: 14px`, grubość: `font-weight: 500`, `letter-spacing: -0.01em`, `line-height: 1`.
- Kolor tekstu zakładki: spoczynkowy `#a1a1a6`, po najechaniu i aktywny `#e8e8ed`.
- Odstępy zakładek: `padding: 8px 14px`, odstęp między zakładkami `gap: 4px`.
- Strzałka przy zakładce z panelem: SVG `10x10 px`, `stroke-width: 1.75`, obrót przy otwarciu `transform: rotate(180deg)` w `220ms cubic-bezier(.2, .7, .2, 1)`.
- Przycisk główny w pasku (Pobierz): wysokość `36px`, `padding: 0 16px`, `border-radius: 18px`, tło `#3a6bfc`, tekst `#e8e8ed`, `font-size: 13px`, `font-weight: 600`, wewnętrzny blask `inset 0 1px 0 rgba(255,255,255,0.25)`, po najechaniu `background: #4e7bff` i `box-shadow: 0 0 20px rgba(58, 107, 252, 0.45)`.

### Podświetlenie pod kursorem (pływająca pigułka jak w Linear i Raycast)
- Zamiast zwykłego `:hover` na każdym linku osobno, wspólna warstwa `.pasek-pigulka` przesuwa się pod aktywną zakładkę:
  - Wymiary: wysokość `34px`, `border-radius: 17px`.
  - Tło pigułki: `background: rgba(255, 255, 255, 0.08)`, krawędź: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12)`.
  - Przejście położenia i rozmiaru: `transition: transform 240ms cubic-bezier(.2, .7, .2, 1), width 240ms cubic-bezier(.2, .7, .2, 1), opacity 160ms ease`.
- Stan `:focus-visible` (klawiatura): `outline: 2px solid #3a6bfc; outline-offset: 2px; border-radius: 17px`.
- Stan `:active` (wciśnięcie): `transform: scale(0.97)` w `100ms ease`.

### Panel rozwijany (mega-menu jak w Linear `142-linear-app.png`)
- Pozycja: wyśrodkowany pod paskiem, `top: calc(100% + 10px)`, szerokość `min(680px, calc(100vw - 32px))`.
- Konstrukcja dwuwarstwowa (wzorzec Linear):
  1. Zewnętrzna ramka szkła: `padding: 6px`, `border-radius: 24px`, `background: rgba(28, 28, 32, 0.65)`, `backdrop-filter: blur(24px) saturate(1.8)`, `border: 1px solid rgba(255, 255, 255, 0.10)`, `box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 60px rgba(0,0,0,0.65)`.
  2. Wewnętrzna siatka kart (wzorzec Linear + OpenBot `144-openbot-run-pl.png`): `border-radius: 18px`, `background: rgba(10, 10, 14, 0.55)`, `border: 1px solid rgba(255, 255, 255, 0.06)`, `padding: 12px`, układ `display: grid; grid-template-columns: 220px 1fr; gap: 12px`.
- Karta graficzna po lewej (`img/menu/*.png` od Palety, wzorzec OpenBot): szerokość `220px`, wysokość `230px`, `border-radius: 14px`, `overflow: hidden`, `position: relative`, tekst na dole karty (`padding: 14px`, `font-size: 15px`, `font-weight: 600`, `#e8e8ed`, pod spodem `linear-gradient(to top, rgba(10,10,14,0.88), transparent)`).
- Karta pozycji po prawej: `padding: 10px 12px`, `border-radius: 12px`, po najechaniu `background: rgba(255, 255, 255, 0.06)`. Ikona `36x36px` (`border-radius: 10px`), obok tytuł `14px`, `font-weight: 600`, `#e8e8ed` i opis `13px`, `font-weight: 400`, `#a1a1a6`, `line-height: 1.4`.
- Dolny pasek w panelu (stopka panelu): `padding: 10px 14px 4px`, `font-size: 13px`, kolor `#a1a1a6` z linkiem `#3a6bfc`.
- Jak wjeżdża panel (wartości animacji):
  - Stan ukryty: `opacity: 0; transform: translateY(-8px) scale(0.97); pointer-events: none; filter: blur(4px)`.
  - Stan widoczny: `opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; filter: blur(0px)`.
  - Czas i krzywa wejścia: `260ms cubic-bezier(.2, .7, .2, 1)`.
  - Czas i krzywa wyjścia: `180ms cubic-bezier(.4, 0, .2, 1)`.
  - Przełączanie między otwartymi zakładkami: zawartość przesuwa się poziomo `translateX(+-12px -> 0)` w `220ms cubic-bezier(.2, .7, .2, 1)` bez zamykania zewnętrznej ramki.
  - Opóźnienie zamknięcia po zjechaniu kursorem (hover intent): `120ms`, żeby kursor swobodnie przeszedł przez szczelinę `10px`.

---

## 2. TŁO żywe, ciemne (`css/tlo.css`, `js/tlo.js`)

Zestaw czterech lekkich warstw na bazie `#0a0a0a` (wzorce z Raycast, Linear i Vercel), zamkniętych w stałym kontenerze `position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: #0a0a0a`.

### Warstwa A: Wolno płynące poświaty zorzy (Raycast + Linear)
- Dwie lub trzy duże plamy radialne przesuwające się powoli w tle:
  - Poświata główna (niebieska, pod hero): `width: 760px; height: 480px`, `background: radial-gradient(ellipse at center, rgba(58, 107, 252, 0.18) 0%, rgba(58, 107, 252, 0.05) 45%, transparent 72%)`, `filter: blur(60px)`.
  - Poświata boczna (fioletowa, akcent): `width: 620px; height: 420px`, `background: radial-gradient(ellipse at center, rgba(122, 92, 255, 0.14) 0%, rgba(122, 92, 255, 0.03) 50%, transparent 70%)`, `filter: blur(70px)`.
- Ruch autonomiczny: pętla `22s ease-in-out infinite alternate`, przesunięcie `translate3d(40px, -30px, 0) scale(1.08)`.

### Warstwa B: Siatka architektoniczna z maską zanikania (Vercel + Linear)
- Linie siatki rysowane w CSS:
  ```css
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  ```
- Maska radialna (widoczna głównie w środku ekranu i u góry, zanika na bokach):
  ```css
  mask-image: radial-gradient(ellipse 80% 55% at 50% 25%, #000 20%, transparent 75%);
  ```
- Błyski na liniach siatki (meteory): 3 cienkie odcinki `width: 96px; height: 1px`, `background: linear-gradient(90deg, transparent, #3a6bfc, #e8e8ed)`, przelatujące wzdłuż linii siatki co `6-9s` z czasem `2.8s cubic-bezier(.2, .7, .2, 1)`.

### Warstwa C: Rzadkie mikropunkty (gwiazdy / węzły z Linear)
- Na płótnie `<canvas>` (albo w SVG) `45` punktów o promieniu `1px` do `1.5px`.
- Kolor: `#e8e8ed`, przezroczystość bazowa `opacity: 0.12` do `0.32`.
- Co kilka sekund wybrany węzeł łagodnie pulsuje do `opacity: 0.55` (czas cyklu `4s ease-in-out`).

### Warstwa D: Filmowy szum (ziarno przeciw pasmowaniu gradientów)
- Nakładka SVG `feTurbulence` (`baseFrequency="0.8"`, `numOctaves="3"`, `stitchTiles="stitch"`).
- Przezroczystość: `opacity: 0.028`, `mix-blend-mode: overlay`. Sprawia, że ciemne przejścia `#0a0a0a` wyglądają gładko i naturalnie.

### Reakcja tła na kursor i przewijanie (`js/tlo.js`)
- Reakcja na kursor (latarka na siatce):
  - Zmienne CSS `--mx` i `--my` aktualizowane w `requestAnimationFrame` z wygładzaniem (interpolacja `lerp = 0.08`, żeby ruch miał miękką bezwładność).
  - Dodatkowa warstwa siatki o jaśniejszych liniach (`rgba(58, 107, 252, 0.16)`) odsłaniana maską `radial-gradient(360px circle at var(--mx) var(--my), #000 0%, transparent 100%)`.
- Reakcja na przewijanie (`scrollY`):
  - Poświaty przesuwają się z paralaksą `translate3d(0, calc(var(--scroll) * -0.15px), 0)`.
  - W połowie strony (sekcja Neuro) fioletowa poświata `#7a5cff` zwiększa udział z `0.14` do `0.22`, a przy stopce wraca chłodny błękit `#3a6bfc`.
- Wyłącznik dostępności i testów: gdy `prefers-reduced-motion: reduce` lub w adresie jest `?statycznie`, pętle `requestAnimationFrame` nie startują, a poświaty stoją w spoczynku.

---

## 3. RUCH przy przewijaniu: 6 najlepszych efektów (`js/ruch.js`, `css/sekcje.css`)

Wszystkie animacje używają wyłącznie `transform` i `opacity`, wspólnej krzywej `cubic-bezier(.2, .7, .2, 1)` oraz natychmiast pokazują stan końcowy przy `prefers-reduced-motion: reduce` i `?statycznie`.

### Efekt 1: Wyprostowanie i przybliżenie okna aplikacji w 3D (wzorzec Linear i OpenBot)
- Zastosowanie: główne okno LumoBota pod sekcją Hero.
- Działanie: okno startuje lekko pochylone w perspektywie i mniejsze, a podczas przewijania pierwszych `420px` prostuje się do pełnego rozmiaru.
- Wartości:
  - Kontener rodzica: `perspective: 1200px`.
  - Stan początkowy (`progress = 0`): `transform: rotateX(14deg) scale(0.92) translateY(32px)`, `opacity: 0.75`, cień `0 20px 50px rgba(0,0,0,0.5)`, blask górnej krawędzi `rgba(58, 107, 252, 0.25)`.
  - Stan końcowy (`progress = 1`): `transform: rotateX(0deg) scale(1) translateY(0px)`, `opacity: 1`, cień `0 40px 100px rgba(0,0,0,0.8)`.
  - Wygładzanie: przypięte do postępu przewijania z lekkim tłumieniem (`lerp 0.12`).

### Efekt 2: Odsłanianie słów nagłówka z rozmycia (wzorzec Apple i Linear)
- Zastosowanie: główne nagłówki sekcji (`hero.tytul1`, `okno.tytul`, `neuro.tytul`, `agenci.tytul`, `koniec.tytul`).
- Działanie: skrypt dzieli nagłówek na słowa `<span class="slowo">`. Gdy nagłówek wchodzi w kadr (`IntersectionObserver`, `threshold: 0.2`), słowa pojawiają się kaskadowo.
- Wartości:
  - Stan początkowy słowa: `opacity: 0; transform: translateY(16px); filter: blur(8px)`.
  - Stan końcowy słowa: `opacity: 1; transform: translateY(0); filter: blur(0)`.
  - Czas trwania jednego słowa: `560ms`, krzywa `cubic-bezier(.2, .7, .2, 1)`, opóźnienie między kolejnymi słowami (`stagger`): `45ms`.

### Efekt 3: Przyklejona historia kroków z żywą wyspą (wzorzec Apple Dynamic Island)
- Zastosowanie: sekcja historii pracy agenta (`wyspa.1` do `wyspa.6`).
- Działanie: kontener ma wysokość `260vh`, a wewnątrz niego ramka `position: sticky; top: 18vh` trzyma na środku ekranu pigułkę statusu ("wyspę"), która przechodzi przez 6 kroków wraz z przewijaniem.
- Wartości:
  - Wyspa: tło liquid glass (`rgba(28,28,32,0.65)`, `blur(24px)`), `border-radius: 28px`, zmienna szerokość od `260px` do `420px` zależnie od kroku (`transition: width 360ms cubic-bezier(.2, .7, .2, 1)`).
  - Aktywny krok: `opacity: 1; transform: scale(1) translateY(0)`.
  - Poprzedni krok: `opacity: 0.25; transform: scale(0.95) translateY(-14px)`.
  - Przy kroku 3 ("Sprawdzający mówi: nie") obwódka wyspy błyska delikatnym bursztynem `rgba(245, 158, 11, 0.45)`, a przy kroku 6 ("Cel osiągnięty") błękitem marki `rgba(58, 107, 252, 0.55)`.

### Efekt 4: Liczniki z hamowaniem na końcu (wzorzec Vercel i Raycast)
- Zastosowanie: sekcja liczb (`liczby.1` do `liczby.4`: 6, 7, 5, 2).
- Działanie: po wejściu w kadr (`threshold: 0.4`) liczba odlicza od `0` do wartości docelowej, a cała karta unosi się o `16px`.
- Wartości:
  - Czas odliczania: `1100ms`, funkcja wygaszania `easeOutExpo` (`1 - Math.pow(2, -10 * t)`).
  - Styl cyfry: `font-size: clamp(40px, 5vw, 64px)`, `font-weight: 700`, `letter-spacing: -0.04em`, `font-variant-numeric: tabular-nums`, kolor `#e8e8ed` z delikatnym gradientem pionowym od `#ffffff` do `#a1a1a6`.

### Efekt 5: Karty ze światłem krawędziowym pod kursorem i kaskadą wejścia (wzorzec Raycast)
- Zastosowanie: siatka 6 agentów (`agent.Lider` do `agent.Paleta`) oraz karty funkcji.
- Działanie: przy przewijaniu karty wjeżdżają kaskadowo, a przy ruchu myszą krawędź karty najbliższa kursorowi rozświetla się błękitem `#3a6bfc`.
- Wartości:
  - Wejście przy przewijaniu: `opacity: 0 -> 1`, `transform: translateY(24px) -> translateY(0)`, czas `520ms cubic-bezier(.2, .7, .2, 1)`, opóźnienie między kartami w wierszu `70ms`.
  - Światło krawędziowe (`::before` na karcie): `padding: 1px`, `border-radius: 24px`, `background: radial-gradient(280px circle at var(--kx) var(--ky), rgba(58, 107, 252, 0.45), rgba(255, 255, 255, 0.08) 40%, transparent 100%)`, maskowane tylko do obwódki `1px`.

### Efekt 6: Poziomy tor kart sterowany pionowym przewijaniem lub gładką karuzelą (wzorzec Apple)
- Zastosowanie: prezentacja etapów lub kart agentów na szerszym ekranie.
- Działanie: gdy sekcja jest w kadrze, pionowy ruch strony przesuwa rząd kart w poziomie (`translate3d`), a na telefonie (`390px`) przełącza się automatycznie w pionowy stos z odstępem `16px` (zero przewijania w bok całej strony).
- Wartości:
  - Przesunięcie toru: `transform: translate3d(calc(var(--postep-sekcji) * -28%), 0, 0)` z płynnym wygładzaniem.
  - Odstęp między kartami: `gap: 24px` (zgodnie ze skalą odstępów: 4, 8, 12, 16, 24, 32).
  - Na ekranach `<= 768px`: `transform: none`, układ `grid-template-columns: 1fr; gap: 16px`, pełna czytelność na `390px`.
