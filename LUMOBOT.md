# LumoBot: strona lumobot.run

## Co to jest
Wielostronicowa strona LumoBota w strona/ (28 podstron): index, funkcje, wtyczki + 6 wtyczka-*, porownanie + 6 vs-*, nowosci, ai + 4 nowosc-*, cennik, firmy, status, dokumentacja, o-nas; 4 języki. Bez zakładek Agenci, pytania, pobierz i aplikacja (stare adresy przekierowują na górę głównej). Podział pracy rundy v23: .lumobot/projekt-v23.md.

## Jak uruchomić i sprawdzić
- narzedzia/serwer.py (albo uruchom.bat): http://127.0.0.1:8790; po restarcie komputera uruchomić ponownie. Zrzut bez animacji: ?statycznie.
- Złożenie: narzedzia/zloz.py (PAGES = części na stronę; CHANGELOG.md z LUMOBOT_CHANGELOG, folderu projektu albo ~/Desktop/Neuro AI; brak części albo dziennika = błąd i kod 1; wspólne style przed własnym css strony; ?v= przy css/js; NIE zmienia js/agenci.js ani strona/app/, maski file:// wpisuje zbuduj_app.py). Python: .venv z folderu aplikacji LumoBot (Pulpit/Neuro AI), z opcją -I. Linki: narzedzia/sprawdz_linki.py.
- Generatory części: banery.py (baner każdej podstrony), karty.py (karty z gradientem), wtyczki_podstrony.py (6 podstron wtyczek). Wyśrodkowanie: skrypt Piona .lumobot/pion-skan.js, raport .lumobot/pion-raport.md.

## Ustalenia
- UCZCIWOŚĆ (wprowadzanie w błąd jest nielegalne): o rywalu tylko fakty z oficjalnej strony; brak informacji to nie brak funkcji; przewaga tylko przy faktach; plany jako plany. Źródła tylko jako nazwane linki na dole strony, nigdy surowe adresy w tekście.
- BEZPIECZEŃSTWO: hasła szyfrowane na komputerze, projekty na dysku, LumoBot nie ma chmury; zawsze z dopiskiem, że do wybranego dostawcy AI trafia treść zadania (z modelem lokalnym nic). Blok czesci/bezpieczenstwo.html.
- LICENCJA (decyzja użytkownika 20.11): do 30.12.2026 za darmo dla wszystkich; od 31.12.2026 praca komercyjna (firma, pracownik, freelancer i JDG przy płatnych zleceniach, agencja) wymaga licencji; prywatnie, nauka i open source zawsze 0 zł. Cen NIE wymyślamy: "ogłosimy przed 31 grudnia 2026". Serwer zespołowy: w planach. Strony: firmy.html, cennik.html (przełącznik Prywatnie/Firma), dokumentacja (sekcja Licencja).
- Pasek (decyzje użytkownika 21.11): styl x.ai z ruchem: wejście z rozmyciem, zakładki w szklanej kapsule NA ŚRODKU okna z pigułką jadącą pod kursorem, szkło i zwężenie po przewinięciu, karta menu na środku zmienia rozmiar między zakładkami, Pobierz i PL jak dawniej (białe pigułki). .site-nav-track ma backdrop-filter, więc musi mieć z-index 1 nad .site-nav-surface, inaczej treść menu znika. Kopia sprzed zmian: .lumobot/kopie/pasek-przed-xai/.
- Warstwy mrugania logo (img/logo-cialo.png, logo-oczy.png) robi narzedzia/logo_warstwy.py (nie stara funkcja z nowe_logo.py); środek mrugnięcia transform-origin 50% 50%.
- Strony vs (v30, tylko .spo-wrap z .pj-rv; NIE samo .vs-page, bo to psuje Dokumentację): góra jak openbot.run/compare: tytuł i opis z lewej, karta z logo obu stron z prawej (od 1000 px), pod opisem data sprawdzenia i link Źródła (#zrodla).
- Panel O nas zostaje z Bezpieczeństwem i Zgłoś pomysł (użytkownik: "i coś tam jeszcze" oraz przeniesienie listy ze Świata AI).
- GRADIENTY (karty Cennika i Firm mają kolorowy pasek gradientu u góry): żaden nie ma czerni (najciemniejszy kolor co najmniej 46% jasności (minLight 0.46), zabezpieczenie minLight w grain.js); gradient wypełnia cały box. history.replaceState tylko na http(s).
- Kontakt (decyzja użytkownika 22.11): e-mail kontakt@lumobot.eu jako link mailto w dolnym wierszu stopki (czesci/dol.html, .dl-mail w dol.css, ten sam rozmiar co prawa autorskie) i w sekcji Napisz do nas na /o-nas/.
- O nas: strona /o-nas/ (baner, Co robimy, Jak myślimy, Napisz do nas, 6 kart z karty.py ONAS); link O nas w pasku prowadzi tutaj.
- Status: uczciwy, bez udawanego monitoringu na żywo (wersja, dane lokalne, aktualizacje GitHub, dostawcy AI z linkami do ich stron statusu).
- Dokumentacja: pytania w prawej kolumnie (nie pod przyklejonym spisem treści), poniżej 900 px spis jako poziomy pasek; własna treść (struktura w duchu README OpenBota, bez kopiowania), spis treści z lewej, 17 sekcji, fakty tylko ze stron LumoBota.
- Banery 1:1 na każdej podstronie: szablon vs (1032x320 na 120 px, telefon 358x200), okruszek, h1.vs-title, lead; 64 px do treści; każdy baner w innym kolorze. Strony z banerem dostają w zloz.py styl sekcja-pojedynki.
- OpenBot: zawsze prawdziwe logo img/rywale/openbot.svg (biały kafelek z oczami) w ciemnym kafelku jak inni rywale.
- Porównania: na górze stron vs blok "W skrócie" (6 kafelków z faktami ze strony), potem "Porównanie punkt po punkcie"; /porownanie/: baner z rywalami, Braki i Pytania w siatce jak na głównej, 6 kart porównań.
- Świat AI: wyróżniona karta i karty z okładkami Palety (strona/img/ai/), sekcja "W co wierzymy".
- Dziennik: lewa kolumna (szukaj, filtry 2x2, wersje z datą), plakietka NAJNOWSZA jasnoniebieska, baner w fiolecie karty Aktualizacje.
- Wiązka Laser Flow (js/waz.js) na każdej stronie, wodospad 330 px nad LUMO wszędzie; nie wyłączać.
- Ikona Linuksa: własny rysunek pingwina. Pytania wszędzie 1:1 jak na głównej (css/pytania.css).
- Styl Apple: tło #1a1a1a, napisy #f5f5f7, niebieski #2f62e8 tylko na głównych przyciskach, bez ramek. Sekcja 0 zł na głównej i stopka: nie ruszać.
- Zespół: Lupa i Pion na Claude Haiku 5.5 (wysiłku nie da się ustawić poleceniem lumo agent); Paleta, Zwiad, Forma, Kreska na Gemini; Pióro, Radar, Weryfikator na GPT-5.6 Luna.

- Przekierowania na Vercelu tylko w vercel.json (redirects): /pobierz na najnowszy instalator z GitHuba, /agenci na główną. Plik strona/_redirects (Netlify) Vercel ignoruje.
- Znane, nienaprawione: niepełne tłumaczenia EN/ES/RU (część tekstów i menu na telefonie po polsku), w RU cena w złotych i ucięty nagłówek hero przy 1440 px (raport Lupy 22.11).

## Czego nie ruszać
- strona/*.html i strona/X/index.html są generowane: zmieniaj czesci/, szablony/ i generatory, potem zloz.py. strona/app/ i js/agenci.js generuje zbuduj_app.py.
- Archiwa: .lumobot/archiwum-agenci-20261120/, archiwum-pytania-20261120/, archiwum-naglowki-20261120/.

## Co się nie udało
- Publikacja (24.11): repo bongodelacz/lumobot-www, push na main sam wdraża stronę na Vercel (projekt lumobot-strona, katalog strona/). Ręczne vercel deploy nie jest potrzebne. Panel admina jest w repo lumobot-panel.
- Indeks gita naprawiony 21.11 (usunięcie .git/index i git reset; stary w .lumobot/kopie/git-index-uszkodzony).
- Agenci na GPT-5.6 Luna (Pióro, Radar, Weryfikator) kończyli się błędem "expected str ... NoneType".
- Jedno zadanie pozwala na najwyżej 24 zlecenia; lumo czekaj przerywa koniec sesji (czekać w tle pętlą).
- Na zrzucie całej strony (--cala) pole wiązki nad stopką wychodzi puste (WebGL poza ekranem).
