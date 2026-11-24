# Tabela vs, wersja 11 (Pióro, 19 listopada 2026, wzmocniona faktami Radara)

Format: `### strona`, `#### grupa`, `##### kategoria`, potem dwie linie: `LumoBot [ocena]: …` i `Rywal [ocena]: …`. Oceny: tak, częściowo, nie. Fakty rywali pochodzą z tresci/tabela-v11-fakty.md (Radar, stan na 19 listopada 2026, ze źródłami). Gdzie producent czegoś nie opisuje, piszemy wprost: brak danych.

Zasada liczenia: tak jest wyżej niż częściowo, a częściowo wyżej niż nie. W kategorii „Dane zostają u ciebie" dane w chmurze to minus, więc ocenę rywala odwracamy. Licznik pokazuje, w ilu z 16 kategorii LumoBot ma wyższą ocenę.

Fakty o LumoBocie (strona/app/dane.js, tresci/fakty-v5.md): 14 dostawców AI, 158 modeli, 23 wydania od 0.12.1 do 0.14.7 w dniach 16 i 17 listopada 2026, Windows 10 i 11.

Zmiany względem poprzedniej wersji: Claude Cowork w kategorii „Darmowy start" zmienia ocenę z tak na nie (Cowork jest tylko w planach płatnych), więc licznik w vs-claude-cowork rośnie do 11 z 16. Cena Claude Pro uwzględnia płatność roczną (17 USD miesięcznie).

---

### vs-openbot

**Tytuł tabeli:** LumoBot sprawdza wynik, zanim powie „gotowe". OpenBot zostawia to tobie
**Licznik:** LumoBot lepszy w 5 z 16 (remis w 9, OpenBot lepszy w 2)

#### Ile płacisz

##### Cena aplikacji
LumoBot [tak]: Aplikacja kosztuje 0 zł i nie ma osobnej opłaty za sam program. Płacisz najwyżej za wybrany plan AI, klucz albo własny sprzęt do modelu lokalnego, nigdy za dostęp do LumoBota.
OpenBot [tak]: Użytek prywatny na własnym komputerze kosztuje 0 EUR. Serwer hostowany ma plany po 30, 50 i 100 EUR miesięcznie, a licencja do pracy kosztuje 10 albo 25 EUR miesięcznie, według openbot.run. Dla jednej osoby jest remis, rachunek rośnie przy zespole.

##### Płatność za AI
LumoBot [częściowo]: LumoBot nie sprzedaje własnego modelu. Podłączasz plan, który już masz, klucz API albo model lokalny, a Ollama i LM Studio nie wymagają klucza. Rachunek u dostawcy chmurowego zostaje po twojej stronie.
OpenBot [tak]: Aplikacja uruchamia plany AI, które już masz: Codex, Claude, Gemini, Grok, Cursor, Cline i inne. Gdy skończy się limit planu, agent może przejść na model zapasowy. Nie otwierasz drugiego abonamentu, więc opis kosztów jest tu czystszy niż w LumoBocie.

##### Darmowy start
LumoBot [tak]: Program jest bezpłatny, bez limitu, okresu próbnego i karty. Z modelem lokalnym nie płacisz też za API, a przy chmurowym płacisz zgodnie z planem lub kluczem dostawcy.
OpenBot [tak]: Wariant prywatny ma 0 EUR i wszystkie funkcje, działa na twoim komputerze. Współpraca zespołowa i serwer są rozliczane osobno.

#### Gdzie pracujesz i co z danymi

##### System i urządzenia
LumoBot [częściowo]: Działa na Windows 10 i 11, a projektem jest zwykły folder na twoim komputerze. Nie ma jeszcze wersji na macOS, Linuksa ani telefon, i mówimy to wprost.
OpenBot [tak]: Są wersje na macOS 13+, Windows 10+, Linuksa x64 (AppImage), iPhone'a i Androida. Telefon łączy się z komputerem, a nie zastępuje lokalnego środowiska. Jeśli pracujesz na kilku urządzeniach, ma wyraźną przewagę.

##### Praca bez internetu
LumoBot [tak]: Z Ollamą albo LM Studio agent pracuje na twoim komputerze, bez klucza i bez opłaty za API. Rozpoznawanie głosu też może działać offline, więc możesz mówić do niego bez sieci.
OpenBot [tak]: OpenBot działa na własnym komputerze i obsługuje Ollamę oraz LM Studio. Telefon wymaga połączenia z komputerem, a wariant zarządzanego serwera działa w chmurze. W lokalnym trybie oba programy dają to samo.

##### Dane zostają u ciebie
LumoBot [częściowo]: Folder projektu i dane aplikacji leżą na twoim dysku, a hasła są szyfrowane na komputerze i nie trafiają do modelu. Przy modelu chmurowym treść potrzebna do zadania wychodzi do wybranego dostawcy, więc sam decydujesz, co opuszcza komputer.
OpenBot [częściowo]: W wariancie osobistym obszary robocze, rozmowy, pliki i dane przeglądarki zostają na komputerze, a OpenBot nie zapisuje ich na swoich serwerach. Serwer zespołowy przenosi pracę na zarządzaną infrastrukturę. Prywatność zależy więc od trybu, który wybierzesz.

#### Wybór AI

##### Dostawcy AI
LumoBot [tak]: Konfiguracja ma 14 dostawców i 158 modeli: Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, OpenCode, Cursor, Ollama, LM Studio i inni. Gdy jeden zawodzi albo drożeje, przełączasz się na innego w kilka kliknięć.
OpenBot [tak]: Oficjalna lista obejmuje Codex, Claude, Gemini, Grok, OpenCode, Cursor i Cline, a także Muse Code, Pi, Mercury, agentów ACP, endpoint zgodny z OpenAI, Ollamę i LM Studio. Nie jesteś przywiązany do jednego producenta, więc ten punkt jest równy.

##### Osobny model dla każdego agenta
LumoBot [tak]: Każdy agent ma własny model i własną rolę. Lider może działać na mocnym, prosty specjalista na tańszym albo lokalnym, a zmiana modelu nie usuwa folderu projektu.
OpenBot [tak]: Agent ma własną rolę, instrukcje i obszar roboczy. Możesz zmienić dostawcę bez utraty agenta i rozmowy, a po limicie włącza się model zapasowy. To raczej zmiana dostawcy niż osobne modele w jednym zespole, ale w praktyce wybór jest elastyczny.

##### Twój własny plan AI
LumoBot [tak]: Podłączasz plan, za który już płacisz, klucz API wybranego dostawcy albo pomijasz chmurę i używasz Ollamy lub LM Studio. Nic nie kupujesz od LumoBota.
OpenBot [tak]: OpenBot jest nakładką na plany, które już masz: Codex, Claude, Gemini, Grok i inne z listy. Strona opisuje podłączanie wspieranych dostawców, a nie dowolny klucz do każdej funkcji. Idea ta sama.

#### Zespół i pewność wyniku

##### Zespół agentów
LumoBot [tak]: Lider dzieli zadanie między specjalistów, a agenci przekazują sobie zlecenia i pliki w jednym projekcie. Osobny agent może być sprawdzającym. Widzisz, kto za co odpowiada.
OpenBot [tak]: Każdy agent ma nazwę, rolę i obszar roboczy. Agenci wysyłają sobie wiadomości, przekazują zadania i udostępniają pliki, a w trybie wieloosobowym ludzie i agenci pracują w tych samych kanałach. Zespół działa, więc jest remis.

##### Kto ocenia wynik
LumoBot [tak]: Zadanie kończy test albo niezależny sprawdzający, czyli Neuro. Sam komunikat agenta „gotowe" niczego nie zamyka, a reguła sprawdzania jest częścią zlecenia. Agent, który coś zbudował, nie ocenia sam siebie.
OpenBot [częściowo]: Agenci sprawdzają wyniki w swoich przepływach, a przepływ może zatrzymać się na kroku zatwierdzenia przez ciebie. Brak danych o stałym, niezależnym sprawdzającym, który potwierdza cel każdego zadania. Większa część oceny spada na człowieka.

##### Praca do skutku
LumoBot [tak]: Gdy test lub sprawdzający nie potwierdzi celu, agent próbuje ponownie, a Lider porządkuje kolejne prace. Zadanie kończy się dopiero po pozytywnym sprawdzeniu, więc nie pilnujesz każdego kroku.
OpenBot [częściowo]: Przepływy łączą wielu agentów i kroki zatwierdzania. Serwer zespołowy jest zawsze włączony, więc agent pracuje po zamknięciu laptopa, co jest realną zaletą. Brak danych o gwarancji powtarzania pracy aż do spełnienia niezależnego kryterium.

##### Droga powrotu
LumoBot [tak]: Praca idzie na osobnej gałęzi git, a LumoBot zapisuje punkt powrotu po każdej rundzie. Cofasz zmianę do wybranego punktu, a nic nie jest automatycznie wysyłane na zewnątrz.
OpenBot [częściowo]: W przykładzie z oficjalnej strony agenci scalają zmiany w pliku i jest krok zatwierdzania. Brak danych o punkcie powrotu po każdej rundzie i o wbudowanym cofaniu całego zadania. Przed ważną zmianą zadbaj o własną kopię.

#### Na co dzień

##### Rozmowa głosowa po polsku
LumoBot [tak]: Wyspa obsługuje rozmowę głosową po polsku: mówisz, a LumoBot rozumie, odpowiada i działa. Rozpoznawanie może działać offline, a głos wybierasz spośród pięciu.
OpenBot [częściowo]: Ma aplikację na iPhone'a i Androida i łączy telefon z komputerem. Brak danych o polskim głosie i o liczbie dostępnych głosów. Jeśli wolisz mówić po polsku, sprawdź to przed zakupem.

##### Własna przeglądarka agenta
LumoBot [tak]: Agent ma własną przeglądarkę w tle: szuka, czyta, klika, pobiera pliki i pamięta karty oraz logowania. Nie zajmuje twojego ekranu, a dane zostają w lokalnym projekcie.
OpenBot [tak]: Używa przeglądarki na twoim komputerze, a jej dane leżą obok obszarów roboczych, rozmów i plików. W serwerze zespołowym przeglądarka działa na zarządzanym serwerze. Oba programy dają agentowi dostęp do sieci.

##### Aktualizacje
LumoBot [tak]: Program sprawdza nowe wydania. Przy włączonej opcji sam pobiera i instaluje je przy uruchomieniu, przy wyłączonej pokazuje kartę i uruchamiasz aktualizację ręcznie. Od 0.12.1 do 0.14.7 wyszły 23 wersje w dwa dni, 16 i 17 listopada 2026.
OpenBot [częściowo]: Strona udostępnia osobne instalatory dla platform. Brak danych o automatycznym sprawdzaniu i instalowaniu wydań oraz o punktach powrotu przy aktualizacji.

---

### vs-grok-bot

**Tytuł tabeli:** LumoBot kosztuje 0 zł i zostaje na twoim komputerze. Grok Bot bierze 30 USD i pracuje w chmurze
**Licznik:** LumoBot lepszy w 11 z 16 (remis w 3, Grok Bot lepszy w 2)

#### Ile płacisz

##### Cena aplikacji
LumoBot [tak]: Aplikacja kosztuje 0 zł i nie ma osobnej opłaty za program. Za rok korzystania nie zapłacisz za dostęp ani złotówki, tylko ewentualnie za wybrany plan AI.
Grok Bot [nie]: Premium kosztuje 30 USD miesięcznie, Super 100 USD, a Ultra 200 USD, według x.ai/bot. Samo Premium to 360 USD rocznie za dostęp do narzędzia.

##### Płatność za AI
LumoBot [częściowo]: Nie sprzedajemy modelu. Płacisz własnym planem lub kluczem API albo nic, gdy użyjesz Ollamy lub LM Studio. Rachunek u dostawcy chmurowego jest osobny od aplikacji.
Grok Bot [tak]: Plan zawiera określoną pulę użycia, a po jej wyczerpaniu rozliczasz tokeny lub dodatkowe użycie. SpaceXAI może dobrać model do zadania, więc nie kontrolujesz kosztu konkretnego modelu. Układ jest prosty, dlatego tu Grok Bot ma punkt.

##### Darmowy start
LumoBot [tak]: Program jest bezpłatny, bez limitu i bez okresu próbnego. Z modelem lokalnym nie płacisz za API.
Grok Bot [częściowo]: Oficjalny cennik pokazuje plany płatne od 30 USD miesięcznie, a dostęp próbny ma limit użycia. Brak danych o bezterminowym, pełnym darmowym planie.

#### Gdzie pracujesz i co z danymi

##### System i urządzenia
LumoBot [częściowo]: Działa na Windows 10 i 11, a projekt to folder na twoim komputerze. Nie ma jeszcze macOS, Linuksa ani aplikacji na telefon.
Grok Bot [tak]: Działa na Windowsie, macOS i Linuksie, ma aplikacje na iOS i Androida, a do tego kanały X, Slack, Teams i udział w spotkaniach. Dla kogoś, kto pracuje z telefonu albo na Macu, to realna przewaga.

##### Praca bez internetu
LumoBot [tak]: Ollama i LM Studio pozwalają uruchomić model lokalnie, bez klucza i opłaty za API. Rozpoznawanie głosu może działać offline. Nie zależysz od cudzych serwerów.
Grok Bot [częściowo]: Podstawowy tryb używa komputera w chmurze, a lokalnego komputera można użyć po wyrażeniu zgody. Brak danych o pełnym trybie offline z lokalnym modelem.

##### Dane zostają u ciebie
LumoBot [częściowo]: Folder projektu i dane aplikacji leżą lokalnie, a hasła są szyfrowane i nie trafiają do modelu. Przy modelu chmurowym treść zadania może trafić do wybranego dostawcy.
Grok Bot [nie]: Praca odbywa się na trwałym komputerze w chmurze, a wszystkie twoje Boty dzielą ten komputer, pliki, przeglądarkę i logowania. Producent opisuje szyfrowanie w tranzycie i w spoczynku oraz możliwość rezygnacji z trenowania, ale dane i tak są po jego stronie.

#### Wybór AI

##### Dostawcy AI
LumoBot [tak]: 14 dostawców i 158 modeli: Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, OpenCode, Cursor, Ollama, LM Studio. Wybierasz tego, który ci pasuje.
Grok Bot [częściowo]: Model pochodzi od SpaceXAI albo z listy podprocesorów, a FAQ nie podaje stałej liczby dostawców w planie. Nazwa i dobór modelu są ukryte za automatycznym wyborem Bota.

##### Osobny model dla każdego agenta
LumoBot [tak]: Każdy agent ma własny model: mocny dla Lidera, tańszy albo lokalny dla prostszych zadań. Sam ustawiasz, za co ile płacisz.
Grok Bot [nie]: Bot wybiera model automatycznie i nie ustawisz go ręcznie dla każdego Bota. Boty jednego użytkownika współdzielą komputer i sesje nawet przy różnych rolach.

##### Twój własny plan AI
LumoBot [tak]: Podłączasz plan, za który już płacisz, klucz API albo model lokalny. Nie jesteś zamknięty w jednym ekosystemie.
Grok Bot [częściowo]: Obsługiwane są wybrane plany X, Grok i Cursor, między innymi SuperGrok, X Premium+ i starsze plany Cursor. Brak danych o podłączeniu własnego klucza API.

#### Zespół i pewność wyniku

##### Zespół agentów
LumoBot [tak]: Lider dzieli zadanie między specjalistów, którzy przekazują sobie zlecenia i pliki w jednym projekcie. Osobny agent może być sprawdzającym.
Grok Bot [tak]: Boty działają równolegle, przekazują sobie zadania i można je udostępniać zespołowi. Team Bots integrują pracę przez Slack, Teams i kanały spotkań. Zespół jest równie dobry, więc remis.

##### Kto ocenia wynik
LumoBot [tak]: Wynik sprawdza test albo niezależny sprawdzający, czyli Neuro. Samo „gotowe" od agenta nie kończy pracy, a reguła sprawdzania wchodzi do zlecenia.
Grok Bot [częściowo]: Auto Review obsługuje wybrane wrażliwe akcje, a ty możesz wymagać zgody przed działaniem. To kontrola bezpieczeństwa. Brak danych o stałym sprawdzającym, który potwierdza końcowy cel zadania.

##### Praca do skutku
LumoBot [tak]: Gdy test lub sprawdzający nie potwierdzi celu, agent próbuje ponownie. Zadanie kończy się dopiero po pozytywnym sprawdzeniu.
Grok Bot [tak]: Bot działa na trwałym komputerze w chmurze, a zamknięcie aplikacji, laptopa albo telefonu nie zatrzymuje zadania. Producent opisuje pracę 24/7. Brak danych o końcu wyznaczanym niezależnym testem, ale wygoda jest realna.

##### Droga powrotu
LumoBot [tak]: Praca idzie na osobnej gałęzi git, a punkt powrotu zapisuje się po każdej rundzie. Cofasz pojedynczy krok bez ryzyka dla reszty projektu.
Grok Bot [częściowo]: Dokumentacja opisuje zgody i audyt działań. Brak danych o punktach powrotu git po każdej rundzie i o cofnięciu całego zadania.

#### Na co dzień

##### Rozmowa głosowa po polsku
LumoBot [tak]: Wyspa obsługuje rozmowę po polsku z wyborem jednego z pięciu głosów. Rozpoznawanie może działać offline.
Grok Bot [częściowo]: Aplikacja mobilna ma głos i dyktowanie, ale oficjalny opis nie potwierdza języka polskiego. Brak danych o liczbie głosów i polskim rozpoznawaniu.

##### Własna przeglądarka agenta
LumoBot [tak]: Własna przeglądarka agenta działa w tle, pamięta karty i logowania, pobiera pliki i nie zajmuje twojego ekranu.
Grok Bot [tak]: Bot ma przeglądarkę na swoim komputerze w chmurze, a Boty jednego użytkownika dzielą sesje i logowania. Dostęp z telefonu steruje tym samym środowiskiem. Oba programy są tu równe.

##### Aktualizacje
LumoBot [tak]: Sam sprawdza nowe wydania i przy włączonej opcji instaluje je przy uruchomieniu. 23 wersje od 0.12.1 do 0.14.7 wyszły w dwa dni, 16 i 17 listopada 2026.
Grok Bot [częściowo]: To usługa dostępna przez aplikacje i kanały. Brak danych o mechanizmie aktualizacji aplikacji, automatycznym sprawdzaniu wersji i punktach powrotu.

---

### vs-claude-cowork

**Tytuł tabeli:** LumoBot daje wybór modeli i prywatność za 0 zł. Claude Cowork zamyka cię u jednego dostawcy
**Licznik:** LumoBot lepszy w 11 z 16 (remis w 3, Claude Cowork lepszy w 2)

#### Ile płacisz

##### Cena aplikacji
LumoBot [tak]: Aplikacja kosztuje 0 zł i nie wymaga abonamentu. Płacisz tylko tam, gdzie sam wybierzesz płatnego dostawcę AI.
Claude Cowork [nie]: Cowork wymaga płatnego planu Claude. Pro kosztuje 20 USD miesięcznie (17 USD przy płatności rocznej), Max 100 USD, a Ultra 200 USD miesięcznie, według claude.com/pricing.

##### Płatność za AI
LumoBot [częściowo]: Podłączasz własny plan, klucz API albo model lokalny za 0 zł. Rachunek u dostawcy chmurowego jest osobny od aplikacji.
Claude Cowork [tak]: Limit zależy od planu i okna użycia, a po jego wykorzystaniu możesz dokupić kredyty API. Subskrypcja nie oznacza więc nieograniczonej pracy, ale zasady są jasne w jednym miejscu, dlatego tu Cowork ma punkt.

##### Darmowy start
LumoBot [tak]: Program jest bezpłatny, bez limitu i okresu próbnego. Modele lokalne działają bez opłat za API.
Claude Cowork [nie]: Claude ma plan Free, ale sam Cowork jest tylko w płatnych planach: Pro, Max, Ultra, Team i Enterprise. Darmowy start nie daje dostępu do pełnego Cowork.

#### Gdzie pracujesz i co z danymi

##### System i urządzenia
LumoBot [częściowo]: Windows 10 i 11, a projekt to folder na twoim komputerze. Brak macOS, Linuksa i telefonów.
Claude Cowork [tak]: Cowork działa w Claude Desktop na macOS, Windows i Linuksie (w becie), a także w webie, na telefonie i w Claude in Chrome. Dla osób pracujących na wielu urządzeniach to duży plus.

##### Praca bez internetu
LumoBot [tak]: Ollama i LM Studio uruchamiają model lokalnie, bez klucza i opłaty za API. Głos może działać offline. Działasz bez zewnętrznych serwerów.
Claude Cowork [częściowo]: Pliki lokalne są dostępne przez aplikację desktopową, ale wykonanie Cowork odbywa się w sesji chmurowej. Brak danych o trybie offline z lokalnym modelem.

##### Dane zostają u ciebie
LumoBot [częściowo]: Folder projektu i dane leżą lokalnie, a hasła są szyfrowane i nie trafiają do modelu. Przy modelu chmurowym treść zadania może trafić do wybranego dostawcy.
Claude Cowork [nie]: Sesje chmurowe i pliki są zapisane na koncie Claude, więc treść zadania opuszcza komputer. Sesja lokalna zapisuje historię na dysku, ale dostęp do lokalnych plików wymaga działającej aplikacji desktopowej.

#### Wybór AI

##### Dostawcy AI
LumoBot [tak]: 14 dostawców i 158 modeli, w tym Claude, ChatGPT i Codex, Gemini, Mistral i OpenRouter. Claude możesz używać także w LumoBocie.
Claude Cowork [nie]: Jeden dostawca, Anthropic: modele Claude, między innymi Opus, Sonnet, Haiku i Fable. Jeśli inny model będzie lepszy lub tańszy, nie podłączysz go w samym Cowork.

##### Osobny model dla każdego agenta
LumoBot [tak]: Każdy agent ma własny model i rolę. Dobierasz moc i koszt do zadania, nie do całego projektu.
Claude Cowork [częściowo]: Możesz używać modeli Claude dostępnych w planie, ale tylko z ekosystemu Anthropic. Brak danych o przypisaniu dowolnego modelu zewnętrznego do każdego podagenta.

##### Twój własny plan AI
LumoBot [tak]: Podłączasz plan, za który płacisz, klucz API wybranego dostawcy albo Ollamę i LM Studio. Nie kupujesz abonamentu od LumoBota.
Claude Cowork [nie]: Do Cowork potrzebny jest płatny plan Claude. Plany innych dostawców nie zastąpią subskrypcji Anthropic, a własny klucz nie jest opisany.

#### Zespół i pewność wyniku

##### Zespół agentów
LumoBot [tak]: Lider dzieli zadanie między specjalistów, a agenci przekazują sobie zlecenia i pliki. Osobny agent może pełnić rolę sprawdzającego.
Claude Cowork [tak]: Cowork koordynuje podagentów i uruchamia równoległe strumienie pracy. Plany Team i Enterprise dodają administrację i współpracę organizacji. Remis.

##### Kto ocenia wynik
LumoBot [tak]: Test albo niezależny sprawdzający (Neuro) decyduje, że zadanie jest skończone. Wynik nie zależy od samooceny agenta.
Claude Cowork [częściowo]: Wybierasz ręczną zgodę, automatyczną albo pominięcie zgód, a tryb automatyczny ma kontrolę bezpieczeństwa. Anthropic sam ostrzega, że może ona przeoczyć ryzykowną akcję. To ochrona przed szkodą, nie ocena, czy wynik spełnia twoje wymaganie.

##### Praca do skutku
LumoBot [tak]: Gdy sprawdzenie nie przejdzie, agent próbuje dalej. Zadanie kończy się dopiero po pozytywnym wyniku, a Lider porządkuje kolejne prace.
Claude Cowork [tak]: Obsługuje zadania wieloetapowe i długie, a sesja chmurowa może działać po zamknięciu laptopa. Brak danych o automatycznym poprawianiu aż do niezależnego testu, ale długą pracę bez pilnowania Cowork ma.

##### Droga powrotu
LumoBot [tak]: Osobna gałąź git i punkt powrotu po każdej rundzie. Błąd agenta cofasz do wybranego punktu.
Claude Cowork [częściowo]: Przy części działań usuwających prosi o zgodę, ale to potwierdzenie, a nie punkt powrotu git. Brak danych o checkpoincie po każdej rundzie.

#### Na co dzień

##### Rozmowa głosowa po polsku
LumoBot [tak]: Wyspa obsługuje rozmowę po polsku z pięcioma głosami do wyboru, a rozpoznawanie może działać offline.
Claude Cowork [częściowo]: Cennik wymienia Voice mode w obsługiwanych planach, ale oficjalne materiały nie potwierdzają polskiego. Brak danych o rozpoznawaniu offline i liczbie głosów.

##### Własna przeglądarka agenta
LumoBot [tak]: Własna przeglądarka w tle: szuka, czyta, klika, pobiera pliki, pamięta karty i logowania. Dane zostają w lokalnym projekcie.
Claude Cowork [tak]: Ma wbudowaną przeglądarkę i Claude in Chrome, a agent wykonuje wieloetapowe zadania w sesji przeglądarki. Sesja chmurowa działa na koncie Claude. Oba programy są tu równe.

##### Aktualizacje
LumoBot [tak]: Sam sprawdza i instaluje nowe wydania. Od 0.12.1 do 0.14.7 wyszły 23 wersje w dwa dni, 16 i 17 listopada 2026.
Claude Cowork [częściowo]: Cowork jest funkcją usługi Claude i desktopu. Brak danych o mechanizmie aktualizacji aplikacji i lokalnym punkcie powrotu przy aktualizacji.

---

### vs-manus

**Tytuł tabeli:** LumoBot pilnuje jakości i trzyma dane u ciebie. Manus liczy kredyty i pracuje w chmurze
**Licznik:** LumoBot lepszy w 6 z 16 (remis w 8, Manus lepszy w 2)

#### Ile płacisz

##### Cena aplikacji
LumoBot [tak]: Aplikacja kosztuje 0 zł, bez abonamentu. Zaczynasz bez karty i bez podawania danych płatniczych.
Manus [tak]: Plan Free kosztuje 0 USD, Pro 20 USD, a Max 200 USD miesięcznie, według manus.im/pricing. Przy cenie startowej jest remis.

##### Płatność za AI
LumoBot [częściowo]: Podłączasz własny plan, klucz API albo model lokalny za 0 zł. Rachunek u dostawcy chmurowego jest osobny.
Manus [tak]: Praca jest rozliczana kredytami, a po limicie płacisz za dalsze użycie. Manus Flex pozwala na własne klucze, ale tylko w opisanym mechanizmie planu. Zasady są jasne, więc Manus ma tu punkt.

##### Darmowy start
LumoBot [tak]: Program działa bez limitu i okresu próbnego. Model wybierasz osobno, także lokalny, za który nie płacisz za API.
Manus [tak]: Free daje 300 kredytów dziennie, Pro 4000, a Max 40000 miesięcznie. To hojny start, ale ma twardy limit i duże zadania mogą go szybko zużyć.

#### Gdzie pracujesz i co z danymi

##### System i urządzenia
LumoBot [częściowo]: Windows 10 i 11, praca w folderze projektu. Brak macOS, Linuksa i telefonów.
Manus [tak]: Działa w webie, na Windowsie i macOS oraz w aplikacjach iOS i Android. Manus Studio dodaje lokalny dostęp do plików, terminala i aplikacji. Pokrycie jest szerokie.

##### Praca bez internetu
LumoBot [tak]: Ollama i LM Studio uruchamiają model lokalnie, bez klucza i opłaty za API. Głos może działać offline. Całość działa bez chmury.
Manus [częściowo]: Studio może uruchamiać komendy, czytać pliki i używać aplikacji na komputerze, ale planowanie i model nadal działają w chmurze. Brak danych o pełnym trybie offline dla całego zadania.

##### Dane zostają u ciebie
LumoBot [częściowo]: Folder projektu i dane leżą lokalnie, hasła są szyfrowane i nie trafiają do modelu. Przy modelu chmurowym treść zadania idzie do wybranego dostawcy.
Manus [nie]: Planowanie odbywa się w chmurze, a treść przeczytanego pliku staje się częścią zadania wysłanego do usługi. Studio robi część działań lokalnie, ale to nie odcina cię od chmury.

#### Wybór AI

##### Dostawcy AI
LumoBot [tak]: 14 dostawców i 158 modeli: Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, Ollama, LM Studio i inni. Przełączasz je bez zmiany sposobu pracy.
Manus [tak]: Lista obejmuje Manus 2.0 Lite, 2.0 i 2.0 Max oraz Gemini, Google Veo, ByteDance Seedance, MiniMax H3, Nano Banana, Lyria, GPT Image, ElevenLabs i Tripo. Katalog ma modele tekstowe i media, więc jest remis.

##### Osobny model dla każdego agenta
LumoBot [tak]: Każdy agent ma własny model, więc dobierasz moc i koszt do zadania.
Manus [tak]: Manus może sam dobrać model albo wybierasz go z dostępnej listy. Wybór mieści się w katalogu Manus, nie dotyczy dowolnego modelu z zewnątrz, ale elastyczność jest.

##### Twój własny plan AI
LumoBot [tak]: Własny plan, klucz API albo Ollama i LM Studio. Ta opcja jest dostępna zawsze, w każdej wersji.
Manus [częściowo]: Własne klucze obsługuje Manus Flex, powiązany z określonym planem i rozliczeniem. Brak danych o podłączeniu dowolnego planu AI do każdej funkcji.

#### Zespół i pewność wyniku

##### Zespół agentów
LumoBot [tak]: Lider dzieli zadanie między specjalistów, a agenci przekazują sobie zlecenia i pliki w jednym projekcie.
Manus [tak]: Obsługuje zadania równoległe, a Manus 2.0 opisuje grupy agentów w Cue. Automatyzacje uruchamiają pracę o czasie albo po zdarzeniu. Remis.

##### Kto ocenia wynik
LumoBot [tak]: Test albo niezależny sprawdzający (Neuro) decyduje, czy zadanie jest skończone. Nie polegasz na samoocenie agenta.
Manus [nie]: Studio ma tryby Ask for approval, Approve for me i Full access, ale kontrolują one zgodę na działania, nie prawdziwość wyniku. Brak danych o stałym sprawdzającym końcowy cel, więc ocena zostaje na tobie.

##### Praca do skutku
LumoBot [tak]: Gdy sprawdzenie nie przejdzie, agent poprawia błędy kolejnymi rundami. Kończy dopiero po pozytywnym wyniku.
Manus [tak]: Wykonuje zadania projektowe w chmurze, a Cloud Computer zostaje włączony po zamknięciu laptopa. Brak danych o automatycznym poprawianiu do niezależnego potwierdzenia. Oba programy kończą dłuższe zadania.

##### Droga powrotu
LumoBot [tak]: Osobna gałąź git i punkt powrotu po każdej rundzie. Błędny krok cofasz.
Manus [częściowo]: Opisuje zgody i tryb pracy Studio. Brak danych o punktach powrotu git po każdej rundzie i o cofnięciu całego zadania.

#### Na co dzień

##### Rozmowa głosowa po polsku
LumoBot [tak]: Rozmawiasz po polsku z pięcioma głosami do wyboru, a rozpoznawanie może działać offline.
Manus [częściowo]: Ma aplikacje mobilne, ale cennik i dokumentacja Studio nie potwierdzają polskiego głosu. Brak danych o liczbie głosów i rozpoznawaniu offline.

##### Własna przeglądarka agenta
LumoBot [tak]: Własna przeglądarka w tle: szuka, klika, pobiera pliki, pamięta karty i logowania.
Manus [tak]: Cloud Computer to trwały komputer w chmurze, a dokumentacja modeli opisuje też My Browser. Przeglądarka działa po zamknięciu laptopa, bo środowisko jest po stronie usługi. Oba programy pracują w sieci.

##### Aktualizacje
LumoBot [tak]: Sam sprawdza i instaluje nowe wydania: 23 wersje w dwa dni, 16 i 17 listopada 2026.
Manus [tak]: To usługa chmurowa aktualizowana przez producenta, a Studio ma własne wydania aplikacji. Brak danych o lokalnym punkcie powrotu po aktualizacji. Remis.

---

### vs-openclaw

**Tytuł tabeli:** LumoBot kończy zadanie testem. OpenClaw zostawia kontrolę wyniku tobie
**Licznik:** LumoBot lepszy w 5 z 16 (remis w 9, OpenClaw lepszy w 2)

#### Ile płacisz

##### Cena aplikacji
LumoBot [tak]: Aplikacja kosztuje 0 zł, bez abonamentu i bez opłaty za sam program. Płacisz tylko za wybrany plan AI, klucz lub własny sprzęt.
OpenClaw [tak]: Nie ma abonamentu ani hostowanego planu i nie pobiera własnego tokena za korzystanie z Gateway. Koszt może pojawić się po stronie serwera, sprzętu lub dostawcy modelu. Remis.

##### Płatność za AI
LumoBot [częściowo]: Podłączasz plan, klucz API albo model lokalny, a LumoBot nie sprzedaje własnego modelu. Rachunek u dostawcy chmurowego jest osobny.
OpenClaw [tak]: Płacisz dostawcy modelu bezpośrednio, jeśli jego endpoint ma opłatę za API. Model lokalny nie ma opłaty, ale wymaga własnego sprzętu. Układ jest prosty, więc tu OpenClaw ma punkt.

##### Darmowy start
LumoBot [tak]: Program bez limitu i okresu próbnego. Z Ollamą lub LM Studio nie płacisz za API.
OpenClaw [tak]: Kod jest otwarty na licencji MIT i nie ma abonamentu. Darmowy start nie oznacza darmowego dostępu do płatnego modelu API ani do własnego serwera. Remis.

#### Gdzie pracujesz i co z danymi

##### System i urządzenia
LumoBot [częściowo]: Windows 10 i 11, a projekt to folder na komputerze. Brak macOS, Linuksa i telefonów.
OpenClaw [tak]: Gateway działa na macOS, Windowsie, Linuksie i WSL2, a iOS i Androida mogą być węzłami. Dostęp jest przez web, CLI i komunikatory. Pokrycie jest szersze niż w LumoBocie.

##### Praca bez internetu
LumoBot [tak]: Ollama i LM Studio pozwalają uruchomić model lokalnie, bez klucza i opłaty. Głos może działać offline.
OpenClaw [tak]: Dokumentacja obsługuje dostawców hostowanych i lokalne usługi modeli, a Gateway uruchomisz na własnym komputerze. Przy dostawcy chmurowym prompt wychodzi z komputera, a komunikator może wymagać sieci. Remis.

##### Dane zostają u ciebie
LumoBot [częściowo]: Folder projektu i dane leżą lokalnie, a hasła są szyfrowane i nie trafiają do modelu. Przy modelu chmurowym treść zadania idzie do wybranego dostawcy.
OpenClaw [częściowo]: Stan, pamięć i poświadczenia są na sprzęcie użytkownika, ale prompty trafiają do dostawcy modelu i platformy czatu. Statystyki anonimowe są opcjonalne, a jeden Gateway tworzy jedną wspólną granicę zaufania. Układ podobny do LumoBota.

#### Wybór AI

##### Dostawcy AI
LumoBot [tak]: 14 dostawców i 158 modeli: Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, OpenCode, Cursor, Ollama, LM Studio.
OpenClaw [tak]: Model wybierasz w formacie `provider/model`, a katalog obejmuje dostawców hostowanych, własne endpointy i usługi lokalne. Liczba zależy od konfiguracji, brak jednej stałej. Remis.

##### Osobny model dla każdego agenta
LumoBot [tak]: Każdy agent ma własny model i rolę, a zmiana modelu nie usuwa folderu projektu.
OpenClaw [tak]: Dokumentacja opisuje wybór modelu per agent i per sesja, a routing może kierować różne role do różnych providerów. Własny endpoint ustawisz osobno dla wybranej roli. Remis.

##### Twój własny plan AI
LumoBot [tak]: Plan, za który płacisz, klucz API albo model lokalny w Ollamie lub LM Studio.
OpenClaw [tak]: Przyjmuje własny klucz dostawcy i własne endpointy, a lokalny model możesz podłączyć zamiast planu, bo planu OpenClaw nie ma. Remis.

#### Zespół i pewność wyniku

##### Zespół agentów
LumoBot [tak]: Lider dzieli zadanie między specjalistów, którzy przekazują sobie zlecenia i pliki w jednym projekcie.
OpenClaw [tak]: Gateway ma routing wielu agentów i rozdziela przestrzenie oraz sesje. Tryb multiplayer claw i kanały komunikatorów pozwalają współdzielić pracę. Remis.

##### Kto ocenia wynik
LumoBot [tak]: Test albo niezależny sprawdzający (Neuro) potwierdza wynik, a samo „gotowe" od agenta nie wystarcza. Nie wierzysz agentowi na słowo.
OpenClaw [nie]: Polecenie `openclaw security audit` sprawdza ustawienia bezpieczeństwa, a zasady narzędzi, listy dozwolonych osób i parowanie kanałów kontrolują dostęp. Brak danych o stałym sprawdzającym, który ocenia spełnienie celu zadania. Ocena jest na tobie.

##### Praca do skutku
LumoBot [tak]: Agent próbuje ponownie, gdy test lub sprawdzający nie potwierdzi celu. Kończy dopiero po pozytywnym wyniku.
OpenClaw [częściowo]: Automatyzacje i sesje mogą działać długo, a Gateway pracuje na twoim serwerze. Brak danych o gwarancji powtarzania pracy aż do przejścia testu.

##### Droga powrotu
LumoBot [tak]: Osobna gałąź git i punkt powrotu po każdej rundzie. Błędny krok cofasz do wybranego punktu.
OpenClaw [częściowo]: Może korzystać z kontroli wersji, którą sam skonfigurujesz. Brak danych o automatycznych punktach po każdej rundzie, a dokumentacja bezpieczeństwa nie zastępuje cofania zmian w projekcie.

#### Na co dzień

##### Rozmowa głosowa po polsku
LumoBot [tak]: Rozmowa po polsku, pięć głosów do wyboru, rozpoznawanie może działać offline.
OpenClaw [częściowo]: Gateway przyjmuje wiadomości z wielu komunikatorów, ale oficjalne materiały opisują kanały i węzły, nie polski głos. Brak danych o liczbie głosów i rozpoznawaniu offline.

##### Własna przeglądarka agenta
LumoBot [tak]: Własna przeglądarka w tle z pamięcią kart i logowań, współpracuje z wyspą.
OpenClaw [tak]: Gateway steruje przeglądarką przez narzędzia i sesję, a dostęp zabezpieczasz parowaniem, zasadami i listami dozwolonych osób. Brak danych o gotowej przeglądarce z pamięcią kart jak w LumoBocie, ale sterowanie jest. Remis.

##### Aktualizacje
LumoBot [tak]: Sam sprawdza i instaluje nowe wydania: 23 wersje w dwa dni, 16 i 17 listopada 2026.
OpenClaw [częściowo]: Aktualizujesz instalację sam, a wydania są w repozytorium GitHub. Brak danych o automatycznej aktualizacji bez twojego udziału.

---

### vs-devin

**Tytuł tabeli:** LumoBot pracuje u ciebie i pozwala wybrać model dla każdego agenta. Devin działa w chmurze, w ramach planu
**Licznik:** LumoBot lepszy w 6 z 16 (remis w 8, Devin lepszy w 2)

#### Ile płacisz

##### Cena aplikacji
LumoBot [tak]: Aplikacja kosztuje 0 zł, bez abonamentu i bez opłaty za sam program.
Devin [tak]: Plan Free kosztuje 0 USD, Pro 20 USD, Teams 80 USD, a Max 200 USD miesięcznie. Enterprise jest rozliczany na umowę, według devin.ai/pricing. Przy cenie startowej jest remis.

##### Płatność za AI
LumoBot [częściowo]: Podłączasz plan, klucz API albo model lokalny. Rachunek u dostawcy chmurowego jest osobny.
Devin [tak]: Plan ma limit pracy agenta, a po jego wyczerpaniu płatny plan może dokupić użycie według stawek API. Pro i Max mogą używać planu ChatGPT. Układ jest jasny, więc Devin ma tu punkt.

##### Darmowy start
LumoBot [tak]: Program bez limitu i okresu próbnego, a modele lokalne bez opłat za API.
Devin [tak]: Free ma 0 USD miesięcznie, ale mały limit pracy agentów. Większe limity i praca zespołowa wymagają Pro, Max, Teams albo Enterprise. Remis.

#### Gdzie pracujesz i co z danymi

##### System i urządzenia
LumoBot [częściowo]: Windows 10 i 11, a projekt to folder na komputerze. Brak macOS, Linuksa i telefonów.
Devin [tak]: Działa w webie i chmurze, ma CLI i tryb pracy na komputerze. Wirtualne środowiska mogą uruchamiać Windows, macOS i Linuksa do testów przeglądarkowych. Pokrycie jest szersze niż w LumoBocie.

##### Praca bez internetu
LumoBot [tak]: Ollama i LM Studio uruchamiają model lokalnie, bez klucza i opłaty. Głos może działać offline.
Devin [częściowo]: Zadania i środowiska Devina działają w chmurze, a dedykowane środowisko nie jest trybem offline. Brak danych o pełnym agencie z modelem bez sieci na twoim komputerze.

##### Dane zostają u ciebie
LumoBot [częściowo]: Folder projektu i dane leżą lokalnie, hasła są szyfrowane i nie trafiają do modelu. Przy modelu chmurowym treść zadania idzie do wybranego dostawcy.
Devin [nie]: Devin pracuje na danych przekazanych w aplikacji web, a Cognition deklaruje brak trenowania modeli na kodzie i danych klienta. Wdrożenie dedykowane trzyma dane w dzierżawie klienta. To lepiej chroni firmy, ale nadal jest to chmura poza twoim komputerem.

#### Wybór AI

##### Dostawcy AI
LumoBot [tak]: 14 dostawców i 158 modeli: Claude, ChatGPT i Codex, Gemini, Mistral, OpenRouter, OpenCode, Cursor, Ollama, LM Studio.
Devin [tak]: Oficjalna strona wymienia własny model SWE-2 oraz dostęp do modeli OpenAI, Claude, Gemini, SpaceXAI i wybranych open source. Dostępny model zależy od planu i limitu. Remis.

##### Osobny model dla każdego agenta
LumoBot [tak]: Każdy agent ma własny model, więc dobierasz moc i koszt do zadania, a Lider i specjalista mogą mieć różne konfiguracje.
Devin [częściowo]: Model wybierasz z puli dostępnej dla planu. Devin Bots uruchamiają równoległe sesje, ale brak danych o dowolnym modelu przypisanym ręcznie do każdego Bota.

##### Twój własny plan AI
LumoBot [tak]: Plan, który już masz, klucz API albo model lokalny. Dostępne zawsze.
Devin [częściowo]: Plan ChatGPT działa w Pro i Max. Brak danych o podłączeniu planu Claude, Gemini albo własnego klucza API, a zakres zależy od planu Devin.

#### Zespół i pewność wyniku

##### Zespół agentów
LumoBot [tak]: Lider dzieli zadanie między specjalistów, a agenci przekazują sobie zlecenia i pliki.
Devin [tak]: Devin Bots dzielą pracę na równoległe zadania, plan Teams daje współdzielenie i sesje multiplayer. Zadania mogą przychodzić ze Slacka i Teams, a Devin współpracuje z Jirą i Linear. Remis.

##### Kto ocenia wynik
LumoBot [tak]: Test albo niezależny sprawdzający (Neuro) decyduje, że zadanie jest skończone. Samo „gotowe" od agenta nie wystarcza.
Devin [tak]: Uruchamia testy, CI i testy w przeglądarce, a Devin Review wskazuje błędy i luki bezpieczeństwa. Dokumentacja ostrzega, że wynik nadal wymaga przeglądu człowieka. Remis.

##### Praca do skutku
LumoBot [tak]: Agent próbuje ponownie, gdy sprawdzenie nie przejdzie, i kończy dopiero po pozytywnym wyniku.
Devin [tak]: Planuje, pisze, uruchamia i testuje kod, a Devin Bots działają w chmurze po zamknięciu laptopa. Brak danych o powtarzaniu aż do niezależnego potwierdzenia poza testami i review. Remis.

##### Droga powrotu
LumoBot [tak]: Osobna gałąź git i punkt powrotu po każdej rundzie. Błędny krok cofasz.
Devin [częściowo]: Pracuje na gałęziach i pull requestach, a Enterprise może używać ochrony gałęzi. Historia PR nie jest opisana jako checkpoint po każdej rundzie agenta.

#### Na co dzień

##### Rozmowa głosowa po polsku
LumoBot [tak]: Rozmowa po polsku, pięć głosów do wyboru, rozpoznawanie może działać offline.
Devin [częściowo]: Materiały opisują tryb głosowy, ale oficjalne strony nie potwierdzają polskiego. Brak danych o liczbie głosów i rozpoznawaniu offline.

##### Własna przeglądarka agenta
LumoBot [tak]: Własna przeglądarka w tle: szuka, klika, pobiera pliki, pamięta karty i logowania lokalnie.
Devin [tak]: Ma browser do pracy i testów, który uruchamia testy na wirtualnym systemie. Działa w chmurze, nie jako lokalna aplikacja na twoim Windowsie. Remis.

##### Aktualizacje
LumoBot [tak]: Sam sprawdza i instaluje nowe wydania: 23 wersje w dwa dni, 16 i 17 listopada 2026.
Devin [tak]: Usługa chmurowa, więc producent aktualizuje środowisko po swojej stronie. Brak danych o aktualizacji lokalnego CLI i desktopu. Remis.
