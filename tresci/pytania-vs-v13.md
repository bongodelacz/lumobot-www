# Pytania na stronach porównań, v13

Fakty wyłącznie z tresci/porownanie-v8.md i tresci/tabela-v11-fakty.md, stan na 19 listopada 2026. Dwa pytania z głównej ("Ile kosztuje LumoBot?" i "Czy muszę mieć klucz API?") dokleja Kreska 1:1, tu ich nie ma.

## vs-openbot

Lead: Cztery pytania, które padają najczęściej, gdy ktoś wybiera między LumoBotem a OpenBotem.

### Czy OpenBot działa na moim komputerze?

OpenBot ma wersje na macOS 13+, Windows 10+, Linux x64, iPhone i Androida. LumoBot działa tylko na Windows 10 i 11 i nie ma aplikacji mobilnej. Jeśli używasz Maca, Linuxa albo chcesz pracować z telefonu, tu wygrywa OpenBot.

### Czym LumoBot różni się od OpenBota?

LumoBot kończy zadanie dopiero po poleceniu sprawdzającym, na przykład teście, albo po niezależnym sprawdzającym. OpenBot ma kroki zatwierdzania w przepływach, ale nie opisuje stałego, niezależnego sprawdzania celu. LumoBot zapisuje też punkt powrotu git po każdej rundzie, a w opisie OpenBota nie ma takiej funkcji.

### Czy mogę używać mojej subskrypcji?

Tak, w obu narzędziach. OpenBot uruchamia plany, które już masz, między innymi Codex, Claude, Gemini, Grok, Cursor i Cline. LumoBot pozwala podłączyć plan, klucz API albo model lokalny przez Ollamę lub LM Studio, a wybierać możesz spośród 14 dostawców i 158 modeli.

### Kiedy lepiej wybrać OpenBota?

Gdy potrzebujesz serwera działającego 24/7, aplikacji na telefon albo wspólnego kanału dla ludzi i agentów. Serwer hostowany kosztuje 30, 50 lub 100 EUR miesięcznie, a użytek osobisty 0 EUR. LumoBot jest lepszy, gdy pracujesz na jednym komputerze z Windows, chcesz wszystko lokalnie i nie płacić za aplikację.

## vs-grok-bot

Lead: Cztery pytania o to, czym LumoBot różni się od Grok Bota i kiedy wybrać którego.

### Czy Grok Bot działa na moim komputerze?

Grok Bot ma aplikacje na macOS, Windows i Linuxa oraz na iOS i Androida. Główna praca odbywa się jednak na komputerze w chmurze, a nie na twoim. LumoBot działa na Windows 10 i 11 i pracuje w folderze na twoim komputerze.

### Czym LumoBot różni się od Grok Bota?

W Grok Bocie model dobiera się automatycznie i nie widzisz jego nazwy. W LumoBocie sam wybierasz dostawcę i model, także lokalny. Wszystkie Boty jednego użytkownika dzielą w chmurze jeden komputer, pliki, przeglądarkę i logowania, a w LumoBocie pliki i hasła zostają na twoim komputerze.

### Czy mogę używać mojej subskrypcji?

W Grok Bocie tylko wybranych planów X, Grok lub Cursor, na przykład SuperGrok i X Premium+. Nie ma danych o użyciu dowolnego własnego klucza API. LumoBot przyjmie plan, który już masz, klucz API wybranego dostawcy albo model lokalny.

### Kiedy lepiej wybrać Grok Bota?

Gdy agent ma pracować po zamknięciu laptopa albo w Slacku, Teams, na X i na spotkaniach. Grok Bot działa 24/7 i ma aplikacje mobilne, a LumoBot nie. Cena zaczyna się od 30 USD miesięcznie za Premium, a LumoBot kosztuje 0 zł za aplikację.

## vs-claude-cowork

Lead: Cztery pytania o wybór między LumoBotem a Claude Cowork.

### Czy Claude Cowork działa na moim komputerze?

Cowork działa w Claude Desktop na macOS i Windows, a na Linuxie w becie. Jest też w przeglądarce, na telefonie i w Claude in Chrome. Sesje chmurowe działają po zamknięciu laptopa, a dostęp do plików lokalnych wymaga włączonej aplikacji.

### Czym LumoBot różni się od Claude Cowork?

Cowork używa jednego dostawcy, Anthropic, i modeli Claude. LumoBot łączy 14 dostawców i 158 modeli, w tym lokalne. W Cowork możesz wybrać ręczną zgodę, automatyczną zgodę albo pominięcie, ale Anthropic ostrzega, że automatyczna kontrola może przeoczyć ryzykowną akcję. W LumoBocie koniec zadania potwierdza test lub niezależny sprawdzający.

### Czy mogę używać mojej subskrypcji?

Do Cowork potrzebny jest płatny plan Claude: Pro za 20 USD miesięcznie (17 USD przy płatności rocznej), Max za 100 USD albo Ultra za 200 USD. Plany innych dostawców go nie zastępują. W LumoBocie podłączysz plan, który już masz, także od Anthropic, a sama aplikacja kosztuje 0 zł.

### Kiedy lepiej wybrać Claude Cowork?

Gdy pracujesz głównie na dokumentach, arkuszach, prezentacjach i badaniach albo potrzebujesz zadań w chmurze po zamknięciu komputera. Cowork ma też plany Team i Enterprise z administracją firmową. LumoBot jest lepszy, gdy chcesz łączyć dostawców, używać modeli lokalnych i mieć sprawdzony koniec zadania.

## vs-manus

Lead: Cztery pytania, które warto zadać przed wyborem między LumoBotem a Manusem.

### Czy Manus działa na moim komputerze?

Manus działa w przeglądarce, na Windows i macOS oraz na iOS i Androidzie. Domyślnie pracuje w chmurze, a Manus Studio może pracować lokalnie z plikami, terminalem i aplikacjami. LumoBot działa na Windows 10 i 11 i nie ma wersji mobilnej.

### Czym LumoBot różni się od Manusa?

Manus rozlicza pracę w kredytach: Free daje 300 dziennie, Pro 4 000, a Max 40 000 miesięcznie. LumoBot nie ma kredytów, płacisz tylko za swój plan lub klucz. Tryby zgody w Manus Studio kontrolują działania, ale nie ma danych o stałym niezależnym sprawdzającym wynik, a w LumoBocie jest test lub sprawdzający.

### Czy mogę używać mojej subskrypcji?

Tylko w ograniczonym zakresie: plan Pro ma Manus Flex, czyli własne klucze, ale nie działa to w każdej funkcji. LumoBot pozwala podłączyć plan, który już masz, klucz API albo model lokalny. Ollama i LM Studio nie wymagają klucza.

### Kiedy lepiej wybrać Manusa?

Gdy potrzebujesz automatyzacji po mailu, kalendarzu lub Slacku, Cloud Computera działającego całą dobę albo tworzenia stron, slajdów, grafiki, wideo i gier. Manus ma też aplikacje mobilne. LumoBot jest lepszy, gdy chcesz pracować lokalnie, wybierać model i mieć punkty powrotu git.

## vs-openclaw

Lead: Cztery pytania o różnice między LumoBotem a otwartym OpenClaw.

### Czy OpenClaw działa na moim komputerze?

Tak, na macOS, Windows, Linuxie i WSL2, a iOS i Android działają jako węzły. Możesz go uruchomić na własnym komputerze albo serwerze i pisać do niego przez WhatsApp, Telegram, Discord, Slack i inne kanały. LumoBot działa na Windows 10 i 11 i ma gotowy instalator.

### Czym LumoBot różni się od OpenClaw?

OpenClaw to otwarty kod na licencji MIT, który instalujesz i zabezpieczasz sam: Gateway, Node i kanały. LumoBot to gotowa aplikacja z polskim głosem, wyspą i własną przeglądarką agenta. OpenClaw nie opisuje stałego sprawdzania wyniku, a w LumoBocie zadanie kończy test lub niezależny sprawdzający.

### Czy mogę używać mojej subskrypcji?

Tak, OpenClaw przyjmie własny plan lub klucz dostawcy oraz model lokalny. Sam nie ma abonamentu, więc płacisz tylko dostawcy modelu. W LumoBocie jest podobnie: 0 zł za aplikację i własny plan, klucz albo Ollama i LM Studio.

### Kiedy lepiej wybrać OpenClaw?

Gdy chcesz otwarty kod, pełną kontrolę nad sprzętem i dostęp do agenta z ponad 20 kanałów komunikatorów. Pasuje do osób, które umieją samodzielnie skonfigurować Gateway. Dokumentacja zastrzega, że jeden Gateway nie jest granicą dla wzajemnie wrogich użytkowników.

## vs-devin

Lead: Cztery pytania o wybór między LumoBotem a Devinem.

### Czy Devin działa na moim komputerze?

Devin działa głównie w przeglądarce i w chmurze, ma też CLI i tryb pracy na komputerze. Jego wirtualne maszyny uruchamiają Windows, macOS i Linuxa do testów w przeglądarce. LumoBot działa lokalnie na Windows 10 i 11, w folderze twojego projektu.

### Czym LumoBot różni się od Devina?

Devin specjalizuje się w inżynierii oprogramowania: pisze kod, uruchamia testy, przygotowuje pull requesty i ma Devin Review. LumoBot jest jednym programem do kodu, tekstów, obrazów i innych zadań, z polskim głosem i wyspą. Obaj sprawdzają wynik, ale w Devinie dokumentacja zaleca jeszcze przegląd człowieka.

### Czy mogę używać mojej subskrypcji?

Devin pozwala użyć planu ChatGPT w planach Pro i Max. Nie ma danych o dowolnym własnym kluczu ani planie każdego dostawcy. W LumoBocie podłączysz własny plan, klucz API albo model lokalny, a aplikacja kosztuje 0 zł.

### Kiedy lepiej wybrać Devina?

Gdy firma ma backlog w GitHubie, GitLabie, Jira lub Linearze i chce pull requestów, przeglądu kodu oraz pracy równoległej w chmurze po zamknięciu laptopa. Devin obsługuje też SSO, SCIM i dedykowane wdrożenia. Plany kosztują 20 USD (Pro), 80 USD (Teams) lub 200 USD (Max) miesięcznie.

## porownanie

Lead: Sześć pytań, które pomagają wybrać narzędzie, zanim porównasz szczegóły.

### Które narzędzie wybrać, jeśli pracuję tylko na Windowsie?

LumoBot, jeśli chcesz pracować lokalnie w folderze projektu, za 0 zł za aplikację. Obsługuje Windows 10 i 11. Pozostałe narzędzia też działają na Windowsie, ale większość z nich pracuje głównie w chmurze.

### Które narzędzie działa po zamknięciu laptopa?

Grok Bot, Claude Cowork (sesje chmurowe), Manus (Cloud Computer), Devin Bots i OpenBot na serwerze zarządzanym. LumoBot pracuje na twoim komputerze, więc musi być włączony. To jego największe ograniczenie wobec tych narzędzi.

### Które narzędzie pozwala wybrać dostawcę i model?

LumoBot ma 14 dostawców i 158 modeli, w tym Ollamę i LM Studio. OpenBot i OpenClaw też obsługują wielu dostawców. Grok Bot sam dobiera model, a Claude Cowork używa tylko modeli Anthropic.

### Które narzędzie sprawdza, czy zadanie jest naprawdę zrobione?

LumoBot kończy zadanie po poleceniu sprawdzającym albo niezależnym sprawdzającym. Devin uruchamia testy, CI i Devin Review, ale dotyczy to kodu. W pozostałych narzędziach nie ma danych o stałym niezależnym sprawdzającym wynik.

### Które narzędzie jest najtańsze?

OpenClaw i LumoBot nie mają abonamentu: LumoBot kosztuje 0 zł za aplikację, OpenClaw nie ma planu, a płacisz tylko dostawcy modelu. OpenBot do użytku osobistego kosztuje 0 EUR. Pozostałe zaczynają od planów płatnych, na przykład Grok Bot od 30 USD, Claude Cowork od 20 USD, a Manus i Devin mają plan Free z małym limitem.

### Gdzie moje dane zostają na moim komputerze?

W LumoBocie folder projektu i hasła są lokalnie, ale przy modelu chmurowym treść zadania trafia do wybranego dostawcy. W OpenClaw i planie osobistym OpenBota stan i pliki też są na twoim sprzęcie. Grok Bot, Claude Cowork w sesjach chmurowych, Manus i Devin pracują w chmurze producenta.
