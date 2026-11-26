# LumoBot: wszystko o aplikacji (dla dewelopera strony)

Ten dokument jest dla osoby, która robi stronę lumobot.eu, i dla jej AI. Opisuje, czym jest LumoBot, co naprawdę umie, czego nie umie, jaki ma model cenowy i co jest dopiero w planach. Na stronie wolno pisać tylko to, co jest w części „Jest teraz”. Rzeczy z części „W planach” zawsze oznaczaj jako plany.

Stan: wersja **0.28.8**, 26 listopada 2026. Kod aplikacji jest w osobnym, prywatnym repozytorium. Nie masz do niego dostępu i nie jest ci potrzebny.

---

## 1. LumoBot w trzech zdaniach

LumoBot to aplikacja na Windows, w której pracuje zespół agentów AI. Użytkownik pisze zwyczajnie, co ma być zrobione, a agent robi to na jego komputerze: w plikach, w przeglądarce, w poczcie, na portalach. LumoBot pilnuje, żeby praca była naprawdę skończona: wynik sprawdza osobny, niezależny sprawdzający, a agent poprawia, dopóki sprawdzenie nie przejdzie.

LumoBot **nie ma własnego modelu AI**. Korzysta z AI, które użytkownik już ma: subskrypcji (Claude, ChatGPT), klucza API albo modelu działającego lokalnie.

---

## 2. Cennik i licencja (stan ustalony przez właściciela)

| Kto | Ile | Od kiedy |
|---|---|---|
| Użytek prywatny i niekomercyjny (nauka, własne projekty, open source) | **0 zł**, wszystkie funkcje | zawsze |
| Firmy, praca komercyjna | **0 zł do 30 grudnia 2026** | teraz |
| Firmy, praca komercyjna | **licencja komercyjna** | **od 31 grudnia 2026** (cena zostanie ogłoszona przed tą datą) |
| Koszt AI | płaci się bezpośrednio dostawcy AI, z którego korzysta użytkownik; LumoBot nic nie dolicza | zawsze |
| Modele lokalne (Ollama, LM Studio) | 0 zł, bez klucza | zawsze |

Nie podawaj ceny licencji, dopóki właściciel jej nie ogłosi.

---

## 3. Jak to działa (prosto)

1. Użytkownik wybiera agenta i pisze zadanie, np. „zrób stronę kawiarni” albo „odpisz na maile od klientów”.
2. Agent pracuje w folderze projektu na komputerze użytkownika: czyta i zmienia pliki, uruchamia polecenia, korzysta ze swojej przeglądarki.
3. Po każdej rundzie wynik ocenia **niezależny sprawdzający** (osobne wywołanie AI albo testy projektu, gdy projekt je ma).
4. Jeśli czegoś brakuje, agent dostaje konkretne uwagi i pracuje dalej. Koniec jest wtedy, gdy sprawdzenie przechodzi, a nie wtedy, gdy agent napisze „gotowe”.
5. Zwykłe pytanie (np. „w co zainwestować 1000 zł”) kończy się po jednej konkretnej odpowiedzi, zwykle w kilkanaście sekund.

---

## 4. Funkcje, które są teraz

### Agenci i zespół
- **Agenci z rolami:** każdy ma nazwę, rolę, model AI, moc myślenia, folder pracy i wygląd (pluszowa buźka: kształt, kolor, oczy albo własne zdjęcie).
- **Paczki agentów:** osobne zespoły do różnych projektów (np. „Marketing”, „Strona”), które się nie mieszają.
- **Zespół:** agent prowadzący rozdziela pracę innym agentom, zbiera wyniki i oddaje jedną odpowiedź.
- **Pomocnicy na każdym AI:** w jednym zespole mogą pracować agenci na różnych AI (np. Claude prowadzi, a pomocnik pracuje na ChatGPT albo Gemini).
- **Praca do skutku:** rundy aż do przejścia sprawdzenia, z limitem rund.
- **Kolejka:** nowe zadanie czeka, aż skończy się bieżące, i rusza samo.
- **Wskazówki w trakcie:** można dopisać wskazówkę albo zatrzymać agenta w każdej chwili.
- **Pytanie = odpowiedź:** odpowiedź jest od razu w treści, z liczbami i uzasadnieniem, bez odsyłania do plików i linków.
- **Pamięć projektu:** plik `LUMOBOT.md` w folderze projektu, który agent czyta na starcie i uzupełnia po pracy.
- **Historia rozmów** i przekazywanie kontekstu między rozmowami.

### Przeglądarka agenta (bardzo ważna funkcja)
- Każdy agent ma **własną przeglądarkę** (Edge albo Chrome, osobny profil, bez okna). Działa także przy wyłączonym sterowaniu komputerem.
- Umie wszystko, co człowiek w przeglądarce: klikać (ruch myszy jak u człowieka), podwójny i prawy klik, przeciągać, pisać znak po znaku (podpowiedzi i hashtagi reagują), wklejać, skróty klawiszowe, wybierać z list, przewijać, czekać na napis do 10 minut, czytać stronę, robić zrzuty, pobierać pliki.
- **Wgrywanie plików** z dysku (filmy, zdjęcia, PDF), także kilku naraz, bez okna wyboru pliku.
- Działa z elementami w ramkach i Shadow DOM, a okienka „Na pewno?” zamyka sama.
- Wygląda dla stron jak zwykła przeglądarka człowieka (bez śladów automatu), a na portalach społecznościowych działa w tempie człowieka.
- **Logowanie:** użytkownik loguje się sam w oknie przeglądarki agenta. Agent nigdy nie zna haseł. Za zgodą użytkownika LumoBot może sam wpisać zapisane dane logowania (szyfrowane kontem Windows), a kody 2FA policzyć z zapisanego klucza. Captchy agent nie omija, tylko oddaje okno użytkownikowi.
- **Menedżery haseł:** 1Password i Bitwarden przez ich oficjalne programy.
- **Rozszerzenie przeglądarki „LumoBot: połącz konta”** przenosi logowanie do strony z przeglądarki użytkownika do przeglądarki agenta.
- **Naucz zadania:** użytkownik robi coś raz, LumoBot nagrywa kroki i zamienia je w umiejętność, którą agent potem powtarza.

Przykład z życia: agent sam wgrał film na TikToka, wpisał opis z hashtagami, sprawdził pole i opublikował, a całość trwała około minuty.

### Poczta, kalendarz, konta
- **Gmail:** czytanie skrzynki, szukanie, czytanie maila z adresem nadawcy, wysyłanie. Przed wysłaniem użytkownik widzi podgląd i zatwierdza (można to wyłączyć).
- Zabezpieczenia: ucięta treść nie wyjdzie, na jeden wątek idzie jeden mail na 30 minut (bez drugich maili i bez pętli z automatami).
- **Kalendarz Google** i dziesiątki serwisów (m.in. Outlook, Dysk Google, Notion, Trello, GitHub, Figma, Slack, Discord, TikTok, YouTube, Instagram), na które użytkownik loguje się w przeglądarce agenta.
- **Aplikacje i narzędzia MCP** (m.in. GitHub, Figma, Playwright, Context7, Higgsfield) łączone jednym kliknięciem.

### Tablica (plan pracy)
- Tablica z boxami. Każdy box to polecenie dla wybranego agenta.
- Wpisujesz cel jednym zdaniem, a agent rozkłada go na boxy i ustawia kolejność.
- Boxy łączą się w **łańcuch (flow)**: kolejny rusza sam, gdy poprzedni się uda, nie uda albo skończy, i dostaje wynik poprzedniego kroku.
- Na każdym boxie jest duży przycisk ze stanem: Uruchom, W toku z licznikiem czasu, Gotowe z wynikiem, Zgoda na start, Czeka na krok N.
- Box może ruszać o godzinie albo po zgodzie użytkownika. Rodzaje boxów: zadanie, pytanie, mail, webhook, Git, obraz, wiadomość do mnie.

### Terminarz (zadania o czasie)
- Tygodniowy i miesięczny widok jak plan lekcji.
- Zadania jednorazowe, codzienne, w wybrane dni, **co kilka godzin albo co kilka minut** (np. co 15 minut).
- Wyzwalacze z GitHuba: nowe zgłoszenie, nowy pull request, nieudane testy.
- Uruchamianie wpisu adresem (webhook) z innego programu.
- Agent sam dodaje wpisy, gdy użytkownik pisze np. „jutro o 8 wyślij raport”.

### Strażnicy (agent reaguje na zdarzenia)
- Użytkownik pisze w czacie np. „jak na kanale X wyjdzie nowy film, napisz mi, o czym jest” albo „pilnuj maila i odpisuj profesjonalnie”, a agent sam ustawia strażnika.
- LumoBot co kilka minut sprawdza wskazane miejsce (kanał YouTube, skrzynka Gmail, strona, cena) i uruchamia agenta tylko wtedy, gdy pojawi się coś nowego albo cena przekroczy próg.
- Sprawdzone na żywo: ustawienie strażnika zajmuje kilkanaście sekund, a reakcja na nowy film około 25 sekund.

### Telefon i komunikatory
- **Czat z telefonu przez Telegram, Discord albo Slack:** piszesz do swojego prywatnego bota, agent robi zadanie, a wynik wraca tą samą drogą.
- **LumoBot w telefonie w sieci Wi-Fi:** prosta strona z kodem QR, z rolą „zleca” albo „podgląd”.
- Powiadomienia: dźwięk, ntfy, Discord, Slack, Telegram (koniec zadania, pytanie agenta, prośba o zgodę).

### Głos
- Rozmowa głosowa z agentem albo z zespołem (przytrzymaj i mów albo otwarty mikrofon).
- Dyktowanie. Rozpoznawanie mowy działa offline (polski i angielski).
- Czytanie odpowiedzi głosami Windows albo głosami neuronowymi.

### Obrazy, strony, publikacja
- Agent od obrazów i agent projektant. Zamiana SVG albo HTML na PNG.
- Publikacja strony z folderu pod publicznym adresem (GitHub Pages na koncie użytkownika).
- Sterowanie komputerem (mysz i klawiatura). Domyślnie wyłączone, a kursor w lewym górnym rogu ekranu zatrzymuje agenta.

### Bezpieczeństwo i kontrola
- Wszystko działa na komputerze użytkownika. Serwer LumoBota słucha tylko lokalnie (`127.0.0.1`).
- Zgoda użytkownika przed rzeczami ryzykownymi: wysłanie maila, usuwanie, zmiana ustawień bezpieczeństwa i kosztów.
- **Cofnij zadanie** (pliki wracają do stanu sprzed zadania), cofnij rozmowę, punkty powrotu w git.
- Agent przepisuje wiernie NIP-y, numery kont, kwoty i daty i niczego w nich nie „poprawia”.
- Anonimowe statystyki tylko liczbowe (tokeny, model, wersja), bez treści, plików i adresów. Można je wyłączyć.

### Użycie i limity
- Wskaźnik limitu 5 godzin i tygodnia dla wybranego AI, licznik tokenów i szacowanego kosztu.
- Pula kont: kilka kont Claude albo ChatGPT. Gdy limit jednego się kończy, praca przechodzi na następne.
- Zapasowy model, gdy AI przestanie odpowiadać. Dla darmowych modeli OpenCode automatyczna zmiana na inny darmowy.
- Oszczędzanie tokenów w długich rozmowach (streszczenie kontekstu).

### Neuro
- Mała sieć neuronowa, która uczy się na zakończonych zadaniach i ocenia szansę, że zadanie dojdzie do celu. Opcjonalnie zatrzymuje zadanie, gdy szansa jest bardzo niska.

### Arsenał
- **Umiejętności:** gotowe instrukcje jednego rodzaju pracy, dodawane agentom jednym kliknięciem, także własne i import.
- **Wtyczki:** konta, aplikacje i narzędzia MCP w jednym miejscu.

### Okno i wygoda
- Zakładki: Agenci, Tablica, Arsenał, Raport, Neuro, Terminarz, Logowania, Ustawienia. Przy pierwszym uruchomieniu widać Agentów, Tablicę i Terminarz, a resztę włącza się plusem.
- Dynamiczna wyspa: mały pasek z buźkami agentów przy krawędzi ekranu, zawsze na wierzchu.
- Motyw ciemny i jasny. Języki okna: polski, angielski, niemiecki, hiszpański i ukraiński.
- Aktualizacje z poziomu aplikacji jednym kliknięciem.
- Animacja otwarcia: agent rozgląda się, a kamera wlatuje w jego oko.

---

## 5. Z jakimi AI działa

| AI | Jak się łączy |
|---|---|
| Claude (Anthropic) | oficjalny program Claude Code, logowanie na konto użytkownika |
| ChatGPT (OpenAI) | oficjalny program Codex, logowanie na konto ChatGPT |
| Gemini / Antigravity (Google) | program Antigravity |
| OpenCode | program OpenCode, ma też darmowe modele |
| Cursor | program cursor-agent |
| Grok, Gemini, Mistral, DeepSeek, Kimi, OpenRouter | klucz API użytkownika |
| Ollama, LM Studio | lokalnie, bez klucza i bez opłat |
| Własny dostawca | dowolne API zgodne z OpenAI |

Hasła do kont AI nie przechodzą przez LumoBota. Logowanie odbywa się w oficjalnym programie danego AI.

Liczby na stronie (np. „14 dostawców i 158 modeli”) zmieniają się wraz z wersjami. Przed zmianą tych liczb zapytaj właściciela o aktualne.

---

## 6. Wymagania

- Windows 10 albo 11, 64-bitowy. Instalacja dla bieżącego użytkownika, bez uprawnień administratora.
- Internet do pracy z AI w chmurze. Modele lokalne działają bez internetu.
- Co najmniej jedno podłączone AI (subskrypcja, klucz albo model lokalny).
- Instalator: `LumoBot-Setup-<wersja>.exe`. Wydania i lista zmian są na GitHubie w `bongodelacz/lumobot-releases`.
- **Pobieranie ze strony jest teraz wyłączone** (decyzja właściciela). Przekierowanie `/pobierz` w `vercel.json` prowadzi do pliku, którego obecne wydania nie zawierają. Nie dodawaj przycisku „Pobierz”, dopóki właściciel go nie włączy.

---

## 7. Czego LumoBot nie robi (nie pisz, że robi)

- Nie działa na macOS ani Linuksie. Nie ma aplikacji w sklepie na telefon (jest czat przez Telegram, Discord i Slack oraz strona w sieci Wi-Fi).
- Nie ma własnego modelu AI i nie sprzedaje dostępu do AI.
- **Dziś agenci pracują tylko wtedy, gdy komputer z LumoBotem jest włączony.** Gdy komputer śpi albo jest wyłączony, Terminarz i strażnicy czekają.
- Nie omija captchy ani zabezpieczeń kont.
- Nie wrzuca relacji (Stories) na TikToku: portal pozwala na to tylko z aplikacji na telefonie.
- W jednej paczce trwa naraz jedno zadanie (prowadzący może zlecać pracę pomocnikom), następne czekają w kolejce.

---

## 8. W planach (zawsze oznaczaj jako plany)

- **Serwery LumoBota działające 24/7:** agenci będą mogli pracować także wtedy, gdy laptop albo komputer użytkownika jest wyłączony (Terminarz, strażnicy, zadania z telefonu). Cena i szczegóły zostaną podane razem z licencją komercyjną.
- **Serwer zespołowy dla firm:** wspólna praca zespołu w jednym miejscu.
- **Licencja komercyjna od 31 grudnia 2026:** cena zostanie ogłoszona przed tą datą.

---

## 9. Ton i słowa na stronie

- Prosty polski, krótko, z perspektywy użytkownika. Bez długich myślników.
- Mówimy „agent”, „zespół agentów”, „prowadzący”, „sprawdzający”, „Tablica”, „Terminarz”, „Arsenał”, „strażnik”.
- Mocne strony do pokazywania: praca do skutku z niezależnym sprawdzeniem, własna przeglądarka agenta, która robi wszystko jak człowiek, zespół agentów na różnych AI, strażnicy reagujący na zdarzenia, wszystko na komputerze użytkownika, za darmo prywatnie.
- Każdą liczbę i każde „umie” na stronie trzeba móc pokazać w aplikacji. Gdy nie masz pewności, zapytaj właściciela.

---

## 10. Inne pliki w tym repo

- `AGENTS.md`: zasady pracy w repo (gałęzie, publikacja, sekrety).
- `ZESPOL.md`: zasady wyglądu strony.
- `LUMOBOT.md`: ustalenia projektu strony.
- `strona/`: gotowa strona (to wdraża Vercel), `strona/czesci/`: kawałki stron, `narzedzia/zloz.py`: składa strony.
