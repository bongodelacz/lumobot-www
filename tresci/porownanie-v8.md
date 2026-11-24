# Porównanie LumoBota z konkurencją, fakty v8

Stan sprawdzenia: 19 listopada 2026. Ceny, limity, modele i dostępność mogą się zmieniać. Dane o konkurentach pochodzą z oficjalnych stron producentów. Gdy strona nie podaje informacji, wpisuję „brak danych”.

| Narzędzie | Platformy i miejsce pracy | Modele, plan AI i cena | Zespół oraz sprawdzanie | Prywatność | Największa przewaga | Największe ograniczenie |
|---|---|---|---|---|---|---|
| LumoBot | Windows 10 i 11, folder na komputerze; model może działać lokalnie lub w chmurze | 14 dostawców, 158 modeli, Ollama i LM Studio; 0 zł za aplikację, koszt planu lub klucza osobno | Lider i specjaliści, polecenie sprawdzające, niezależny sprawdzający i Neuro | Dane projektu w lokalnym folderze, hasła szyfrowane lokalnie; treść zadania może trafić do wybranego dostawcy modelu | Sprawdzony koniec zadania, polski głos, punkty powrotu git, wybór dostawcy | Tylko Windows, komputer musi działać, brak aplikacji mobilnej i chmury 24/7 |
| OpenBot | macOS, Windows, Linux, iPhone, Android; lokalnie albo na serwerze zarządzanym | Codex, Claude, Gemini, Grok, OpenCode, Cursor, Cline, Muse Code, Pi, Mercury, ACP, Ollama, LM Studio; 0 EUR prywatnie, serwer 30, 50 lub 100 EUR/mies., licencja do pracy 10 lub 25 EUR/mies. | Agenci przekazują sobie pracę, pliki i wyniki, możliwe kroki zatwierdzania | Plan osobisty przechowuje obszary robocze, rozmowy, pliki i dane przeglądarki na własnym komputerze; serwer oznacza pracę w chmurze | Najszerszy wybór platform, telefon, serwer 24/7 i współpraca ludzi z agentami | Serwer i licencja komercyjna kosztują, a wersja osobista jest niekomercyjna |
| Grok Bot | macOS, Windows, Linux, iOS, Android, X, Slack, Teams i spotkania; głównie komputer w chmurze | Model dobierany automatycznie przez SpaceXSI lub dostawcę z listy podprocesorów; Premium 30, Super 100, Ultra 200 USD/mies. | Boty działają równolegle, przekazują sobie pracę i pracują z zespołem; Auto Review i zgody dla wrażliwych akcji | Szyfrowanie w tranzycie i w spoczynku, opt-out z trenowania; wszystkie Boty użytkownika dzielą jeden komputer, pliki, przeglądarkę i logowania w chmurze | Praca po zamknięciu laptopa, telefon, Slack, Teams i spotkania | Nie wybierasz ani nie widzisz modelu, a dane i logowania trafiają do wspólnego komputera w chmurze |
| Claude Cowork | Claude Desktop na macOS, Windows i Linux w becie, web, telefon, Chrome; sesje w chmurze, dostęp do plików lokalnych przez aplikację | Modele Anthropic Claude, między innymi Opus, Sonnet, Haiku i Fable; Pro 20 USD/mies. lub 17 USD przy płatności rocznej, Max 100, Ultra 200, Team i Enterprise | Podagenci i równoległe strumienie pracy; tryby ręcznej zgody, automatycznej zgody i pominięcia, bez stałego niezależnego sprawdzającego | Sesje chmurowe i pliki są zapisane na koncie Claude, sesje lokalne mają historię na komputerze; Anthropic ostrzega przed prompt injection | Chmura po zamknięciu laptopa, dokumenty, arkusze, slajdy, harmonogramy i administracja firmowa | Tylko ekosystem Anthropic, dostęp wymaga płatnego planu, automatyczna kontrola może przeoczyć ryzykowną akcję |
| Manus | Web, Windows, macOS, iOS, Android; domyślnie chmura, opcjonalnie Manus Studio lokalnie i Cloud Computer | Manus 2.0 Lite, 2.0, 2.0 Max oraz wiele modeli mediów, między innymi Google, OpenAI, ByteDance, MiniMax, ElevenLabs i Tripo; Free 0 USD, Pro 20, Max 200 USD/mies. | Zadania równoległe, automatyzacje i zespoły; tryby Ask for approval, Approve for me i Full access, brak danych o stałym niezależnym sprawdzającym | Planowanie odbywa się w chmurze, treść czytanych plików staje się częścią zadania; Studio może uruchamiać pracę na komputerze lokalnym | Automatyzacje po zdarzeniach, Cloud Computer, tworzenie stron, dokumentów, grafiki, wideo i gier | Kredyty ograniczają pracę, a lokalny tryb nadal wysyła treść zadania do chmury |
| OpenClaw | macOS, Windows, Linux, WSL2, iOS i Android jako węzły; komputer lub własny serwer, dostęp przez komunikatory | Dowolny skonfigurowany dostawca hostowany albo lokalny, w tym dostawcy z katalogu i usługi lokalne; bez subskrypcji i hostowanego planu, płacisz dostawcy modelu | Jeden Gateway, wiele kanałów, routing wielu agentów i wspólny multiplayer claw; brak danych o stałym sprawdzaniu wyniku | Pamięć, stan i poświadczenia są na sprzęcie użytkownika; prompty trafiają do wybranego dostawcy i komunikatora, domyślnie tylko kontrola wersji | Otwarty kod MIT, własny sprzęt, ponad 20 kanałów, brak abonamentu i brak usługi pośredniej | Samodzielna instalacja i zabezpieczenie, własne koszty API, Gateway nie jest granicą dla wzajemnie wrogich użytkowników |
| Devin | Web i chmura, Devin Cloud, CLI oraz praca na komputerze; własne maszyny wirtualne Windows, macOS i Linux do testów | SWE-2, modele OpenAI, Claude, Gemini, SpaceXAI i open source; Free 0, Pro 20, Max 200, Teams 80 USD/mies., Enterprise na umowę | Devin Bots i sesje równoległe, Slack, Teams, Jira i Linear; testy, PR, CI oraz Devin Review z błędami i lukami | Domyślnie brak trenowania na kodzie i danych klienta, a dedykowane wdrożenia trzymają dane w dzierżawie klienta | Specjalizacja w programowaniu, PR-y, przegląd kodu, testy w przeglądarce i praca bez włączonego laptopa | Najlepszy głównie do inżynierii oprogramowania, a większe limity i praca zespołowa wymagają płatnego planu |

## 1. LumoBot

### Czym jest i gdzie działa

LumoBot to aplikacja na Windows, w której zespół agentów pracuje w folderze projektu. W plikach projektu wymienione są Windows 10 i 11. Praca z plikami jest lokalna, ale wybrany model może działać przez usługę w chmurze albo lokalnie przez Ollamę i LM Studio.

### Modele, dostawcy, plan i cena

- Lista LumoBota ma 14 dostawców AI i 158 modeli.
- W treściach wymieniono między innymi Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, Antigravity, OpenCode, Cursor, Ollamę i LM Studio. Nie dopisuję pozostałych nazw, bo nie ma ich w sprawdzonych treściach.
- Można podłączyć plan, który użytkownik już ma, klucz API albo model lokalny. Ollama i LM Studio działają bez klucza.
- Cena aplikacji: 0 zł. Koszt planu zewnętrznego, klucza API albo sprzętu do modelu lokalnego jest osobny.

### Zespół, sprawdzanie i prywatność

- Lider dzieli zadanie, a agenci specjalistyczni pracują nad częściami. Jedno zadanie może mieć osobnego autora i osobnego sprawdzającego.
- Zadanie kończy polecenie sprawdzające, na przykład testy, albo niezależny sprawdzający, a nie samo zdanie agenta „gotowe”.
- Neuro uczy się na zakończonych zadaniach i szacuje szansę dojścia do celu. W ustawieniach opisano też hamulec Neuro po dwóch niskich ocenach, gdy sieć ma co najmniej 60 przykładów.
- Projekt leży w lokalnym folderze. Hasła są szyfrowane na komputerze i nie trafiają do modelu. Przy modelu chmurowym treść potrzebna do zadania może trafić do wybranego dostawcy, dlatego „lokalnie” nie oznacza, że każdy prompt omija sieć.
- Każde zadanie może pracować na osobnej gałęzi git z punktami powrotu. LumoBot nie publikuje zmian sam.

### Mocne i słabe strony

**LumoBot wygrywa, gdy:**

- użytkownik chce wybrać dostawcę i model, także lokalny;
- „gotowe” ma znaczyć „sprawdzone”, a nie tylko „agent tak napisał”;
- potrzebne są polska rozmowa głosowa, wyspa na pulpicie i własna przeglądarka;
- ważny jest powrót do punktu w git i praca za 0 zł za aplikację.

**LumoBot musi nadgonić, gdy:**

- potrzebna jest aplikacja mobilna albo praca po wyłączeniu komputera;
- zespół ludzi ma pracować na jednym koncie i wspólnym kanale;
- użytkownik oczekuje serwera 24/7, gotowych integracji firmowych albo wersji na macOS i Linux.

### Źródła lokalne, sprawdzone 2026-11-19

- `strona/czesci/sekcja-kolo.html`, 14 dostawców i 158 modeli;
- `strona/czesci/sekcja-neuro.html`, wybór dostawcy, modele lokalne i Neuro;
- `strona/app/index.html`, wyspa, głos, punkty powrotu, dane lokalne i ustawienia sprawdzającego;
- `strona/czesci/strona-porownanie.html` oraz `strona/czesci/strona-vs-*.html`, platforma, cena, model pracy i ograniczenia;
- `tresci/fakty-v5.md`, `tresci/kolo-v7.md`, `tresci/teksty.md`, `tresci/konkurencja.md`.

## 2. OpenBot

### Czym jest i gdzie działa

OpenBot to aplikacja dla zespołu agentów, którzy mają własne role, obszary robocze i mogą przekazywać sobie zadania. Oficjalna strona podaje macOS, Windows, Linux, iPhone i Android. Działa lokalnie na własnym komputerze, a dla zespołów może działać na serwerze zarządzanym.

### Modele, plan i cena

- Oficjalna lista wymienia Codex, Claude, Gemini, Grok, OpenCode, Cursor, Cline, Muse Code, Pi, Mercury, agentów ACP, endpoint zgodny z OpenAI, Ollamę i LM Studio.
- OpenBot pozwala używać planu AI, za który użytkownik już płaci. Model można zmienić bez utraty obszaru roboczego i rozmowy.
- Użytek osobisty na własnym komputerze kosztuje 0 EUR.
- Serwer hostowany: Starter 30 EUR/mies., Standard 50 EUR/mies., Pro 100 EUR/mies. Cennik pokazuje też licencję do pracy: Starter 10 EUR/mies. i Team 25 EUR/mies. Do 1 grudnia 2026 licencja jest oznaczona jako bezpłatna.
- Nie ma danych o osobnej opłacie za plan AI używany w lokalnej aplikacji, bo OpenBot kieruje do planów już posiadanych przez użytkownika.

### Zespół, sprawdzanie i prywatność

- Agenci piszą do siebie, przekazują zadania, udostępniają pliki i sprawdzają wyniki.
- Przepływy pracy mają kroki zatwierdzania, więc użytkownik może zatwierdzić publikację lub inną akcję.
- Plan osobisty przechowuje obszary robocze, rozmowy, załączniki i dane przeglądarki na komputerze, na którym działa OpenBot.
- Wariant dla zespołów działa na zarządzanym serwerze, także po wyłączeniu laptopa. Wtedy praca odbywa się na infrastrukturze usługi, nie tylko lokalnie.

### Mocne i słabe strony

**OpenBot wygrywa, gdy:**

- użytkownik potrzebuje macOS, Linuxa, telefonu albo wspólnego kanału dla ludzi i agentów;
- praca ma trwać całą dobę na serwerze;
- potrzebny jest szeroki wybór dostawców, w tym modele lokalne;
- zespół chce gotowych przepływów z zatwierdzeniami.

**OpenBot przegrywa z LumoBotem, gdy:**

- najważniejsze jest obowiązkowe, niezależne potwierdzenie celu przez test lub sprawdzającego;
- użytkownik chce wyłącznie lokalnej pracy bez serwera i bez licencji komercyjnej;
- priorytetem jest polska rozmowa głosowa, której oficjalne strony OpenBota nie potwierdzają osobno.

### Źródła oficjalne, sprawdzone 2026-11-19

- https://openbot.run/
- https://openbot.run/pl/pricing
- https://openbot.run/pl/teams
- https://openbot.run/download
- https://github.com/nightly-labs/openbot

## 3. Grok Bot

### Czym jest i gdzie działa

Grok Bot to bot AI dla zespołu, który ma własny komputer w chmurze, loguje się do narzędzi i prowadzi pracę do gotowego wyniku. Oficjalne strony podają aplikację desktopową na macOS, Windows i Linux, aplikacje iOS i Android, X, Slack, Microsoft Teams oraz udział w Google Meet, Zoom i Teams.

### Modele, plan i cena

- Grok Bot sam wybiera model dla zadania. Dokumentacja mówi, że może użyć modelu SpaceXSI albo modelu z listy podprocesorów, ale użytkownik nie wybiera modelu i nie widzi jego nazwy przy żądaniu.
- Własny plan AI można powiązać tylko w granicach obsługiwanych planów X, Grok lub Cursor, między innymi SuperGrok, X Premium+ i starsze plany Cursor. Nie ma danych o użyciu dowolnego własnego klucza API.
- Premium kosztuje 30 USD/mies., Super 100 USD/mies., a Ultra 200 USD/mies. Super ma 3,5 razy większe użycie Premium, Ultra 12 razy większe.
- Grok Bot jest także zawarty w kwalifikujących się planach X Subscription i Cursor. Po wyczerpaniu puli może pojawić się dodatkowe rozliczanie użycia.

### Zespół, sprawdzanie i prywatność

- Boty pracują równolegle, przekazują sobie zadania i mogą być wspólnie używane przez zespół.
- Wrażliwe akcje mogą przejść przez Auto Review albo zatrzymać się do zgody użytkownika. Nie ma danych o stałym, niezależnym sprawdzającym końcowego wyniku każdego zadania.
- Praca odbywa się na trwałym komputerze w chmurze. Zamknięcie aplikacji, laptopa albo telefonu nie zatrzymuje zadania.
- Wszystkie Boty jednego użytkownika dzielą ten sam komputer, pliki, sesje przeglądarki i logowania, więc nie są osobnymi granicami bezpieczeństwa.
- Oficjalna strona podaje szyfrowanie danych w tranzycie i w spoczynku oraz możliwość rezygnacji z trenowania na danych.

### Mocne i słabe strony

**Grok Bot wygrywa, gdy:**

- agent ma pracować po zamknięciu laptopa;
- zespół chce używać Botów w Slacku, Teams, X i na spotkaniach;
- potrzebny jest telefoniczny dostęp do tych samych Botów;
- użytkownik chce gotowych Botów, rutyn i pracy 24/7.

**Grok Bot przegrywa z LumoBotem, gdy:**

- użytkownik chce sam wybrać dostawcę i model albo użyć modelu lokalnego;
- pliki i logowania mają zostać wyłącznie na własnym komputerze;
- potrzebna jest osobna granica bezpieczeństwa między agentami;
- użytkownik nie chce płacić abonamentu od 30 USD/mies.

### Źródła oficjalne, sprawdzone 2026-11-19

- https://x.ai/bot
- https://docs.x.ai/grok-bot/faq
- https://docs.x.ai/grok-bot/approvals-security-and-privacy
- https://docs.x.ai/grok-bot/team-bots
- https://docs.x.ai/grok-bot/mobile

## 4. Claude Cowork

### Czym jest i gdzie działa

Claude Cowork to agentowy tryb Claude, który przenosi architekturę Claude Code poza programowanie: planuje wieloetapowe zadania, dzieli je na części i oddaje dokumenty, pliki, badania lub prezentacje. Działa w Claude Desktop na macOS, Windows i Linuxie w becie, a także na webie, telefonie i w panelu Claude in Chrome. Sesje chmurowe działają po zamknięciu laptopa.

### Modele, plan i cena

- Cowork korzysta z modeli Anthropic Claude, a strona planów wymienia między innymi Opus, Sonnet, Haiku i Fable. Nie ma obsługi modeli innych dostawców w samym Cowork.
- Cowork jest dostępny tylko w płatnych planach Pro, Max, Ultra, Team i Enterprise.
- Pro kosztuje 20 USD/mies. przy płatności miesięcznej albo 17 USD/mies. przy płatności rocznej, Max 100 USD/mies., Ultra 200 USD/mies. Ceny Team i Enterprise zależą od planu organizacji, brak jednej kwoty na stronie Cowork.
- Nie ma danych o podłączeniu dowolnego własnego planu AI. Potrzebny jest płatny plan Claude.

### Zespół, sprawdzanie i prywatność

- Cowork może koordynować podagentów i równoległe strumienie pracy. W planach Team i Enterprise administrator może zarządzać dostępem.
- Użytkownik wybiera tryb ręcznej zgody, automatycznej zgody albo pominięcia. W Auto działa automatyczna kontrola bezpieczeństwa, ale Anthropic wprost zaznacza, że może przeoczyć ryzykowną akcję.
- Nie ma danych o niezależnym sprawdzającym, który zawsze potwierdza osiągnięcie celu przed zakończeniem.
- Sesje chmurowe i pliki są zapisane na koncie Claude. Sesje lokalne zapisują historię na komputerze użytkownika. Dostęp do lokalnych plików wymaga uruchomionej aplikacji desktopowej.
- Producent ostrzega przed prompt injection, ograniczaniem dostępu do wrażliwych plików i skutkami automatycznej zgody.

### Mocne i słabe strony

**Claude Cowork wygrywa, gdy:**

- praca dotyczy dokumentów, arkuszy, prezentacji i badań;
- zadanie ma działać dalej w chmurze po zamknięciu komputera;
- firma potrzebuje planów Team lub Enterprise, logów, zgodności i ustawień administratora;
- użytkownik chce gotowe harmonogramy, projekty i współdzieloną pamięć Claude.

**Claude Cowork przegrywa z LumoBotem, gdy:**

- jeden zespół ma łączyć wielu dostawców i modele lokalne;
- koniec zadania ma wyznaczać test lub niezależny sprawdzający;
- użytkownik nie chce płatnej subskrypcji Anthropic;
- kluczowa jest lokalna praca bez wysyłania treści zadania do chmury.

### Źródła oficjalne, sprawdzone 2026-11-19

- https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork
- https://support.claude.com/en/articles/13455879-use-cowork-on-team-and-enterprise-plans
- https://support.claude.com/en/articles/13364135-use-claude-cowork-safely
- https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview
- https://claude.com/pricing

## 5. Manus

### Czym jest i gdzie działa

Manus to agent do wykonywania projektów, automatyzacji, badań, dokumentów, stron, kodu, grafiki, wideo i gier. Jest dostępny w webie, na Windowsie i macOS oraz na iOS i Androidzie. Domyślnie używa chmury, ale Manus Studio może pracować lokalnie z plikami, terminalem i aplikacjami. Cloud Computer jest osobnym, trwałym komputerem w chmurze.

### Modele, plan i cena

- Manus może dobrać model do zadania albo pozwolić wybrać go samodzielnie.
- Oficjalna lista wymienia Manus 2.0 Lite, 2.0 i 2.0 Max oraz modele dostawców: ByteDance Seedance, Google Veo i Gemini, MiniMax H3, Google Nano Banana i Lyria, OpenAI GPT Image, ElevenLabs i Tripo.
- Free kosztuje 0 USD i daje 300 kredytów dziennie. Pro kosztuje 20 USD/mies. i daje 4 000 kredytów miesięcznie. Max kosztuje 200 USD/mies. i daje 40 000 kredytów miesięcznie.
- Plan Pro ma Manus Flex, czyli użycie własnych kluczy. To potwierdza możliwość użycia własnego planu lub klucza w określonym mechanizmie, ale nie oznacza dowolnego planu w każdej funkcji.

### Zespół, sprawdzanie i prywatność

- Manus obsługuje zadania równoległe, automatyzacje po czasie lub zdarzeniu oraz w Manus 2.0 opisuje grupy agentów w Cue. Brak danych, że każda zwykła sesja Manus ma stałego Lidera.
- Studio ma trzy tryby zgody: Ask for approval, Approve for me i Full access. To kontrola działań, nie niezależne sprawdzanie celu.
- Brak danych o stałym niezależnym sprawdzającym końcowego wyniku każdego zadania w aktualnej dokumentacji Studio. Strona projektu wskazuje osobne narzędzia, takie jak sprawdzanie faktów, ale nie opisuje ich jako obowiązkowego etapu.
- Manus planuje zadania w chmurze. Gdy czyta plik, treść pliku staje się częścią zadania. Lokalny tryb uruchamia komendy na komputerze, ale planowanie i model nadal mogą działać w chmurze.
- Cloud Computer zostaje włączony po zamknięciu laptopa. Manus Studio na własnym komputerze działa tylko, gdy komputer i Studio są uruchomione.

### Mocne i słabe strony

**Manus wygrywa, gdy:**

- potrzebne są automatyzacje po mailu, kalendarzu, Slacku lub innym zdarzeniu;
- użytkownik chce Cloud Computer działający całą dobę;
- trzeba tworzyć nie tylko kod, ale także strony, slajdy, obrazy, muzykę, wideo i gry;
- potrzebne są aplikacje mobilne i zdalne sterowanie komputerem.

**Manus przegrywa z LumoBotem, gdy:**

- użytkownik nie chce rozliczania w kredytach;
- chce sam widzieć i wybierać dostawcę każdego modelu;
- potrzebuje testów, niezależnego sprawdzającego i punktów powrotu git jako stałej części pracy;
- chce pracować lokalnie bez wysyłania treści folderu do chmury.

### Źródła oficjalne, sprawdzone 2026-11-19

- https://manus.im/pricing
- https://manus.im/pl/models
- https://manus.im/en/blog/introducing-manus-2-0
- https://manus.im/docs/features/desktop.md
- https://manus.im/docs/introduction/plans.md
- https://help.manus.im/en/articles/15392111-what-is-the-cloud-computer

## 6. OpenClaw

### Czym jest i gdzie działa

OpenClaw to otwartoźródłowy osobisty asystent, który działa na komputerze użytkownika i odpowiada przez komunikatory. Oficjalne aplikacje i instalatory obejmują macOS, Windows, Linux i WSL2, a iOS i Android działają jako węzły. Jeden Gateway może łączyć web, CLI, aplikację i kanały takie jak WhatsApp, Telegram, Discord, Slack, Teams, Signal, iMessage i Google Chat. Można uruchomić go na własnym komputerze albo serwerze.

### Modele, plan i cena

- OpenClaw nie ogranicza się do jednego dostawcy. Dokumentacja opisuje wybór modelu w formacie `provider/model`, listę dostawców, własne endpointy oraz lokalne usługi modeli.
- Oficjalne materiały mówią o modelach hostowanych i lokalnych. Konkretna lista zależy od konfiguracji, dlatego nie dopisuję pełnego katalogu nazw.
- Brak subskrypcji, hostowanego planu i tokena OpenClaw. Płaci się dostawcy modelu, jeśli wybrany model ma opłatę za API.
- Można użyć własnego planu lub klucza dostawcy, a także lokalnego modelu. OpenClaw wymaga dostępu do modelu, nie sprzedaje własnego planu AI.

### Zespół, sprawdzanie i prywatność

- Gateway ma routing wielu agentów, osobne przestrzenie i sesje oraz tryb wspólnego multiplayer claw dla zespołu.
- Oficjalna dokumentacja nie opisuje stałego niezależnego sprawdzającego wyniku. Udostępnia `openclaw security audit`, zasady narzędzi, listy dozwolonych osób i parowanie kanałów.
- Stan, pamięć i poświadczenia są na sprzęcie użytkownika. Prompty trafiają do skonfigurowanego dostawcy modelu i platformy czatu. Domyślnie OpenClaw wykonuje kontrolę wersji, a anonimowe statystyki są opcjonalne.
- Dokumentacja ostrzega, że jeden Gateway zakłada jedną zaufaną granicę. Nie jest granicą dla wzajemnie wrogich użytkowników korzystających ze wspólnego Gateway.

### Mocne i słabe strony

**OpenClaw wygrywa, gdy:**

- użytkownik chce otwartego kodu na licencji MIT i pełnej kontroli nad sprzętem;
- potrzebuje pisać do agenta z WhatsAppa, Telegrama, Discorda, Slacka, Teams lub innego kanału;
- chce użyć wielu dostawców, własnych endpointów albo modeli lokalnych bez abonamentu;
- umie samodzielnie zainstalować Gateway, Node i zabezpieczyć kanały.

**OpenClaw przegrywa z LumoBotem, gdy:**

- użytkownik chce instalator i gotową aplikację bez konfiguracji w terminalu;
- zadanie ma kończyć się obowiązkowym testem lub niezależnym sprawdzającym;
- potrzebny jest polski głos i wyspa z podglądem pracy bez budowania własnej konfiguracji;
- odpowiedzialność za Gateway, klucze, dodatki i bezpieczeństwo ma przejąć producent.

### Źródła oficjalne, sprawdzone 2026-11-19

- https://openclaw.ai/
- https://docs.openclaw.ai/
- https://docs.openclaw.ai/concepts/models
- https://docs.openclaw.ai/gateway/security
- https://github.com/openclaw/openclaw

## 7. Devin

### Czym jest i gdzie działa

Devin to autonomiczny inżynier oprogramowania, który planuje, pisze, uruchamia i testuje kod, a następnie przygotowuje pull request. Devin działa w chmurze, ma CLI i tryb pracy na komputerze, a własne środowiska wirtualne mogą uruchamiać Windows, macOS i Linux do testów w przeglądarce. Devin Bots mogą pracować cały czas i przyjmować zadania ze Slacka lub Teams.

### Modele, plan i cena

- Oficjalna strona wymienia SWE-2 oraz dostęp do modeli OpenAI, Claude, Gemini, SpaceXAI i czołowych modeli open source. Dostępny model zależy od planu i limitu.
- Plan Pro i Max pozwala użyć planu ChatGPT. Nie ma danych, że można podłączyć dowolny własny klucz lub dowolny plan każdego dostawcy.
- Free kosztuje 0 USD/mies. i ma mały limit pracy agentów. Pro kosztuje 20 USD/mies., Max 200 USD/mies., Teams 80 USD/mies. i obejmuje do 100 użytkowników, a Enterprise jest na umowę.
- Po wyczerpaniu limitu plan płatny może kupić dodatkowe użycie według stawek API.

### Zespół, sprawdzanie i prywatność

- Devin Bots dzielą pracę na równoległe agentowe zadania. Plan Teams daje współdzielenie i współpracę w sesjach multiplayer, a Devin można oznaczać w Slacku i Teams.
- Devin sprawdza kod przez testy, CI, działający pull request, testy w przeglądarce i Devin Review. Review grupuje zmiany i wskazuje błędy, problemy bezpieczeństwa i potencjalne luki.
- Domyślnie Cognition nie trenuje modeli na kodzie ani danych klienta. Dla wdrożeń dedykowanych dane klienta pozostają w jego dzierżawie.
- Przy integracjach administrator wybiera repozytoria i uprawnienia. W aplikacji web Devin przetwarza dane aktywnie przekazane przez użytkownika.
- Dokumentacja ostrzega, że Devin może wprowadzić błąd lub niebezpieczną zmianę, dlatego zaleca code review i ochronę gałęzi.

### Mocne i słabe strony

**Devin wygrywa, gdy:**

- firma ma backlog w GitHubie, GitLabie, Jira lub Linearze;
- potrzebne są pull requesty, testy, przegląd kodu, skany bezpieczeństwa i automatyzacje;
- zadania mają działać równolegle w chmurze po zamknięciu laptopa;
- firma wymaga SSO, SCIM, kontroli kosztów, VPC lub dedykowanego wdrożenia.

**Devin przegrywa z LumoBotem, gdy:**

- użytkownik chce jeden lokalny program do kodu, tekstów, obrazów i innych zadań;
- ważny jest wybór własnego dostawcy i modelu lokalnego;
- potrzebna jest polska rozmowa głosowa, wyspa i punkty powrotu git w jednym programie;
- użytkownik nie chce płacić za większe limity i pracę zespołową.

### Źródła oficjalne, sprawdzone 2026-11-19

- https://devin.ai/
- https://devin.ai/pricing
- https://docs.devin.ai/get-started/devin-intro
- https://docs.devin.ai/work-with-devin/devin-review
- https://docs.devin.ai/enterprise/security-access/security/enterprise-security
- https://cognition.com/legal/data-processing-statement
