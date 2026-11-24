# Żywe karty funkcji: wspólna specyfikacja (czytają wszyscy autorzy kart)

Użytkownik: "harmonia i pomysłowość zrównoważone, styl Apple, dojebane rzeczy, jak openbot.run, ale nie kopia 1:1".
Na stronie głównej sekcja #funkcje to siatka 8 kart (bento). W każdej karcie u góry krótki tytuł i jedno zdanie (wstawia Lider),
pod spodem ŻYWA SCENKA: mała animacja z prawdziwego LumoBota, która sama się odtwarza w pętli, gdy karta jest widoczna.

## Twardy styl (decyzje użytkownika)
- Tło strony jednolite #0a0a0a. Karta: tło #141416, krawędź 1px rgba(255,255,255,.08), zaokrąglenie 28px (robi Lider).
- ZERO gradientów (linear/radial/conic), zero kolorowych poświat i rozmytych świateł. Zero bieli jako tła.
- Kolory w scenkach: tekst #e8e8ed, szary #a1a1a6 i #86868b, powierzchnie #1c1c1f i #232327, linie rgba(255,255,255,.08-.14),
  akcent niebieski #3a6bfc, stany: zielony #30d158 (przeszło), czerwony #ff6961 (nie przeszło). Nic więcej.
- Krój Inter (już na stronie), mono: ui-monospace, Consolas. Rozmiary w scenkach 12-15 px.
- Ruch spokojny i precyzyjny jak u Apple: cubic-bezier(.2,.7,.2,1), 300-700 ms, pętla 6-10 s, pauzy między krokami.
  Tylko transform i opacity. Start, gdy karta widoczna (IntersectionObserver), stop, gdy znika.
  Gdy prefers-reduced-motion albo <html class="static">: pokaż ładną klatkę końcową, bez animacji.
- Buźki agentów: <span data-face="Lupa" data-px="28"></span> (wypełnia js/agenci.js; imiona: Lider, Pióro, Kreska, Lupa, Radar, Paleta).
- Ikony: img/ikony2/NAZWA.svg (duotone). Prawdziwe teksty po polsku, bez lorem ipsum, bez długich myślników.

## Co oddajesz (dla każdej swojej karty NAZWA)
- strona/czesci/demo-NAZWA.html: TYLKO scenka: jeden <div class="dm-NAZWA" aria-hidden="true">...</div>. Bez tytułu karty.
- strona/css/demo-NAZWA.css: style tylko z przedrostkiem .dm-NAZWA. Scenka ma wysokość 240 px (karta szeroka: 260 px) i szerokość 100%.
- strona/js/demo-NAZWA.js: samodzielny skrypt w (function(){...})(), szuka .dm-NAZWA, bez bibliotek, bez błędów, gdy elementu nie ma.
- Podgląd: strona/test-demo-NAZWA.html (ładuje css/baza.css, css/demo-NAZWA.css, faces.css, js/agenci.js, js/demo-NAZWA.js; kafel #141416 680x380),
  sprawdź: lumo strona http://127.0.0.1:8790/test-demo-NAZWA.html czekaj 3000 zrzut czekaj 3000 zrzut. Gotowe, gdy płynnie, czysto i bez błędów konsoli.

## Karty i autorzy
| NAZWA | Autor | Scenka |
|---|---|---|
| skutek | Forma | Runda 1: lista 3 kroków agenta wpisuje się po kolei, linia "✕ Sprawdzenie nie przeszło: menu wychodzi poza ekran" (czerwony), runda 2: krok "Zmienia style.css", "✓ Sprawdzenie przeszło" (zielony), na końcu znaczek "Cel osiągnięty · 2 rundy". Karta szeroka. |
| komputer | Forma | Miniaturowy pulpit (okno programu z paskiem), kursor sam klika i pisze "Gotowe", potem przesuwa się do lewego górnego rogu i pojawia się "Bezpiecznik: agent zatrzymany". |
| przegladarka | Zwiad | Okienko przeglądarki agenta: pole adresu, w terminalu pod spodem wpisują się polecenia "lumo web szukaj ...", "lumo web czytaj", wyniki z numerami @1 @2, podświetlenie klikniętego wyniku, na końcu "Pobrano: cennik.pdf". |
| powrot | Zwiad | Pionowa oś git z 4 punktami powrotu (godzina, opis), nowy punkt dopisuje się na górze, potem kursor klika "Cofnij do 10:42" i oś płynnie wraca, a późniejsze punkty bledną. |
| zespol | Radar | Ramka "Zespół": 3 wiersze (Pióro, Paleta, Lupa) z buźką, plikiem i stanem; stany zmieniają się na żywo: "czeka" → "pracuje · 12 s" (buźka z klasą busy) → "gotowe · 48 s"; licznik "gotowe: 2 / 3" rośnie. |
| wyspa | Radar | Czarna pigułka wyspy u góry miniaturowego ekranu: rozszerza się, pokazuje falę głosu (słupki), napis "Słucham…", potem "Zrób stronę kawiarni", potem "Lider pracuje · runda 1" z kropkami, przycisk "Zakończ". |
| obrazy | Paleta | Płótno 4:3: najpierw puste z delikatną siatką i napisem "Paleta rysuje…", obraz (strona/img/menu/agenci.png albo prosty rysunek SVG) wyłania się z rozmycia do ostrości, potem podpis "obrazy/logo.png · 1024×1024". |
| neuro | Lider | Żywa sieć i licznik szansy na cel (już jest). |
