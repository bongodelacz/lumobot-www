# Zasady pracy w tym repo (dla ludzi i dla AI)

To repo to tylko strona lumobot.eu: HTML, CSS, JS, obrazy i narzędzia do składania stron. Panel admina i aplikacja LumoBot są w osobnych repozytoriach i tu ich nie ma.

Wszystko o aplikacji LumoBot (funkcje, cennik, plany, czego nie pisać) jest w `docs/LUMOBOT-O-APCE.md`. Przeczytaj go, zanim napiszesz cokolwiek o aplikacji na stronie.

## Publikacja
- Push na `main` od razu publikuje stronę: Vercel sam ją wdraża w minutę, a lumobot.eu pokazuje nową wersję.
- Większą zmianę rób na własnej gałęzi (np. `elo/nowy-cennik`). Vercel zrobi dla niej osobny podgląd pod własnym adresem, a na `main` wchodzi dopiero gotowa rzecz.
- Przed pushem na `main` obejrzyj stronę lokalnie: `uruchom.bat` albo `python narzedzia/serwer.py`.
- Przed pushem zaciągnij świeży `main` (`git pull --rebase origin main`), bo pracujemy we dwóch. Bez `git push --force` na `main`.

## Gdzie co jest
- `strona/` to gotowa strona, którą serwuje Vercel (ustawione w `vercel.json`).
- `strona/czesci/` to kawałki stron, z których `narzedzia/zloz.py` składa pliki w `strona/`.
- Przekierowania (np. `/pobierz`) są w `vercel.json`.
- Ustalenia wyglądu są w `ZESPOL.md`, a ustalenia projektu w `LUMOBOT.md`. Trzymaj się ich.

## Sekrety i dane
- Żadnych haseł, kluczy API, tokenów ani adresów baz w repo. Ta strona nie potrzebuje żadnych sekretów.
- Nie wklejaj do repo prawdziwych danych użytkowników.

## Teksty
- Prosty polski, bez długich myślników.
