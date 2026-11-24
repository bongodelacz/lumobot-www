# Przepis na pasek nawigacji w stylu Apple Liquid Glass

Twarde zasady projektu:
- Tło całej strony to jednolite `#0a0a0a`.
- Zero kolorowych gradientów i poświat w tle strony oraz wokół paska.
- Cały efekt szkła budują wyłącznie warstwy optyczne: ciemna tafla, rozmycie tła, załamanie światła na krawędziach (refrakcja SVG), asymetryczny obrys świetlny (specular rim) i neutralny biały połysk.
- Zachowaj spójną skalę odstępów: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`.

---

## 1. Warstwy paska i dokładne wartości CSS/SVG

Efekt Liquid Glass na ciemnym tle `#0a0a0a` składa się z pięciu warstw. Aby tekst i linki w pasku były ostre, załamanie krawędzi (soczewkę SVG) nakładamy na osobny element lub pseudoelement `::before`, a wewnętrzny połysk na `::after`.

### A. Ukryty filtr SVG w kodzie HTML (załamanie światła)
Wklej raz na początku `<body>`. Rozszerzony obszar filtra (`-20%` do `140%`) zapobiega ucinaniu pikseli wciąganych zza krawędzi paska:

```html
<svg width="0" height="0" aria-hidden="true" focusable="false" style="position: absolute; width: 0; height: 0; overflow: hidden;">
  <filter id="lumo-liquid-glass" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="szum" />
    <feGaussianBlur in="szum" stdDeviation="1.5" result="gladkiSzum" />
    <feDisplacementMap in="SourceGraphic" in2="gladkiSzum" scale="24" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>
```

Parametry filtra SVG:
- `baseFrequency="0.012 0.018"`: tworzy długie, gładkie fale jak w grubym szkle zamiast drobnego ziarna.
- `numOctaves="2"`: daje naturalny kształt załamania bez obciążania karty graficznej.
- `stdDeviation="1.5"`: wygładza szum przed przesunięciem pikseli, dzięki czemu krawędzie wyginają się płynnie.
- `scale="24"`: siła załamania światła na brzegu tafli (wartości `20` do `28` dają efekt soczewki Apple; powyżej `40` tło zaczyna się rwać).

### B. Główna tafla paska (`.pasek-szklo`)
- **Zaokrąglenia**: `border-radius: 999px` dla pływającej kapsuły (lub `16px` przy szerszym pasku z odstępami `8px 16px`).
- **Tło tafli (przyciemnione szkło na `#0a0a0a`)**: `background: rgba(18, 18, 20, 0.68)` (ciemna, gęsta baza połączona z delikatnym rozjaśnieniem szkła).
- **Rozmycie bazowe**: `backdrop-filter: blur(20px) saturate(110%) brightness(1.04)`.
- **Cienka jasna krawędź (specular rim)**: światło pada z góry, więc górna krawędź jest najjaśniejsza, dolna średnia, a boki najdelikatniejsze. Zamiast płaskiej ramki użyj cienkiego obrysu i czterech wewnętrznych cieni (`inset box-shadow`).

```css
.pasek-szklo {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  color: #f5f5f7;

  /* 1. Tło tafli: ciemny grafit z wysokim kryciem, zero kolorowych domieszek */
  background: rgba(18, 18, 20, 0.68);

  /* 2. Rozmycie bazowe (fallback dla wszystkich przeglądarek) */
  -webkit-backdrop-filter: blur(20px) saturate(110%) brightness(1.04);
  backdrop-filter: blur(20px) saturate(110%) brightness(1.04);

  /* 3. Cienka jasna krawędź (specular rim) + głęboki czarny cień pod spodem */
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.55),
    inset 0 1px 0.5px rgba(255, 255, 255, 0.38),
    inset 0 -1px 0.5px rgba(255, 255, 255, 0.14),
    inset 1px 0 0.5px rgba(255, 255, 255, 0.08),
    inset -1px 0 0.5px rgba(255, 255, 255, 0.08);

  transition:
    background-color 240ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    padding 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

### C. Warstwa załamania krawędzi (`::before`)
Prawdziwa soczewka Apple zakrzywia obraz głównie przy brzegach tafli, a środek zostawia czytelny. Maska radialna (`mask-image`) wycina środek (`transparent 58%`) i zostawia refrakcję tylko przy krawędziach (`#000 92%`):

```css
.pasek-szklo::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  border-radius: inherit;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(120% 140% at 50% 50%, transparent 58%, #000 92%);
  mask-image: radial-gradient(120% 140% at 50% 50%, transparent 58%, #000 92%);
}

@supports (backdrop-filter: url('#lumo-liquid-glass')) {
  .pasek-szklo::before {
    backdrop-filter: blur(6px) saturate(115%) url('#lumo-liquid-glass');
  }
}
```

### D. Wewnętrzny połysk tafli (`::after`)
Ukośny, czysto biały odblask świetlny (zero kolorów), który nadaje tafli wypukłość:

```css
.pasek-szklo::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(255, 255, 255, 0.03) 32%,
    transparent 60%
  );
  mix-blend-mode: screen;
}
```

---

## 2. Zgodność z przeglądarkami (Chrome/Edge vs Firefox/Safari)

1. **Chrome 76+ i Edge 76+ (Chromium)**:
   - Działa pełny zestaw: `backdrop-filter: blur() saturate()` oraz referencja `url('#lumo-liquid-glass')` z filtrem SVG `feTurbulence` + `feDisplacementMap`.
2. **Safari 9+ / 18+ oraz Firefox 103+**:
   - Działa `backdrop-filter: blur(20px) saturate(110%) brightness(1.04)` (w starszym Safari przez `-webkit-backdrop-filter`).
   - **Nie działa** `url('#lumo-liquid-glass')` wewnątrz `backdrop-filter`. Jeśli wpiszesz `url()` w jednej regule razem z `blur()` na głównym elemencie, Safari odrzuci całą deklarację i pasek straci nawet rozmycie.
3. **Zasada bezpiecznego fallbacku**:
   - Rozmycie bazowe (`blur(20px) saturate(110%)`) trzymaj zawsze w głównej klasie `.pasek-szklo` z prefiksem `-webkit-`.
   - Załamanie SVG (`url('#lumo-liquid-glass')`) zamykaj w bloku `@supports (backdrop-filter: url('#lumo-liquid-glass'))` na pseudoelemencie `::before`. Wtedy Safari i Firefox wyświetlą gładkie, oszronione szkło z jasną krawędzią i połyskiem, a Chrome i Edge dodadzą ugięcie światła na brzegach.
4. **Dostępność (ograniczenie przezroczystości i ruchu)**:
   ```css
   @media (prefers-reduced-transparency: reduce) {
     .pasek-szklo {
       background: rgba(18, 18, 20, 0.96);
       -webkit-backdrop-filter: none;
       backdrop-filter: none;
     }
     .pasek-szklo::before {
       display: none;
     }
   }
   ```

---

## 3. Jak uniknąć kolorowych smug, gdy pod szkłem przejeżdża jaskrawy niebieski element

Domyślne poradniki Liquid Glass podbijają nasycenie do `saturate(180%)` przy małym rozmyciu `blur(8px)` i jasnym tle `rgba(255, 255, 255, 0.10)`. Na ciemnej stronie (`#0a0a0a`), gdy pod takim paskiem przejedzie niebieski przycisk lub odznaka akcentu, `saturate(180%)` tworzy neonową, niebieską plamę pod tekstem nawigacji.

Aby wyeliminować niebieskie smugi i zachować czyste, grafitowo-srebrne szkło:
1. **Ogranicz nasycenie (`saturate`) do `105%` - `115%`**: nigdy nie przekraczaj `120%`. Wartość `saturate(110%)` delikatnie ożywia krawędź przechodzącego kształtu, ale nie zamienia niebieskiego przycisku w świecącą plamę.
2. **Zwiększ bazowy promień rozmycia (`blur`) do `20px` - `24px`**: mocniejsze rozmycie na głównej tafli `.pasek-szklo` rozprasza jaskrawy akcent na dużą powierzchnię, zanim dotrze on do tekstu w pasku. W warstwie soczewki `::before` zostaw mniejszy `blur(6px)`, bo działa on tylko na wąskim brzegu maski.
3. **Zastosuj ciemny grafitowy podkład o kryciu `0.68` - `0.75`**: zamiast białego `rgba(255, 255, 255, 0.08)` użyj `background: rgba(18, 18, 20, 0.68)` (a po przewinięciu strony podnieś do `0.76`). Ciemna tafla działa jak neutralny filtr szary (ND), który tłumi jaskrawość niebieskiego elementu pod spodem i gwarantuje kontrast tekstu powyżej `7:1` (norma WCAG wymaga minimum `4.5:1`).
4. **Nie używaj `mix-blend-mode: color-dodge` ani `overlay`**: do połysku `::after` używaj wyłącznie delikatnego białego gradientu (`rgba(255, 255, 255, 0.14)` na starcie) z `mix-blend-mode: screen`.

---

## 4. Dwie spokojne mikroanimacje paska

Animacje wykorzystują wyłącznie krzywą `cubic-bezier(0.22, 1, 0.36, 1)` i trwają od `180ms` do `260ms`. Zero sprężynowania i zero kolorowych poświat.

### Mikroanimacja 1: Zgęstnienie tafli po przewinięciu strony (`.pasek-szklo.przewiniety`)
Gdy użytkownik przewinie stronę o więcej niż `24px`, pasek lekko się zwęża w pionie, jego grafitowe tło gęstnieje z `0.68` do `0.78`, a górna krawędź świetlna staje się wyraźniejsza, jakby szkło zbliżyło się do oka:

```css
.pasek-szklo.przewiniety {
  padding-top: 6px;
  padding-bottom: 6px;
  background: rgba(14, 14, 16, 0.78);
  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.70),
    inset 0 1px 0.5px rgba(255, 255, 255, 0.48),
    inset 0 -1px 0.5px rgba(255, 255, 255, 0.16),
    inset 1px 0 0.5px rgba(255, 255, 255, 0.10),
    inset -1px 0 0.5px rgba(255, 255, 255, 0.10);
}
```

### Mikroanimacja 2: Szklana kapsuła pod linkiem w nawigacji (hover / focus-visible / active)
Po najechaniu myszą lub wybraniu klawiaturą (`Tab`) link w pasku otrzymuje własną, mniejszą warstwę szkła z delikatnym górnym odbiciem światła. Po wciśnięciu (`:active`) kapsuła lekko się cofa (`scale(0.98)`):

```css
.pasek-szklo__link {
  position: relative;
  padding: 8px 12px;
  border-radius: 999px;
  color: rgba(245, 245, 247, 0.78);
  text-decoration: none;
  transition:
    color 180ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
}

.pasek-szklo__link:hover,
.pasek-szklo__link:focus-visible {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0.5px rgba(255, 255, 255, 0.32),
    inset 0 -1px 0.5px rgba(255, 255, 255, 0.08);
  outline: none;
}

.pasek-szklo__link:focus-visible {
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.45),
    inset 0 1px 0.5px rgba(255, 255, 255, 0.32);
}

.pasek-szklo__link:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .pasek-szklo,
  .pasek-szklo__link {
    transition: none;
  }
}
```
