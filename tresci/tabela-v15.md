# Tabela porównań v15

Stan faktów: 19 listopada 2026. Ocena `[przewaga]` jest tylko przy lepszej stronie. `[brak]` oznacza brak przewagi, także przy remisie.

### vs-openbot

**Tytuł tabeli:** LumoBot i OpenBot działają na twoim komputerze i korzystają z planów AI, które już masz. OpenBot ma też aplikacje na telefon i serwer 24/7, a licencja do pracy jest płatna od 1 grudnia 2026

#### Sprawdzony wynik

##### Sprawdzenie przed „gotowe”
LumoBot [brak]: Zadanie kończy test albo polecenie sprawdzające, a nie samo zdanie agenta „gotowe”.
OpenBot [brak]: OpenBot ma przepływy pracy, kroki zatwierdzania i sprawdzanie wyników. Od wydania 0.74.0 model sprawdza żądanie względem wykonanej pracy i odpowiedzi, a gdy część nie jest zrobiona, może kontynuować ją do trzech razy. Źródło: https://openbot.run/changelog, https://openbot.run/pl (19.11.2026).

##### Niezależny sprawdzający
LumoBot [brak]: Autor i sprawdzający mogą być osobnymi agentami, a Neuro może ocenić drogę do celu.
OpenBot [brak]: Agenci OpenBot przekazują sobie pracę, udostępniają pliki i sprawdzają nawzajem wyniki, a każdy agent ma własną rolę. Dokumentacja nie opisuje stałego sprawdzającego w każdym zadaniu, ale to nie dowodzi, że go nie da się ustawić. Źródło: https://openbot.run/pl (19.11.2026).

##### Praca do skutku po teście
LumoBot [brak]: Jeśli test nie przejdzie, agent dostaje kolejną rundę i poprawia wynik.
OpenBot [brak]: OpenBot może kontynuować nieukończoną część żądania do trzech razy. Dokumentacja nie opisuje pętli aż do przejścia ustalonego testu. Źródło: https://openbot.run/changelog (19.11.2026).

##### Neuro hamuje przed stratą tokenów
LumoBot [brak]: Neuro uczy się na zakończonych zadaniach i szacuje szansę dojścia do celu. Po dwóch niskich ocenach, gdy ma co najmniej 60 przykładów, może zahamować agenta przed spaleniem tokenów.
OpenBot [brak]: Gdy plan osiągnie limit, agent OpenBot może przejść na model zapasowy innego dostawcy. Dokumentacja nie opisuje hamulca opartego na historii zadań. Źródło: https://openbot.run/pl, https://openbot.run/llms.txt (19.11.2026).

#### Bezpieczny projekt

##### Punkt powrotu git po każdej rundzie
LumoBot [brak]: Każda runda może zapisać punkt powrotu na osobnej gałęzi git. Wracasz do wybranego stanu, a LumoBot nie publikuje zmian sam.
OpenBot [brak]: Dokumentacja OpenBot nie opisuje automatycznego punktu powrotu git. Jeden z poradników radzi poprosić agenta, żeby zachował poprzedni plik i zapisał nową wersję przed zmianami, które możesz chcieć cofnąć. Źródło: https://openbot.run/llms-full.txt (19.11.2026).

##### Hasła poza modelem
LumoBot [brak]: Hasła są szyfrowane na komputerze i nie trafiają do modelu.
OpenBot [brak]: Sejf OpenBot (Vault) trzyma loginy, karty i dane kontaktowe na twoim komputerze, zaszyfrowane przez system. Agent loguje się za ciebie, ale widzi tylko nazwę karty i cztery ostatnie cyfry. Można też podłączyć 1Password i Bitwarden. Źródło: https://openbot.run/llms-full.txt (19.11.2026).

##### Praca zespołowa bez serwera producenta
LumoBot [brak]: LumoBot pracuje w twoim folderze, także gdy zespół korzysta z lokalnych modeli.
OpenBot [brak]: Rozmowy, pliki i obszary robocze OpenBot zostają na twoim komputerze. Serwer zespołu możesz postawić sam albo wykupić serwer zarządzany, który działa 24/7. Źródło: https://openbot.run/llms.txt, https://openbot.run/pl/teams (19.11.2026).

##### 0 zł za pracę zawodową
LumoBot [przewaga]: Aplikacja kosztuje 0 zł i nie dolicza licencji za sam program ani za zespół. Płacisz tylko za wybrany plan, klucz lub sprzęt modelu lokalnego.
OpenBot [brak]: OpenBot jest darmowy do użytku osobistego i niekomercyjnego. Do pracy potrzebna jest licencja: 10 EUR miesięcznie za jedną osobę albo 25 EUR za zespół dwóch osób, bezpłatnie do 1 grudnia 2026. Hostowany serwer kosztuje 30, 50 albo 100 EUR miesięcznie. Źródło: https://openbot.run/pl/pricing (19.11.2026).

#### Jawny wybór AI

##### Liczba dostawców i modeli
LumoBot [brak]: LumoBot pokazuje konkretny katalog: 14 dostawców i 158 modeli.
OpenBot [brak]: OpenBot obsługuje plany ChatGPT, Claude, Gemini, Grok, Cursor i Cline, darmowe modele OpenCode, agentów zgodnych z ACP i dowolny serwer zgodny z OpenAI, także lokalny. Nie podaje jednej liczby, więc nie da się uczciwie porównać zakresu. Źródło: https://openbot.run/llms.txt (19.11.2026).

##### Model dla sprawdzającego
LumoBot [brak]: Sprawdzający może mieć własny, tańszy albo lokalny model niezależny od autora.
OpenBot [brak]: W OpenBot każdy agent ma własną rolę i własnego dostawcę, więc agent sprawdzający może pracować na innym modelu niż autor. Źródło: https://openbot.run/pl, https://openbot.run/llms.txt (19.11.2026).

##### Jawny model przy zadaniu
LumoBot [brak]: Przy zadaniu wybierasz dostawcę i model, a nazwa jest jawna.
OpenBot [brak]: W OpenBot wybierasz dostawcę dla każdego agenta i możesz go później zmienić, a agent zachowuje pracę. Przejście na model zapasowy pokazuje notatka w rozmowie. Źródło: https://openbot.run/pl, https://openbot.run/llms-full.txt (19.11.2026).

##### Własny plan AI bez zamykania w ekosystemie
LumoBot [brak]: Podłączasz plan, który już masz, klucz API albo lokalną Ollamę i LM Studio.
OpenBot [brak]: OpenBot korzysta z planów, które już płacisz, obsługuje wielu dostawców, Ollamę, LM Studio i dowolny serwer zgodny z OpenAI. Źródło: https://openbot.run/pl, https://openbot.run/providers/local-models (19.11.2026).

#### Na co dzień

##### Rozmowa głosowa
LumoBot [brak]: Rozmawiasz po polsku z wyspy na pulpicie i wybierasz jeden z pięciu głosów. Wyspa pokazuje pytania, wyniki i postęp pracy.
OpenBot [brak]: OpenBot ma dyktowanie i panel Voice do rozmowy z agentem, którą przerywasz głosem. Lokalne modele zamieniają mowę na tekst i czytają odpowiedzi w 31 językach. Oficjalne strony nie mówią, czy jest wśród nich polski. Źródło: https://openbot.run/llms-full.txt (19.11.2026).

##### Agent od obrazów
LumoBot [brak]: Osobny agent tworzy ikony, loga i plakaty, a gotowy plik trafia do folderu obrazów w projekcie.
OpenBot [brak]: Dokumentacja OpenBot nie opisuje gotowego agenta od obrazów. Agentowi można jednak nadać dowolną rolę i dostawcę, więc to nie dowodzi, że OpenBot tego nie zrobi. Źródło: https://openbot.run/pl (19.11.2026).

##### Stały Lider zespołu
LumoBot [brak]: Lider dzieli cel na części, przydziela je specjalistom i pilnuje sprawdzenia.
OpenBot [brak]: OpenBot opisuje lead agenta, który rozdziela części zadania innym agentom w jednym kanale, a agenci przekazują sobie pracę i pliki. Źródło: https://openbot.run/pl (19.11.2026).

##### Telefon i komunikatory
LumoBot [brak]: LumoBot działa na Windows, a wyniki i pytania pokazuje na wyspie na pulpicie.
OpenBot [przewaga]: OpenBot działa na Windows, macOS i Linuksie, ma aplikacje na iPhone i Androida oraz aplikację w przeglądarce. Agenci odpowiadają też w Slacku, Discordzie i Telegramie. Źródło: https://openbot.run/llms.txt (19.11.2026).

### vs-grok-bot

**Tytuł tabeli:** LumoBot działa lokalnie i pokazuje model. Grok Bot pracuje 24/7 na wspólnym komputerze w chmurze i sam dobiera model

#### Sprawdzony wynik

##### Sprawdzenie przed „gotowe”
LumoBot [brak]: Zadanie zamyka test albo polecenie sprawdzające, nie samo zapewnienie agenta.
Grok Bot [brak]: Auto Review sprawdza każdą akcję, zanim Bot ją wykona, bierze pod uwagę to, o co prosiłeś, i w razie potrzeby prosi o zgodę. Dokumentacja nie opisuje obowiązkowego testu celu na końcu zadania, ale to nie dowodzi, że go nie ma. Źródło: https://docs.x.ai/grok-bot/approvals-security-and-privacy (19.11.2026).

##### Niezależny sprawdzający
LumoBot [brak]: Osobny agent lub Neuro może sprawdzić wynik niezależnie od autora.
Grok Bot [brak]: Auto Review to osobna kontrola oparta na modelu, która ocenia akcje Bota. Boty mogą też przekazywać sobie pracę. Dokumentacja nie opisuje stałego sprawdzającego końcowy cel zadania. Źródło: https://docs.x.ai/grok-bot/approvals-security-and-privacy, https://docs.x.ai/grok-bot/faq (19.11.2026).

##### Praca do skutku po teście
LumoBot [brak]: Gdy sprawdzenie nie przejdzie, agent poprawia pracę w kolejnej rundzie.
Grok Bot [brak]: Grok Bot pracuje w tle na komputerze w chmurze, także po zamknięciu laptopa. Dokumentacja nie opisuje pętli poprawek aż do przejścia testu. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

##### Neuro hamuje przed stratą tokenów
LumoBot [brak]: Neuro uczy się na zakończonych zadaniach i po dwóch niskich ocenach może zatrzymać agenta, gdy ma co najmniej 60 przykładów.
Grok Bot [brak]: Grok Bot ma tygodniową pulę użycia i miesięczny limit dodatkowych wydatków, który ustawiasz sam. Dokumentacja nie opisuje hamulca opartego na historii zadań. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

#### Lokalny projekt i bezpieczeństwo

##### Punkt powrotu git po każdej rundzie
LumoBot [brak]: Praca może iść na osobnej gałęzi git z punktem powrotu po każdej rundzie.
Grok Bot [brak]: Grok Bot ostrzega na karcie zgody, gdy akcji nie da się cofnąć. Dokumentacja nie opisuje punktów powrotu git, ale to nie dowodzi, że ich nie ma. Źródło: https://docs.x.ai/grok-bot/approvals-security-and-privacy (19.11.2026).

##### Hasła poza modelem
LumoBot [brak]: Hasła są szyfrowane na komputerze i niewidoczne dla modelu.
Grok Bot [brak]: Grok Bot loguje się z Vault, menedżera haseł albo bezpiecznego formularza (Secure Form) i nie pokazuje tych wartości modelowi. Klucze API wpisujesz w osobnej karcie, poza zapisem rozmowy. Źródło: https://docs.x.ai/grok-bot/approvals-security-and-privacy (19.11.2026).

##### Pliki w folderze projektu
LumoBot [przewaga]: Pliki zostają w zwykłym folderze na twoim komputerze. Przy modelu lokalnym treść zadania nie opuszcza tego komputera.
Grok Bot [brak]: Grok Bot pracuje na trwałym komputerze w chmurze. Wszystkie Boty użytkownika dzielą tam pliki, sesje przeglądarki i logowania, a Grok Bot wymaga zapisu danych w chmurze. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

##### Praca bez chmury producenta
LumoBot [przewaga]: Z Ollamą albo LM Studio agent działa lokalnie, bez klucza i bez serwera producenta.
Grok Bot [brak]: Praca Botów idzie na komputerze w chmurze. Polecenie na twoim komputerze Bot wykona tylko za twoją zgodą, a model zawsze wybiera usługa. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

#### Jawny wybór i koszt

##### 0 zł bez płatnego planu
LumoBot [przewaga]: Aplikacja kosztuje 0 zł, nie wymaga karty i nie liczy pracy we własnych kredytach. Koszt pojawia się tylko przy wybranym planie lub kluczu AI.
Grok Bot [brak]: Grok Bot nie ma osobnej subskrypcji. Jest w planach Premium (30 USD), Super (100 USD) i Ultra (200 USD) miesięcznie, a plany Plus i Free go nie obejmują. Po wyczerpaniu tygodniowej puli użycia płacisz z przedpłaconych kredytów, jeśli je włączysz. Niektóre konta mogą wypróbować Grok Bota przez 7 dni. Źródło: https://x.ai/bot, https://docs.x.ai/grok-bot/faq (19.11.2026).

##### Jawny model przy zadaniu
LumoBot [przewaga]: Sam wybierasz dostawcę i model, a jego nazwa jest znana przy zadaniu.
Grok Bot [brak]: Grok Bot sam wybiera model dla każdego zadania, nie ma wyboru modelu i nie pokazuje nazwy modelu przy żądaniu. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

##### Wybór dostawcy
LumoBot [przewaga]: Lista LumoBota obejmuje 14 dostawców i 158 modeli, w tym Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, Ollamę i LM Studio. Przełączasz dostawcę bez zmiany projektu.
Grok Bot [brak]: Grok Bot używa modelu SpaceXSI albo modelu innego dostawcy z listy podprocesorów, ale wybiera go sam. Nie możesz wskazać dostawcy. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

#### Codzienna praca

##### Modele lokalne bez klucza
LumoBot [przewaga]: Ollama i LM Studio działają bez klucza API i bez opłaty za usługę.
Grok Bot [brak]: Model dla zadania zawsze wybiera usługa spośród modeli w chmurze, więc nie podłączysz własnego modelu lokalnego. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

##### Rozmowa głosowa
LumoBot [brak]: Mówisz po polsku do wyspy na pulpicie, a ona pokazuje pytania, wyniki i pracę agenta. Do wyboru jest pięć głosów.
Grok Bot [brak]: Grok Bot ma aplikacje na komputer i telefon oraz pracuje w Slacku, Teams i na spotkaniach. Sprawdzone strony nie mówią, czy rozmowa głosowa działa po polsku. Źródło: https://x.ai/bot, https://docs.x.ai/grok-bot/mobile (19.11.2026).

##### Stały Lider zespołu
LumoBot [brak]: Lider dzieli zadanie, przydziela części specjalistom i pilnuje sprawdzenia.
Grok Bot [brak]: Team Bots działają równolegle, przekazują sobie zadania i każdy ma własną rolę. Strona produktu pokazuje na przykład Bota w roli szefa biura (Chief of Staff). Źródło: https://x.ai/bot, https://docs.x.ai/grok-bot/team-bots (19.11.2026).

##### Agent od obrazów w projekcie
LumoBot [brak]: Agent od obrazów tworzy ikony, loga i plakaty, a pliki zapisuje w folderze projektu.
Grok Bot [brak]: Dokumentacja Grok Bot nie opisuje osobnego agenta od obrazów. Boty pracują jednak na komputerze z przeglądarką, plikami i aplikacjami, więc to nie dowodzi, że Grok Bot tego nie zrobi. Źródło: https://x.ai/bot, https://docs.x.ai/grok-bot/faq (19.11.2026).

##### Praca po zamknięciu laptopa
LumoBot [brak]: LumoBot pracuje na twoim komputerze, więc komputer musi być włączony.
Grok Bot [przewaga]: Boty pracują na komputerze w chmurze, więc zamknięcie aplikacji, laptopa albo telefonu nie zatrzymuje pracy w tle ani zadań cyklicznych. Źródło: https://docs.x.ai/grok-bot/faq (19.11.2026).

### vs-claude-cowork

**Tytuł tabeli:** LumoBot łączy dostawców i może pracować na modelu lokalnym. Claude Cowork wymaga płatnego planu Claude, prowadzi sesje w chmurze i pracuje dalej po zamknięciu laptopa

#### Sprawdzony wynik

##### Sprawdzenie przed „gotowe”
LumoBot [brak]: Polecenie sprawdzające albo test decyduje, czy zadanie jest skończone.
Claude Cowork [brak]: Cowork najpierw tworzy plan i pokazuje, co robi, a w trybie Auto sprawdza wybrane akcje pod kątem ryzyka. Dokumentacja nie opisuje obowiązkowego testu celu na końcu zadania, ale to nie dowodzi, że go nie ma. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

##### Niezależny sprawdzający
LumoBot [brak]: Autor i sprawdzający mogą być różnymi agentami, a Neuro ocenia szansę dojścia do celu.
Claude Cowork [brak]: Cowork dzieli złożone zadania na mniejsze i koordynuje kilku podagentów naraz. Dokumentacja nie opisuje stałego sprawdzającego w każdym zadaniu. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

##### Praca do skutku po teście
LumoBot [brak]: Po nieudanym sprawdzeniu agent dostaje następną rundę i poprawia wynik.
Claude Cowork [brak]: Cowork prowadzi długie zadania i pracuje dalej po zamknięciu laptopa. Dokumentacja nie opisuje pętli poprawek aż do przejścia testu. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

##### Neuro hamuje przed stratą tokenów
LumoBot [brak]: Neuro uczy się na zakończonych zadaniach i może zahamować agenta po dwóch niskich ocenach, gdy ma co najmniej 60 przykładów.
Claude Cowork [brak]: Cowork korzysta z limitów planu Claude. Dokumentacja nie opisuje hamulca opartego na historii zadań. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://claude.com/pricing (19.11.2026).

#### Bezpieczny projekt

##### Punkt powrotu git po każdej rundzie
LumoBot [brak]: Każda runda może mieć punkt powrotu na osobnej gałęzi git.
Claude Cowork [brak]: Cowork prosi o zgodę przed trwałym usunięciem plików i ma tryby kontroli akcji. Dokumentacja nie opisuje punktów powrotu git, ale to nie dowodzi, że ich nie ma. Źródło: https://support.claude.com/en/articles/13364135-use-claude-cowork-safely (19.11.2026).

##### Hasła poza modelem
LumoBot [brak]: Hasła są szyfrowane na komputerze i nie trafiają do modelu.
Claude Cowork [brak]: Anthropic radzi ostrożnie udostępniać Cowork pliki i dane logowania. Sprawdzone strony nie opisują, jak Cowork przechowuje hasła. Źródło: https://support.claude.com/en/articles/13364135-use-claude-cowork-safely (19.11.2026).

##### Pliki w folderze projektu
LumoBot [przewaga]: Projekt leży w lokalnym folderze, a przy modelu lokalnym treść plików nie opuszcza komputera.
Claude Cowork [brak]: Cowork na komputerze czyta i zapisuje twoje lokalne pliki przez aplikację Claude Desktop. Pracę wykonuje jednak na serwerach Anthropic, a sesje i pliki zapisuje na koncie Claude. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

##### Praca bez chmury producenta
LumoBot [przewaga]: Ollama i LM Studio pozwalają pracować bez chmury producenta i bez klucza API.
Claude Cowork [brak]: Cowork uruchamia zadania w chmurze Anthropic, w odizolowanym środowisku. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

#### Wybór AI i koszt

##### 0 zł bez płatnego planu na start
LumoBot [przewaga]: Aplikacja kosztuje 0 zł, bez karty i bez wymogu abonamentu.
Claude Cowork [brak]: Cowork jest tylko w płatnych planach Pro, Max, Ultra, Team i Enterprise. Pro kosztuje 20 USD miesięcznie (17 USD przy płatności rocznej), Max 100 USD, a Ultra 200 USD. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://claude.com/pricing (19.11.2026).

##### Wielu dostawców w jednym zespole
LumoBot [przewaga]: Jeden zespół może korzystać z Claude, ChatGPT i Codexa, Gemini, Mistrala, OpenRoutera, Ollamy i LM Studio.
Claude Cowork [brak]: Cowork jest częścią Claude i działa na modelach Claude: Opus, Sonnet, Haiku i Fable. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://claude.com/pricing (19.11.2026).

##### Modele lokalne bez klucza
LumoBot [przewaga]: Ollama i LM Studio działają bez klucza i bez opłat za API.
Claude Cowork [brak]: Cowork wykonuje zadania w chmurze Anthropic na modelach Claude, więc nie uruchomisz w nim modelu lokalnego. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

#### Codzienna praca

##### Jawny model przy zadaniu
LumoBot [brak]: Przed zadaniem wybierasz dostawcę i konkretny model, a jego nazwa jest jawna.
Claude Cowork [brak]: W Claude wybierasz model dostępny w twoim planie. Źródło: https://claude.com/pricing (19.11.2026).

##### Rozmowa głosowa
LumoBot [brak]: Wyspa na pulpicie obsługuje rozmowę po polsku i pokazuje pracę agenta.
Claude Cowork [brak]: Plany Claude obejmują tryb głosowy. Sprawdzone strony Cowork nie mówią, czy rozmowa w zadaniu Cowork działa po polsku. Źródło: https://claude.com/pricing (19.11.2026).

##### Stały Lider zespołu
LumoBot [brak]: Lider dzieli cel na części, przydziela specjalistów i pilnuje sprawdzenia.
Claude Cowork [brak]: Cowork dzieli złożone zadania i koordynuje podagentów pracujących równolegle. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

##### Obrazy i dokumenty
LumoBot [brak]: Agent od obrazów tworzy ikony, loga i plakaty, a wynik zapisuje w folderze projektu.
Claude Cowork [brak]: Cowork tworzy gotowe dokumenty, arkusze i prezentacje. Sprawdzone strony nie opisują osobnego agenta od obrazów, ale to nie dowodzi, że Cowork ich nie zrobi. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://claude.com/pricing (19.11.2026).

##### Praca po zamknięciu laptopa
LumoBot [brak]: LumoBot pracuje na twoim komputerze, więc komputer musi być włączony.
Claude Cowork [przewaga]: Sesje Cowork działają w chmurze, więc praca trwa po zamknięciu laptopa, a zaplanowane zadania ruszają bez żadnego włączonego urządzenia. Zadanie zaczniesz i poprowadzisz z komputera, przeglądarki albo telefonu. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork (19.11.2026).

### vs-manus

**Tytuł tabeli:** LumoBot kosztuje 0 zł bez kredytów i może pracować na modelu lokalnym. Manus liczy pracę w kredytach i planuje każde zadanie w swojej chmurze

#### Sprawdzony wynik

##### Sprawdzenie przed „gotowe”
LumoBot [brak]: Zadanie zamyka test albo polecenie sprawdzające, a nie samo zdanie agenta. Dostajesz wynik po przejściu ustalonej kontroli.
Manus [brak]: Manus uruchamia testy i poprawia błędy, gdy o to poprosisz. Ma też tryby zgody: Ask for approval, Approve for me i Full access. Dokumentacja nie opisuje obowiązkowego testu na końcu każdego zadania, ale to nie dowodzi, że go nie ma.

##### Niezależny sprawdzający
LumoBot [brak]: Osobny agent sprawdzający może ocenić pracę autora.
Manus [brak]: W zadaniach równoległych główne zadanie czyta wyniki pozostałych i sprawdza, czy są spójne. W trybie Approve for me automatyczny przegląd blokuje ryzykowne działania. Dokumentacja nie opisuje osobnego sprawdzającego dla każdego zadania.

##### Praca do skutku po teście
LumoBot [brak]: Gdy wynik nie przejdzie sprawdzenia, agent poprawia go w kolejnych rundach.
Manus [brak]: Manus może sam uruchomić testy i poprawić te, które nie przechodzą, jeśli tak opiszesz zadanie. Dokumentacja nie opisuje stałej pętli poprawek aż do przejścia kryterium.

##### Neuro hamuje przed stratą tokenów
LumoBot [brak]: Neuro uczy się na zakończonych zadaniach i po dwóch niskich ocenach może zahamować agenta, gdy ma co najmniej 60 przykładów.
Manus [brak]: Manus pokazuje zużycie kredytów, a w Manus Flex radzi ustawić limit wydatków u dostawcy modelu. Dokumentacja nie opisuje hamulca opartego na historii zadań.

#### Lokalny projekt i bezpieczeństwo

##### Punkt powrotu
LumoBot [brak]: Praca trafia na osobną gałąź git z punktem powrotu po każdej rundzie.
Manus [brak]: Manus zapisuje wersje projektu stron i aplikacji, gdy go o to poprosisz. Ma też Branch, czyli odgałęzienie zadania od dowolnej odpowiedzi, a w Manus Studio tworzy worktree git. Punkty powrotu ma więc także Manus, choć zapis wersji jest na prośbę, a nie po każdej rundzie.

##### Hasła poza modelem
LumoBot [brak]: Hasła są szyfrowane na komputerze i nie trafiają do modelu.
Manus [brak]: Browser Operator pracuje w twojej przeglądarce na twoich zalogowanych sesjach, a Manus według dokumentacji nigdy nie przechowuje twoich haseł. Manus radzi też nie dawać agentowi folderu z hasłami i kluczami.

##### Pliki zostają w folderze
LumoBot [przewaga]: Projekt jest zwykłym folderem na twoim komputerze. Przy modelu lokalnym także treść plików zostaje na tym komputerze.
Manus [brak]: Manus Studio na Windows i macOS pracuje w wybranym folderze na twoim komputerze. Manus planuje jednak każdy krok w swojej chmurze, a treść czytanego pliku staje się częścią zadania.

##### Praca bez chmury producenta
LumoBot [przewaga]: Ollama i LM Studio uruchamiają model lokalnie, bez klucza i bez opłaty za API. Całe zadanie może działać bez chmury producenta.
Manus [brak]: Studio wykonuje polecenia na twoim komputerze i może tam uruchomić lokalny model jako narzędzie. Agentem kieruje jednak model w chmurze: Manus albo dostawca z listy Manus Flex, na której nie ma modeli lokalnych.

#### Wybór AI i koszt

##### 0 zł bez kredytów i karty
LumoBot [przewaga]: Aplikacja kosztuje 0 zł i nie liczy pracy w kredytach. Z lokalnym modelem nie płacisz także za API.
Manus [brak]: Manus Free kosztuje 0 USD i daje 300 kredytów dziennie. Pro kosztuje 20 USD i daje 4 000 kredytów miesięcznie, a Max 200 USD i 40 000 kredytów. W Max po wyczerpaniu kredytów płacisz za użycie.

##### Własny plan AI w darmowej wersji
LumoBot [przewaga]: Podłączasz własny plan, klucz API albo lokalny model bez płacenia za aplikację.
Manus [brak]: Własne klucze działają w Manus Flex, który jest w planach Pro i Max. Obsługiwani dostawcy to OpenAI, Anthropic, Google AI Studio, xAI, Meta, OpenRouter, Fireworks i Modal. Obrazy, wideo i Cloud Computer nadal zużywają kredyty Manusa.

##### Jawny model przy zadaniu
LumoBot [brak]: Wybierasz dostawcę i model przed zadaniem, a nazwa jest jawna.
Manus [brak]: W Manus Flex sam wybierasz dostawcę, model i poziom wysiłku, a menu pokazuje nazwę modelu. W zwykłym trybie wybierasz Manus 2.0 Lite, 2.0 albo 2.0 Max.

##### Liczba dostawców i modeli
LumoBot [brak]: LumoBot podaje policzalny katalog 14 dostawców i 158 modeli.
Manus [brak]: Manus Flex obsługuje 8 dostawców, w tym OpenRouter z modelami wielu rodzin. Do mediów Manus ma wbudowane modele obrazu, wideo, dźwięku i 3D. Nie da się uczciwie powiedzieć, kto ma szerszy wybór.

#### Codzienna praca

##### Rozmowa głosowa
LumoBot [brak]: Mówisz po polsku z wyspy na pulpicie i widzisz tam pytania oraz wyniki. Do wyboru jest pięć głosów.
Manus [brak]: W aplikacji Manus na telefonie wydajesz polecenia głosem i oglądasz pulpit komputera na żywo. Manus zamienia też mowę na tekst i tekst na mowę. Oficjalne strony nie mówią, czy rozmowa głosowa działa po polsku.

##### Lider zespołu
LumoBot [brak]: Lider rozdziela zadanie, przydziela specjalistów i pilnuje sprawdzenia.
Manus [brak]: W zadaniach równoległych główne zadanie dzieli pracę na osobne zadania, sprawdza postęp, czyta wyniki i wysyła poprawki. Wide Research uruchamia wielu agentów naraz.

##### Obrazy i media
LumoBot [brak]: Agent od obrazów tworzy ikony, loga i plakaty, a plik trafia do folderu obrazów w projekcie.
Manus [przewaga]: Manus tworzy obrazy, wideo, dźwięk i modele 3D wbudowanymi modelami, ma edytor wideo w Studio i przygotowuje slajdy z grafiką. Te funkcje zużywają kredyty.

##### Przeglądarka z twoimi logowaniami
LumoBot [brak]: Własna przeglądarka agenta działa w tle, pamięta karty i logowania oraz pobiera pliki do projektu.
Manus [brak]: Browser Operator pracuje w twojej przeglądarce na twoich zalogowanych sesjach. Do innych zadań Manus używa odizolowanej przeglądarki w chmurze.

### vs-openclaw

**Tytuł tabeli:** LumoBot i OpenClaw są darmowe i działają na twoim komputerze. LumoBot ma gotowy zespół od pierwszego uruchomienia, a OpenClaw daje otwarty kod i ponad 20 komunikatorów

#### Sprawdzony wynik

##### Sprawdzenie przed „gotowe”
LumoBot [brak]: Zadanie kończy test albo polecenie sprawdzające, a samo „gotowe” od wykonawcy nie wystarcza.
OpenClaw [brak]: OpenClaw ma dodatek Auto Review, który w wymaganym punkcie kontrolnym sprawdza zmiany w repozytorium osobnym recenzentem. Trzeba go włączyć w ustawieniach.

##### Niezależny sprawdzający
LumoBot [brak]: Możesz przydzielić osobnego agenta sprawdzającego.
OpenClaw [brak]: Gotowy zespół OpenClaw ma agenta recenzenta (reviewer) obok koordynatora, badacza i autora. Auto Review uruchamia recenzenta osobno od autora zmian.

##### Praca do skutku po teście
LumoBot [brak]: Po nieudanym sprawdzeniu agent dostaje następną rundę i poprawia pracę.
OpenClaw [brak]: Koordynator OpenClaw sprawdza wyniki specjalistów, zanim odda całość. Dokumentacja nie opisuje stałej pętli poprawek aż do przejścia testu.

##### Neuro hamuje przed stratą tokenów
LumoBot [brak]: Neuro uczy się na zakończonych zadaniach i po dwóch niskich ocenach może zahamować agenta, gdy ma co najmniej 60 przykładów.
OpenClaw [brak]: OpenClaw raportuje zużycie tokenów i koszty. Dokumentacja nie opisuje hamulca opartego na historii wyników.

#### Instalacja i bezpieczeństwo

##### Punkt powrotu git
LumoBot [brak]: LumoBot zapisuje punkty powrotu na osobnej gałęzi git po kolejnych rundach.
OpenClaw [brak]: OpenClaw daje zadaniu agenta własną gałąź git i osobny katalog roboczy (managed worktrees). Przed usunięciem zapisuje ich zawartość, więc możesz ją przywrócić.

##### Hasła poza modelem
LumoBot [brak]: Hasła są szyfrowane na komputerze i nie trafiają do modelu.
OpenClaw [brak]: OpenClaw ma chroniony magazyn sekretów. Agent dostaje tylko uchwyt, a prawdziwą wartość Gateway podstawia dopiero przy wysyłce. Można też podłączyć 1Password, Vault albo Bitwarden.

##### Start na Windows
LumoBot [brak]: Instalujesz gotową aplikację na Windows, podłączasz AI i zlecasz pierwsze zadanie.
OpenClaw [brak]: OpenClaw ma aplikację Windows Hub z instalatorem .exe, bez uprawnień administratora. Kreator przy pierwszym uruchomieniu sam instaluje lokalny Gateway. Jest też instalator dla PowerShella, który sam dociąga Node.

##### Kanały i dostęp
LumoBot [brak]: Dostęp agenta i ustawienia bezpieczeństwa są w jednej aplikacji.
OpenClaw [przewaga]: OpenClaw działa w ponad 20 komunikatorach, takich jak WhatsApp, Telegram, Discord i Slack. Nieznani nadawcy domyślnie muszą zostać sparowani, a polecenie openclaw security audit sprawdza ustawienia.

#### Wybór AI

##### Liczba dostawców i modeli
LumoBot [brak]: LumoBot pokazuje gotowy katalog 14 dostawców i 158 modeli.
OpenClaw [brak]: OpenClaw obsługuje wielu dostawców w chmurze i lokalnie przez wtyczki i sam wykrywa dostępne modele. Liczba zależy od konfiguracji, więc nie da się uczciwie porównać zakresu.

##### Model lokalny
LumoBot [brak]: Ollama i LM Studio są gotowymi opcjami lokalnymi bez klucza API.
OpenClaw [brak]: OpenClaw łączy się z lokalną Ollamą bez klucza i sam wykrywa jej modele. Ma też gotowe przykłady dla LM Studio i llama.cpp.

##### Model dla sprawdzającego
LumoBot [brak]: Sprawdzający jest osobną rolą, a jego model możesz dobrać niezależnie od autora.
OpenClaw [brak]: Każdy agent OpenClaw może mieć własny model, a Auto Review pozwala wskazać model recenzenta.

##### Koszt
LumoBot [brak]: Aplikacja kosztuje 0 zł. Płacisz tylko dostawcy modelu albo nic, gdy używasz modelu lokalnego.
OpenClaw [brak]: OpenClaw nie ma płatnego planu ani usługi w chmurze. Płacisz tylko dostawcy modelu albo nic przy modelu lokalnym. Kod jest otwarty na licencji MIT.

#### Codzienna praca

##### Rozmowa głosowa
LumoBot [brak]: Wyspa daje rozmowę po polsku, pięć głosów i podgląd pracy agenta.
OpenClaw [brak]: OpenClaw ma tryb Talk do ciągłej rozmowy głosowej, słowo wybudzające i wybór głosu, także w aplikacji na Windows. Oficjalne strony nie mówią, jak działa po polsku. Nie ma wyspy na pulpicie.

##### Lider zespołu
LumoBot [brak]: Lider dzieli cel, przekazuje części specjalistom i pilnuje wyniku.
OpenClaw [brak]: OpenClaw ma gotowy szablon zespołu z koordynatorem (chief of staff). Koordynator przydziela pracę specjalistom, sprawdza ich wyniki i oddaje całość.

##### Obrazy
LumoBot [brak]: Agent od obrazów tworzy grafiki i zapisuje je w folderze projektu.
OpenClaw [brak]: OpenClaw tworzy i edytuje obrazy przez dostawców, na przykład OpenAI gpt-image. Dokumentacja nie opisuje gotowego osobnego agenta od obrazów, ale możesz takiego dodać.

##### Aktualizacje
LumoBot [brak]: Program sprawdza nowe wydania, a projekty i hasła zostają na miejscu.
OpenClaw [brak]: OpenClaw sprawdza wydania codziennie i może aktualizować się sam. Robi kopię przed aktualizacją i wraca do poprzedniej wersji, gdy nowa nie wystartuje.

### vs-devin

**Tytuł tabeli:** LumoBot kosztuje 0 zł i działa na modelu lokalnym bez klucza. Devin to rozbudowane narzędzie do programowania na komputerze i w chmurze, z planami od 20 USD

#### Sprawdzony wynik

##### Sprawdzenie przed „gotowe”
LumoBot [brak]: Test albo polecenie sprawdzające decyduje, czy zadanie jest skończone.
Devin [brak]: Devin pisze, uruchamia i testuje kod. Quick Review i Devin Review sprawdzają zmiany, zanim je zatwierdzisz. Dokumentacja nie opisuje obowiązkowego testu na końcu każdego zadania.

##### Niezależny sprawdzający
LumoBot [brak]: Osobny agent może sprawdzić pracę autora.
Devin [brak]: Quick Review uruchamia osobnego agenta, który niezależnie ocenia zmiany. Model recenzenta wybierasz z listy: SWE-check, GPT-5.5 Review albo Opus 4.7 Review.

##### Praca do skutku po teście
LumoBot [brak]: Gdy sprawdzenie nie przejdzie, agent dostaje następną rundę i poprawia wynik.
Devin [brak]: Devin planuje, pisze, uruchamia i testuje kod w jednej sesji. Dokumentacja nie opisuje stałej pętli poprawek aż do przejścia niezależnego kryterium.

##### Neuro hamuje przed stratą tokenów
LumoBot [brak]: Neuro uczy się na zakończonych zadaniach i po dwóch niskich ocenach może zahamować agenta, gdy ma co najmniej 60 przykładów.
Devin [brak]: Devin ma limity zużycia, a plan Teams ma kontrolę kosztów w trzech progach. Dokumentacja nie opisuje hamulca opartego na historii zadań.

#### Lokalny projekt i bezpieczeństwo

##### Punkt powrotu
LumoBot [brak]: Każda runda może mieć punkt powrotu na osobnej gałęzi git.
Devin [brak]: W Devin Desktop cofasz zmiany agenta do dowolnego polecenia i tworzysz nazwane punkty kontrolne. Sesja może też pracować w osobnym worktree git, który scalasz na końcu.

##### Hasła poza modelem
LumoBot [brak]: Hasła są szyfrowane na komputerze i nie trafiają do modelu.
Devin [brak]: Devin ma zarządzanie sekretami dla środowisk w chmurze, a Cognition deklaruje, że nie trenuje modeli na danych klienta. Nie sprawdziliśmy, czy sekrety są ukryte przed modelem.

##### Pliki w folderze projektu
LumoBot [przewaga]: Kod, teksty i grafiki trafiają do lokalnego folderu. Z modelem lokalnym treść folderu nie wychodzi do chmury.
Devin [brak]: Devin Desktop na Windows, macOS i Linuksie pracuje na plikach w twoim folderze. Modele w planach indywidualnych działają jednak w chmurze, więc treść zadania trafia do dostawcy modelu.

##### Praca bez chmury producenta
LumoBot [przewaga]: Ollama i LM Studio pozwalają uruchomić model na twoim komputerze, bez klucza i bez opłaty za API.
Devin [brak]: W planach indywidualnych Devin korzysta z modeli w chmurze. Wersję bez internetu z własnym serwerem modeli Devin ma tylko we wdrożeniach dla administracji (air-gapped).

#### Wybór AI i koszt

##### 0 zł bez limitu programu
LumoBot [przewaga]: Aplikacja kosztuje 0 zł i program nie nakłada limitu pracy. Przy lokalnym modelu nie płacisz też za API.
Devin [brak]: Devin Free kosztuje 0 USD, ale ma mały limit pracy agentów i ograniczony wybór modeli. Pro kosztuje 20 USD, Max 200 USD, a Teams 80 USD miesięcznie. Po limicie dokupujesz użycie według stawek API.

##### Liczba dostawców i modeli
LumoBot [brak]: LumoBot pokazuje 14 dostawców i 158 modeli.
Devin [brak]: Devin daje modele OpenAI, Claude, Gemini, SpaceXAI, własne SWE-2 i modele open source. Ma też automatyczny dobór (Adaptive) i pary modeli (Fusion). Nie podaje jednej liczby, więc nie da się uczciwie porównać zakresu.

##### Modele lokalne bez klucza
LumoBot [przewaga]: Ollama i LM Studio działają bez klucza API i bez opłaty za usługę.
Devin [brak]: Lista modeli w planach indywidualnych obejmuje modele w chmurze. Własny serwer modeli zgodny z OpenAI da się podpiąć tylko we wdrożeniu air-gapped dla administracji.

##### Wybór modelu
LumoBot [brak]: Lider, specjalista i sprawdzający mogą mieć osobne modele.
Devin [brak]: W Devinie sam wybierasz model sesji, osobno model recenzenta w Quick Review, a w Pro, Max i Teams możesz użyć swojego planu ChatGPT.

#### Codzienna praca

##### Rozmowa głosowa
LumoBot [brak]: Rozmawiasz po polsku z wyspy na pulpicie i wybierasz jeden z pięciu głosów.
Devin [brak]: Devin ma rozmowę głosową z agentem i dyktowanie poleceń w Devin Desktop. Oficjalne strony nie mówią, czy działa po polsku. Nie ma wyspy na pulpicie.

##### Lider zespołu
LumoBot [brak]: Lider dzieli zadanie, przydziela części specjalistom i pilnuje sprawdzenia.
Devin [brak]: Devin Local uruchamia podagentów do części zadania, a Agent Command Center zarządza agentami lokalnymi i w chmurze z jednego miejsca. Devin Bots w Max i Teams pracują równolegle.

##### Obrazy
LumoBot [brak]: Agent od obrazów tworzy ikony, loga i plakaty i zapisuje je w folderze obrazy.
Devin [brak]: Devin opisuje się jako narzędzie do inżynierii oprogramowania. Jego dokumentacja nie opisuje tworzenia grafik, ale to nie dowodzi, że ich nie zrobi.

##### Przeglądarka
LumoBot [brak]: Własna przeglądarka działa w tle, szuka, klika, pobiera pliki i pamięta logowania.
Devin [brak]: Devin Desktop pokazuje podgląd strony w edytorze albo w przeglądarce, a Devin w chmurze ma własną przeglądarkę do pracy i testów.

## Źródła

Źródła LumoBota: `tresci/tabela-v11-fakty.md`, `tresci/porownanie-v8.md`, `tresci/fakty-v5.md`, `tresci/pytania-v14.md` oraz pliki wskazane w tych dokumentach.

### OpenBot (sprawdzone 19 listopada 2026)
- https://openbot.run/pl
- https://openbot.run/pl/pricing
- https://openbot.run/pl/teams
- https://openbot.run/changelog
- https://openbot.run/providers/local-models
- https://openbot.run/llms.txt
- https://openbot.run/llms-full.txt

### Grok Bot (sprawdzone 19 listopada 2026)
- https://x.ai/bot
- https://docs.x.ai/grok-bot/faq
- https://docs.x.ai/grok-bot/approvals-security-and-privacy
- https://docs.x.ai/grok-bot/team-bots
- https://docs.x.ai/grok-bot/mobile

### Claude Cowork (sprawdzone 19 listopada 2026)
- https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork
- https://support.claude.com/en/articles/13364135-use-claude-cowork-safely
- https://claude.com/pricing

### Manus (sprawdzone 19 listopada 2026)
- https://manus.im/pricing
- https://manus.im/docs/features/desktop.md
- https://manus.im/docs/models/manus-flex.md
- https://manus.im/docs/features/parallel-tasks.md
- https://manus.im/docs/website-builder/build-locally.md
- https://manus.im/docs/features/browser-operator.md
- https://manus.im/docs/features/multi-modal.md
- https://manus.im/docs/llms.txt

### OpenClaw (sprawdzone 19 listopada 2026)
- https://github.com/openclaw/openclaw
- https://docs.openclaw.ai/platforms/windows
- https://docs.openclaw.ai/start/why-openclaw/secrets
- https://docs.openclaw.ai/concepts/multi-agent
- https://docs.openclaw.ai/concepts/managed-worktrees
- https://docs.openclaw.ai/tools/autoreview
- https://docs.openclaw.ai/providers/ollama/setup
- https://docs.openclaw.ai/nodes/talk
- https://docs.openclaw.ai/install/updating/automatic-updates
- https://docs.openclaw.ai/gateway/security
- https://docs.openclaw.ai/llms.txt

### Devin (sprawdzone 19 listopada 2026)
- https://devin.ai/pricing
- https://docs.devin.ai/desktop/quick-review
- https://docs.devin.ai/desktop/cascade
- https://docs.devin.ai/desktop/devin-local/overview
- https://docs.devin.ai/desktop/devin-local/worktrees
- https://docs.devin.ai/desktop/models
- https://docs.devin.ai/desktop/devin-desktop-faq
- https://docs.devin.ai/work-with-devin/voice-mode
- https://docs.devin.ai/llms.txt
- https://docs.devin.ai/get-started/devin-intro
