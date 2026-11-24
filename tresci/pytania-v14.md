# Pytania v14, mocne

Stan faktów: 19 listopada 2026 (tresci/porownanie-v8.md, tabela-v11-fakty.md, tabela-v11.md). Gdzie producent czegoś nie opisuje, piszemy "oficjalne strony tego nie opisują", bez zgadywania.

## vs-openbot

Lead: OpenBot, tak jak LumoBot, działa na twoim komputerze, korzysta z planów AI, które już masz, i sprawdza pracę agentów. Ma też aplikacje na telefon i serwer 24/7. LumoBot nie pobiera opłaty za pracę zawodową.

### Jak LumoBot pilnuje, żeby nie oddać niedokończonej pracy?
W LumoBocie zadanie kończy polecenie sprawdzające, na przykład test, albo niezależny sprawdzający. OpenBot też sprawdza pracę: od wydania 0.74.0 porównuje żądanie z wykonaną pracą i odpowiedzią, a nieukończoną część może kontynuować do trzech razy. Jego dokumentacja nie opisuje stałego testu celu w każdym zadaniu. Źródło: https://openbot.run/pl, https://openbot.run/changelog, sprawdzone 19.11.2026.

### Ile zapłacę w LumoBocie, a ile w OpenBocie?
Aplikacja LumoBot kosztuje 0 zł, bez serwera i bez licencji. OpenBot jest darmowy do użytku osobistego i niekomercyjnego. Do pracy potrzebna jest licencja: 10 EUR miesięcznie za jedną osobę albo 25 EUR za zespół dwóch osób, bezpłatnie do 1 grudnia 2026. Hostowany serwer kosztuje 30, 50 albo 100 EUR miesięcznie. Źródło: https://openbot.run/pl/pricing, sprawdzone 19.11.2026.

### Co się stanie, gdy agent coś zepsuje?
W LumoBocie zadanie pracuje na osobnej gałęzi git z punktami powrotu. Dokumentacja OpenBot nie opisuje automatycznego punktu powrotu git. Jeden z jej poradników radzi poprosić agenta, żeby zachował poprzedni plik i zapisał nową wersję przed zmianami, które możesz chcieć cofnąć. Źródło: https://openbot.run/llms-full.txt, sprawdzone 19.11.2026.

### Czy w LumoBocie praca zostaje na moim komputerze?
Tak. Projekt leży w twoim folderze, a przy modelu lokalnym treść zadania nie opuszcza komputera. W OpenBocie też: rozmowy, pliki i obszary robocze zostają na twoim komputerze, a loginy trzyma zaszyfrowany sejf (Vault). Zespoły mogą wybrać serwer zarządzany. Źródło: https://openbot.run/llms.txt, https://openbot.run/pl/teams, sprawdzone 19.11.2026.

### Z jakimi modelami zadziała LumoBot, jeśli nie chcę nic dopłacać?
Z 14 dostawcami i 158 modelami, a także lokalnie przez Ollamę i LM Studio, bez klucza i bez opłat. OpenBot także korzysta z planów, które już płacisz, ma darmowe modele OpenCode i obsługuje Ollamę, LM Studio oraz dowolny serwer zgodny z OpenAI. Źródło: https://openbot.run/llms.txt, https://openbot.run/providers/local-models, sprawdzone 19.11.2026.

### Czy LumoBot mówi po polsku?
Tak, rozmawiasz z nim głosem po polsku, z wyspy na pulpicie, i wybierasz jeden z pięciu głosów. OpenBot ma dyktowanie i panel Voice do rozmowy z agentem, a lokalne modele mowy obsługują 31 języków. Oficjalne strony nie mówią, czy jest wśród nich polski. Źródło: https://openbot.run/llms-full.txt, sprawdzone 19.11.2026.

## vs-grok-bot

Lead: Grok Bot pracuje 24/7 na wspólnym komputerze w chmurze i sam dobiera model. LumoBot nie pobiera opłaty za aplikację, pozwala wybrać model i może działać na modelu lokalnym.

### Gdzie leżą moje pliki i hasła w LumoBocie, a gdzie w Grok Bocie?
W LumoBocie pliki zostają w lokalnym folderze projektu, a hasła są szyfrowane na komputerze i nie trafiają do modelu. W Grok Bocie praca idzie na trwałym komputerze w chmurze, a wszystkie Boty jednego użytkownika dzielą ten sam komputer, pliki, przeglądarkę i logowania. Hasła Grok Bot też chroni: loguje się z Vault, menedżera haseł albo bezpiecznego formularza i nie pokazuje tych wartości modelowi. Źródło: https://docs.x.ai/grok-bot/faq, https://docs.x.ai/grok-bot/approvals-security-and-privacy, sprawdzone 19.11.2026.

### Czy mogę sam wybrać model w LumoBocie?
Tak: 14 dostawców, 158 modeli, także lokalne przez Ollamę i LM Studio. Grok Bot sam dobiera model, nie ma wyboru modelu i nie pokazuje nazwy modelu przy zadaniu. Źródło: https://docs.x.ai/grok-bot/faq, sprawdzone 19.11.2026.

### Ile zapłacę w LumoBocie, a ile w Grok Bocie?
LumoBot: 0 zł za aplikację, a koszt planu AI zostaje przy twoim dostawcy. Grok Bot nie ma osobnej subskrypcji: jest w planach Premium (30 USD), Super (100 USD) i Ultra (200 USD) miesięcznie, z tygodniową pulą użycia. Plany Plus i Free go nie obejmują. Po wyczerpaniu puli płacisz z przedpłaconych kredytów, jeśli je włączysz, a niektóre konta mogą wypróbować Grok Bota przez 7 dni. Źródło: https://x.ai/bot, https://docs.x.ai/grok-bot/faq, sprawdzone 19.11.2026.

### Skąd LumoBot wie, że zadanie jest gotowe?
Sprawdza je polecenie testowe albo osobny agent sprawdzający, a nie sam wykonawca. Grok Bot ma Auto Review: sprawdza każdą akcję przed wykonaniem, bierze pod uwagę twoją prośbę i w razie potrzeby pyta o zgodę. Dokumentacja nie opisuje stałego testu celu na końcu zadania. Źródło: https://docs.x.ai/grok-bot/approvals-security-and-privacy, sprawdzone 19.11.2026.

### Co się stanie, gdy agent coś zepsuje?
W LumoBocie masz punkt powrotu w git i wracasz do dobrego stanu. Grok Bot ma zgody i ostrzega, gdy akcji nie da się cofnąć. Sprawdzone materiały nie opisują punktów powrotu git. Źródło: https://docs.x.ai/grok-bot/approvals-security-and-privacy, sprawdzone 19.11.2026.

### Czy LumoBot może pracować offline na własnym modelu?
Tak. Z Ollamą albo LM Studio model działa na twoim komputerze, bez klucza API i bez opłat. Grok Bot pracuje na komputerze w chmurze, a model dla każdego zadania wybiera sama usługa. Polecenie na twoim komputerze wykona tylko za twoją zgodą. Źródło: https://docs.x.ai/grok-bot/faq, sprawdzone 19.11.2026.

## vs-claude-cowork

Lead: Cowork jest częścią Claude, wymaga płatnego planu, pracuje w chmurze Anthropic i działa dalej po zamknięciu laptopa. LumoBot łączy wielu dostawców i może działać na modelu lokalnym.

### Czy LumoBot wymaga płatnej subskrypcji, żeby zacząć?
Nie. Aplikacja kosztuje 0 zł, a ty podłączasz plan, który już masz, klucz API albo model lokalny. Cowork jest tylko w płatnych planach Pro, Max, Ultra, Team i Enterprise. Pro kosztuje 20 USD miesięcznie (17 USD przy płatności rocznej), Max 100 USD, a Ultra 200 USD. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://claude.com/pricing, sprawdzone 19.11.2026.

### Czy w LumoBocie mogę łączyć modele różnych firm?
Tak. Jeden zespół może używać Claude, ChatGPT i Codexa, Gemini, Mistrala, OpenRoutera, a także Ollamy i LM Studio. Cowork jest częścią Claude i działa na modelach Claude: Opus, Sonnet, Haiku i Fable. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://claude.com/pricing, sprawdzone 19.11.2026.

### Jak LumoBot i Cowork pilnują wyniku?
W LumoBocie koniec zadania wyznacza test albo niezależny sprawdzający. Cowork najpierw tworzy plan i pokazuje, co robi, więc możesz go poprawić w trakcie. Ma tryby Manual i Auto, a w trybie Auto sprawdza wybrane akcje pod kątem ryzyka. Anthropic ostrzega, że ta kontrola może przeoczyć ryzykowną akcję. Dokumentacja nie opisuje stałego testu celu na końcu zadania. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://support.claude.com/en/articles/13364135-use-claude-cowork-safely, sprawdzone 19.11.2026.

### Czy moje dane trafiają do chmury?
W LumoBocie projekt leży w lokalnym folderze, a przy modelu lokalnym treść zadania nie opuszcza komputera. Cowork czyta i zapisuje lokalne pliki przez aplikację Claude Desktop, ale pracę wykonuje na serwerach Anthropic, a sesje i pliki zapisuje na koncie Claude. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, sprawdzone 19.11.2026.

### Co się stanie, gdy agent coś zepsuje?
W LumoBocie wracasz do punktu powrotu w git, bo zadanie pracuje na osobnej gałęzi. Cowork prosi o zgodę przed trwałym usunięciem plików, ma tryby zgody i ostrzega przed atakami przez treść stron (prompt injection). Sprawdzone materiały nie opisują punktów powrotu git. Źródło: https://support.claude.com/en/articles/13364135-use-claude-cowork-safely, sprawdzone 19.11.2026.

### Ile zapłacę za miesiąc pracy?
W LumoBocie nic za program, a za AI tyle, ile kosztuje twój obecny plan lub klucz, albo 0 zł na modelu lokalnym. Za Cowork płacisz 20 USD miesięcznie za Pro (17 USD przy płatności rocznej), 100 USD za Max albo 200 USD za Ultra. Źródło: https://claude.com/pricing, sprawdzone 19.11.2026.

## vs-manus

Lead: Manus liczy pracę w kredytach i planuje każdy krok w swojej chmurze. LumoBot kosztuje 0 zł i może działać w całości na modelu lokalnym.

### Ile zapłacę w LumoBocie, a ile w Manusie?
LumoBot: 0 zł za aplikację, bez kredytów. Płacisz tylko dostawcy modelu albo nic przy modelu lokalnym. Manus: Free daje 300 kredytów dziennie, Pro kosztuje 20 USD i daje 4 000 kredytów miesięcznie, Max 200 USD i 40 000 kredytów. W Max po wyczerpaniu kredytów płacisz za użycie.

### Czy zobaczę, jaki model pracuje nad moim zadaniem?
W LumoBocie sam wybierasz dostawcę i model z 14 dostawców i 158 modeli, także lokalnych. W Manusie też możesz: Manus Flex w planach Pro i Max pozwala wybrać dostawcę, model i poziom wysiłku, a menu pokazuje nazwę modelu. W zwykłym trybie wybierasz Manus 2.0 Lite, 2.0 albo 2.0 Max.

### Czy treść moich plików wyjeżdża do chmury?
W LumoBocie nie, jeśli wybierzesz model lokalny: pliki i hasła zostają na komputerze. Manus Studio pracuje w folderze na twoim komputerze, ale według dokumentacji Manus planuje każdy krok w chmurze, a treść czytanego pliku staje się częścią zadania.

### Skąd wiem, że zadanie jest naprawdę zrobione?
W LumoBocie o końcu decyduje polecenie sprawdzające albo osobny agent sprawdzający. Manus uruchamia testy i poprawia błędy, gdy o to poprosisz, a w zadaniach równoległych główne zadanie sprawdza wyniki pozostałych. Ma też tryby zgody: Ask for approval, Approve for me i Full access.

### Czy mogę cofnąć to, co zrobił agent?
Tak. W LumoBocie każda runda zapisuje punkt powrotu w git. Manus też pozwala wracać: zapisuje wersje projektu strony, gdy go o to poprosisz, ma Branch do odgałęzienia zadania i tworzy worktree git w Manus Studio.

### Czy LumoBot ma stałego Lidera zespołu?
Tak. Lider dzieli zadanie, a specjaliści robią części, każdy z osobnym sprawdzającym, jeśli tak ustawisz. Manus ma podobny układ w zadaniach równoległych: główne zadanie dzieli pracę, śledzi postęp i wysyła poprawki.

## vs-openclaw

Lead: LumoBot i OpenClaw są darmowe i działają na twoim komputerze. LumoBot daje gotowy zespół od pierwszego uruchomienia, OpenClaw daje otwarty kod i ponad 20 komunikatorów.

### Czy muszę coś konfigurować, żeby zacząć w LumoBocie?
Pobierasz instalator na Windows, podłączasz AI i zlecasz pierwsze zadanie. OpenClaw też ma instalator na Windows (Windows Hub), który przy pierwszym uruchomieniu sam instaluje lokalny Gateway. Kanały w komunikatorach ustawiasz w nim osobno, jeśli chcesz z nich korzystać.

### Dlaczego LumoBot nie kończy pracy bez sprawdzenia?
Bo zadanie zamyka polecenie sprawdzające albo niezależny sprawdzający. OpenClaw też to umie: ma dodatek Auto Review z osobnym recenzentem i gotowy zespół z agentem recenzentem. Te funkcje trzeba w nim włączyć.

### Czy w LumoBocie jest polski głos?
Tak: rozmawiasz po polsku z wyspy na pulpicie i wybierasz jeden z pięciu głosów. OpenClaw ma tryb Talk do rozmowy głosowej, słowo wybudzające i wybór głosu, także na Windows. Jego oficjalne strony nie mówią, jak działa po polsku.

### Ile kosztuje LumoBot, a ile OpenClaw?
Oba programy są darmowe i nie mają abonamentu. W obu płacisz dostawcy modelu, jeśli używasz modelu płatnego, albo nic przy modelu lokalnym. OpenClaw ma do tego otwarty kod na licencji MIT.

### Czy LumoBot obsługuje dowolnych dostawców i modele lokalne?
Tak: 14 dostawców, 158 modeli, Ollama i LM Studio bez klucza. OpenClaw też obsługuje wielu dostawców i lokalną Ollamę bez klucza, a dla LM Studio ma gotowe przykłady ustawień.

### Co się stanie, gdy agent coś zepsuje?
W LumoBocie wracasz do punktu powrotu w git, a LumoBot niczego nie publikuje sam. OpenClaw daje zadaniu agenta osobną gałąź git i zapisuje jej zawartość, zanim ją usunie. Ma też zatwierdzanie poleceń i audyt bezpieczeństwa.

## vs-devin

Lead: Devin to rozbudowane narzędzie do programowania na komputerze i w chmurze. LumoBot kosztuje 0 zł, działa na modelu lokalnym bez klucza i robi też teksty oraz grafiki.

### Ile zapłacę w LumoBocie, a ile w Devinie?
LumoBot: 0 zł za aplikację i bez limitu pracy w programie. Devin: Free ma mały limit pracy agentów i ograniczony wybór modeli, Pro kosztuje 20 USD, Max 200 USD, Teams 80 USD miesięcznie. Po limicie dokupujesz użycie według stawek API.

### Czy w jednym programie zrobię kod, teksty i grafikę?
Tak. Lider prowadzi zespół, a agent od obrazów tworzy ikony, loga i plakaty, które trafiają do folderu obrazy w projekcie. Devin opisuje się jako narzędzie do inżynierii oprogramowania, a jego dokumentacja nie opisuje tworzenia grafik.

### Gdzie ląduje mój kod?
W LumoBocie w lokalnym folderze projektu, a z modelem lokalnym treść zadania nie opuszcza komputera. Devin Desktop też pracuje w twoim folderze na Windows, macOS i Linuksie. Modele w jego planach indywidualnych działają jednak w chmurze, a Devin Cloud pracuje w całości w chmurze.

### Czy mogę wybrać własnego dostawcę i model?
Tak: 14 dostawców, 158 modeli, także lokalne przez Ollamę i LM Studio. W Devinie też wybierasz model, między innymi OpenAI, Claude, Gemini i SWE-2, a w Pro, Max i Teams możesz użyć swojego planu ChatGPT. Modeli lokalnych Devin nie ma w planach indywidualnych.

### Czy mogę wrócić do stanu sprzed zmian agenta?
Tak. W LumoBocie zadanie pracuje na osobnej gałęzi git z punktami powrotu. Devin też to ma: w Devin Desktop cofasz zmiany do dowolnego polecenia, tworzysz nazwane punkty kontrolne i pracujesz w osobnym worktree git.

### Czy LumoBot też sprawdza wynik?
Tak, na każdym zadaniu: polecenie sprawdzające, na przykład test, albo osobny agent sprawdzający. Devin też ma niezależną recenzję: Quick Review uruchamia osobnego agenta z wybranym przez ciebie modelem.

## porownanie

Lead: LumoBot kończy zadanie dopiero po sprawdzeniu, trzyma pliki na twoim komputerze i nie pobiera opłaty za aplikację. Poniżej piszemy też, co mają inni.

### Dlaczego LumoBot nie oddaje niedokończonej pracy?
Bo zadanie kończy dopiero polecenie sprawdzające albo niezależny sprawdzający, a nie samo zdanie agenta "gotowe". Inni też coś sprawdzają: OpenBot porównuje żądanie z wykonaną pracą i może kontynuować nieukończoną część do trzech razy, Grok Bot ma Auto Review każdej akcji, a Cowork w trybie Auto sprawdza ryzykowne akcje. Ich dokumentacja nie opisuje stałego testu celu w każdym zadaniu. Źródła: https://openbot.run/changelog, https://docs.x.ai/grok-bot/approvals-security-and-privacy, https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, sprawdzone 19.11.2026.

### Ile zapłacę w LumoBocie, a ile u reszty?
LumoBot: 0 zł za aplikację. OpenBot jest darmowy do użytku osobistego, a do pracy potrzebuje licencji od 10 EUR miesięcznie (bezpłatnie do 1 grudnia 2026). Grok Bot jest w planach od 30 USD miesięcznie, a Claude Cowork w planach od 20 USD miesięcznie. Manus i Devin mają darmowe plany z limitem, a płatne od 20 USD miesięcznie. Źródła: https://openbot.run/pl/pricing, https://docs.x.ai/grok-bot/faq, https://claude.com/pricing, https://manus.im/pricing, https://devin.ai/pricing, sprawdzone 19.11.2026.

### Czy mogę użyć planu AI, który już mam?
Tak. W LumoBocie podłączasz posiadany plan, klucz API albo model lokalny. OpenBot też korzysta z planów, które już płacisz. Grok Bot działa w planach X i sam wybiera model. Cowork działa w płatnym planie Claude, na modelach Claude. Źródła: https://openbot.run/llms.txt, https://docs.x.ai/grok-bot/faq, https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, sprawdzone 19.11.2026.

### Gdzie zostają moje pliki i hasła?
W LumoBocie na twoim komputerze: pliki w folderze projektu, hasła szyfrowane lokalnie i niewysyłane do modelu. OpenBot też trzyma pliki i rozmowy na twoim komputerze, a loginy w zaszyfrowanym sejfie. Grok Bot pracuje na wspólnym komputerze w chmurze, ale nie pokazuje haseł modelowi. Cowork czyta lokalne pliki przez Claude Desktop, a pracę wykonuje w chmurze Anthropic i zapisuje sesje na koncie Claude. Źródła: https://openbot.run/llms.txt, https://openbot.run/llms-full.txt, https://docs.x.ai/grok-bot/faq, https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, sprawdzone 19.11.2026.

### Co się stanie, gdy agent coś zepsuje?
W LumoBocie wracasz do punktu powrotu w git, a LumoBot nie publikuje zmian sam. Manus i Devin też mają punkty powrotu i osobne kopie robocze git. OpenBot, Grok Bot i Cowork mają zgody i kontrole bezpieczeństwa, ale ich dokumentacja nie opisuje punktów powrotu git. Źródła: https://manus.im/docs/features/desktop.md, https://docs.devin.ai/desktop/cascade, https://openbot.run/llms-full.txt, https://docs.x.ai/grok-bot/approvals-security-and-privacy, https://support.claude.com/en/articles/13364135-use-claude-cowork-safely, sprawdzone 19.11.2026.

### Czy mogę wybrać dowolny model, także lokalny?
Tak: 14 dostawców i 158 modeli, w tym Ollama i LM Studio bez klucza i bez opłat. OpenBot także obsługuje wielu dostawców, Ollamę, LM Studio i własny serwer zgodny z OpenAI. Grok Bot sam wybiera model i nie da się tego zmienić. Cowork działa na modelach Claude w chmurze Anthropic. Źródła: https://openbot.run/providers/local-models, https://docs.x.ai/grok-bot/faq, https://claude.com/pricing, sprawdzone 19.11.2026.

## glowna

Lead: Zlecasz cel, a LumoBot pracuje, aż sprawdzenie przejdzie. Twoje pliki zostają na twoim komputerze, a aplikacja kosztuje 0 zł.

### Dlaczego LumoBot nie mówi "gotowe", dopóki nie sprawdzi?
Zadanie kończy polecenie sprawdzające, na przykład test, albo osobny agent sprawdzający. Samo zdanie agenta nie wystarcza. Dostajesz wynik, który już przeszedł kontrolę.

### Ile naprawdę kosztuje LumoBot?
Aplikacja kosztuje 0 zł. Płacisz tylko za plan AI lub klucz, który już masz, a przy modelach lokalnych (Ollama, LM Studio) nie płacisz wcale. Nie płacisz drugi raz za to samo.

### Co się stanie, gdy agent coś zepsuje?
Każde zadanie pracuje na osobnej gałęzi git z punktami powrotu, więc wracasz do dobrego stanu. LumoBot niczego nie publikuje sam. Sterowanie komputerem jest domyślnie wyłączone.

### Gdzie zostają moje pliki i hasła?
Na twoim komputerze. Projekt leży w lokalnym folderze, a hasła są szyfrowane lokalnie i nie trafiają do modelu. Przy modelu lokalnym treść zadania nie opuszcza komputera.

### Z jakimi modelami działa LumoBot?
Z 14 dostawcami i 158 modelami: Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, Cursor, OpenCode i innymi. Lokalnie z Ollamą i LM Studio, bez klucza. Wybierasz sam.

### Jak LumoBot pracuje jako zespół?
Lider dzieli zadanie na części i przydziela je specjalistom. Autor i sprawdzający mogą być osobnymi agentami. Całą rozmowę widzisz na kanale zespołu i możesz się wtrącić.

### Czy mogę mówić do LumoBota po polsku?
Tak. Rozmawiasz głosem prosto z wyspy, małego panelu na pulpicie, i wybierasz jeden z pięciu głosów. Na wyspie widzisz też pytania i wyniki.

### Co robi Neuro?
To mała sieć, która uczy się na twoich zakończonych zadaniach i szacuje szansę dojścia do celu. Po dwóch niskich ocenach, gdy ma co najmniej 60 przykładów, może zahamować agenta, zanim spali tokeny.

### Czym LumoBot różni się od Grok Bota i Claude Cowork?
W LumoBocie sam wybierasz dostawcę i model, możesz pracować na modelu lokalnym, a aplikacja kosztuje 0 zł. Grok Bot sam wybiera model, pracuje na wspólnym komputerze w chmurze i jest w planach X od 30 USD miesięcznie. Cowork działa na modelach Claude w chmurze Anthropic i wymaga płatnego planu Claude od 20 USD miesięcznie. Oba za to pracują dalej po zamknięciu laptopa, czego LumoBot na twoim komputerze nie robi. Źródła: https://docs.x.ai/grok-bot/faq, https://x.ai/bot, https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork, https://claude.com/pricing, sprawdzone 19.11.2026.

### Czym LumoBot różni się od OpenBota, Manusa i Devina?
OpenBot jest najbliżej LumoBota: też działa na twoim komputerze, korzysta z planów, które już masz, i ma lead agenta. Jest darmowy do użytku osobistego, a do pracy potrzebuje licencji od 10 EUR miesięcznie (bezpłatnie do 1 grudnia 2026). Manus planuje każdy krok w swojej chmurze i liczy pracę w kredytach: Free daje 300 kredytów dziennie, Pro kosztuje 20 USD. Devin to narzędzie do programowania z aplikacją na komputer i pracą w chmurze: ma darmowy plan z małym limitem, a Pro kosztuje 20 USD miesięcznie. Z Manusem i Devinem nie użyjesz modelu lokalnego jako agenta w zwykłych planach, a w LumoBocie tak. Źródła: https://openbot.run/pl/pricing, https://openbot.run/llms.txt, https://manus.im/pricing, https://manus.im/docs/features/desktop.md, https://devin.ai/pricing, https://docs.devin.ai/desktop/models, sprawdzone 19.11.2026.

## strona-pytania

#### Na start

### Czym jest LumoBot?
To aplikacja na Windows, w której zespół agentów AI pracuje w twoim folderze, dopóki sprawdzenie nie przejdzie. Zlecasz cel i dostajesz sprawdzony wynik, a nie obietnicę.

### Dla kogo jest LumoBot?
Dla każdego, kto chce zlecić pracę w projekcie i dostać wynik, który przeszedł kontrolę: programistów, twórców i małych firm. Nie musisz pilnować każdego kroku.

### Co dostaję po pobraniu?
Instalator na Windows 10 i 11 z gotową aplikacją za 0 zł. Uruchamiasz, podłączasz AI i zlecasz pierwsze zadanie. Bez konfiguracji w terminalu.

### Czy muszę mieć klucz API?
Do Gemini, Mistrala i OpenRoutera tak. Możesz też użyć planu, który już masz, albo modelu lokalnego: Ollama i LM Studio działają bez klucza i bez opłat.

### Z jakimi modelami działa?
Z 14 dostawcami i 158 modelami, między innymi Claude, ChatGPT i Codex, Gemini, Mistral i OpenRouter. Lokalnie z Ollamą i LM Studio. Wybierasz sam, nikt nie narzuca ci modelu.

#### Praca agenta

### Skąd wiadomo, że zadanie jest gotowe?
Kończy je polecenie sprawdzające, na przykład test, albo niezależny sprawdzający, a nie sam agent. Dopiero ich potwierdzenie zamyka zadanie.

### Czym jest Neuro?
To mała sieć, która uczy się na zakończonych zadaniach i szacuje szansę dojścia do celu. Gdy ma co najmniej 60 przykładów i dwa razy da niską ocenę, hamuje agenta.

### Czy agent ma dostęp do internetu?
Tak, przez własną przeglądarkę, która działa w tle. Szuka, czyta strony, klika i pobiera pliki do projektu. Ty widzisz tylko gotowy wynik.

### Czy LumoBot pamięta, co ustaliliśmy?
Tak. Przy długiej rozmowie składa krótkie streszczenie z ostatnich zadań i pamięci projektu, więc agent nie zaczyna od zera.

#### Bezpieczeństwo i koszty

### Czy agent może coś zepsuć?
Zmiany trafiają do git i wracasz do punktu powrotu. LumoBot nie publikuje niczego sam. Sterowanie komputerem jest domyślnie wyłączone, a kursor w lewym górnym rogu zatrzymuje agenta.

### Ile to kosztuje w tokenach?
Licznik pokazuje użycie i szacowany koszt na bieżąco. Oszczędzanie tokenów skraca długą rozmowę do streszczenia. Na modelu lokalnym tokeny nic nie kosztują.

### Czy agent widzi mój ekran?
Tylko jeśli sam włączysz sterowanie komputerem w Ustawieniach, i tylko agent z pełnym dostępem. Domyślnie ekran jest poza jego zasięgiem.

### Czy LumoBot aktualizuje się sam?
Tak. Program sprawdza nowe wydania i aktualizuje się po jednym kliknięciu, a twoje projekty i hasła zostają na miejscu.

#### Zespół i funkcje

### Czy da się pracować zespołowo?
Tak. Lider dzieli zadanie na części, agenci zlecają sobie pracę, a ty widzisz ich rozmowę na kanale zespołu i możesz się wtrącić.

### Co to jest Lider?
To agent, który prowadzi zespół: dzieli zadanie, przydziela części specjalistom i pilnuje, żeby wynik przeszedł sprawdzenie.

### Czy mogę z nim rozmawiać głosem?
Tak, po polsku, prosto z wyspy na pulpicie. Wybierasz jeden z pięciu głosów.

### Co to jest wyspa?
To mały panel na pulpicie z pytaniami, wynikami i rozmową głosową. Pokazuje, co robi agent, i chowa się do krawędzi ekranu.

### Czy zrobi mi grafikę?
Tak. Agent od obrazów tworzy ikony, loga i plakaty, a gotowy obraz trafia do folderu obrazy w projekcie.
