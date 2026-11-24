# Weryfikacja faktów v16-b: Manus, OpenClaw, Devin

Sprawdził: Weryfikator, 19.11.2026. Wszystkie strony otwarte tego dnia. Zasada: brak informacji to nie brak funkcji. `[przewaga]` tylko przy potwierdzonej różnicy, inaczej `[brak]` po obu stronach.

## Najważniejsze błędy w starych tekstach

- OpenClaw: nieprawda, że wymaga ręcznej instalacji Gateway i Node (jest instalator Windows Hub), że nie ma automatycznych aktualizacji, że lokalny model wymaga ręcznego endpointu. Ma recenzenta, koordynatora, worktree ze snapshotami i chroniony magazyn sekretów.
- Devin: ma niezależny Quick Review, punkty kontrolne i cofanie, aplikację Devin Desktop na Windows pracującą w lokalnym folderze, rozmowę głosową i wybór modelu przez użytkownika.
- Manus: ma przeglądarkę na twoich logowaniach, nie przechowuje haseł, ma historię wersji i worktree git, Flex w Pro i Max (nie tylko w Pro), a w Max po kredytach płacisz za użycie (praca się nie zatrzymuje).
- Potwierdzone przewagi LumoBota: 0 zł bez kredytów i limitu programu; model lokalny bez klucza (wobec Manusa i Devina); własny klucz bez płatnego planu (wobec Manusa); treść zostaje na komputerze przy modelu lokalnym (wobec Manusa i Devina). Wobec OpenClaw nie ma potwierdzonej przewagi.

## Tabela vs-manus (tresci/tabela-v15.md)

### 1. Sprawdzenie przed „gotowe”
- Werdykt: poprawić. Stare: tylko tryby zgody. Pominięto, że Manus uruchamia testy i poprawia błędy na prośbę. Przewaga LumoBota niepotwierdzona.
- Poprawione zdanie: Manus uruchamia testy i poprawia błędy, gdy o to poprosisz. Ma też tryby zgody: Ask for approval, Approve for me i Full access. Dokumentacja nie opisuje obowiązkowego testu na końcu każdego zadania, ale to nie dowodzi, że go nie ma.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/features/desktop.md (19.11.2026)

### 2. Niezależny sprawdzający
- Werdykt: nie da się potwierdzić. Brak sprawdzającego nie jest potwierdzony; główne zadanie sprawdza spójność wyników.
- Poprawione zdanie: W zadaniach równoległych główne zadanie czyta wyniki pozostałych i sprawdza, czy są spójne. W trybie Approve for me automatyczny przegląd blokuje ryzykowne działania. Dokumentacja nie opisuje osobnego sprawdzającego dla każdego zadania.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/features/parallel-tasks.md, https://manus.im/docs/features/desktop.md (19.11.2026)

### 3. Praca do skutku po teście
- Werdykt: nie da się potwierdzić. Brak pętli poprawek niepotwierdzony; Manus poprawia testy na prośbę.
- Poprawione zdanie: Manus może sam uruchomić testy i poprawić te, które nie przechodzą, jeśli tak opiszesz zadanie. Dokumentacja nie opisuje stałej pętli poprawek aż do przejścia kryterium.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/features/desktop.md (19.11.2026)

### 4. Neuro hamuje przed stratą tokenów
- Werdykt: nie da się potwierdzić. Dopisano limit wydatków u dostawcy w Flex. Neuro jest własnym mechanizmem LumoBota, brak odpowiednika u Manusa niepotwierdzony.
- Poprawione zdanie: Manus pokazuje zużycie kredytów, a w Manus Flex radzi ustawić limit wydatków u dostawcy modelu. Dokumentacja nie opisuje hamulca opartego na historii zadań.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/models/manus-flex.md (19.11.2026)

### 5. Punkt powrotu
- Werdykt: poprawić. Stare: "brak danych o punktach powrotu". Manus ma historię wersji, Branch i worktree git.
- Poprawione zdanie: Manus zapisuje wersje projektu stron i aplikacji, gdy go o to poprosisz. Ma też Branch, czyli odgałęzienie zadania od dowolnej odpowiedzi, a w Manus Studio tworzy worktree git. Punkty powrotu ma więc także Manus, choć zapis wersji jest na prośbę, a nie po każdej rundzie.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/website-builder/build-locally.md, https://manus.im/docs/llms.txt, https://manus.im/docs/features/desktop.md (19.11.2026)

### 6. Hasła poza modelem
- Werdykt: poprawić. Pominięto, że Browser Operator używa twoich sesji, a Manus nie przechowuje haseł.
- Poprawione zdanie: Browser Operator pracuje w twojej przeglądarce na twoich zalogowanych sesjach, a Manus według dokumentacji nigdy nie przechowuje twoich haseł. Manus radzi też nie dawać agentowi folderu z hasłami i kluczami.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/features/browser-operator.md (19.11.2026)

### 7. Pliki zostają w folderze
- Werdykt: prawda, uzupełnić. Planowanie w chmurze i treść pliku w zadaniu potwierdzone. Dopisano, że Studio działa w lokalnym folderze na Windows.
- Poprawione zdanie: Manus Studio na Windows i macOS pracuje w wybranym folderze na twoim komputerze. Manus planuje jednak każdy krok w swojej chmurze, a treść czytanego pliku staje się częścią zadania.
- Ocena: LumoBot [przewaga], Manus [brak]
- Źródło: https://manus.im/docs/features/desktop.md (19.11.2026)

### 8. Praca bez chmury producenta
- Werdykt: prawda, doprecyzować. Potwierdzone: planowanie w chmurze, lista dostawców Flex bez modeli lokalnych. Dopisano lokalny model jako narzędzie.
- Poprawione zdanie: Studio wykonuje polecenia na twoim komputerze i może tam uruchomić lokalny model jako narzędzie. Agentem kieruje jednak model w chmurze: Manus albo dostawca z listy Manus Flex, na której nie ma modeli lokalnych.
- Ocena: LumoBot [przewaga], Manus [brak]
- Źródło: https://manus.im/docs/features/desktop.md, https://manus.im/docs/models/manus-flex.md (19.11.2026)

### 9. 0 zł bez kredytów i karty
- Werdykt: poprawić. Ceny i kredyty potwierdzone. "Praca się zatrzymuje" było nieścisłe: w Max płacisz za użycie po kredytach.
- Poprawione zdanie: Manus Free kosztuje 0 USD i daje 300 kredytów dziennie. Pro kosztuje 20 USD i daje 4 000 kredytów miesięcznie, a Max 200 USD i 40 000 kredytów. W Max po wyczerpaniu kredytów płacisz za użycie.
- Ocena: LumoBot [przewaga], Manus [brak]
- Źródło: https://manus.im/pricing (19.11.2026)

### 10. Własny plan AI w darmowej wersji
- Werdykt: poprawić. Flex jest w Pro i Max, nie tylko w Pro. Dopisano listę dostawców i to, że media nadal zużywają kredyty.
- Poprawione zdanie: Własne klucze działają w Manus Flex, który jest w planach Pro i Max. Obsługiwani dostawcy to OpenAI, Anthropic, Google AI Studio, xAI, Meta, OpenRouter, Fireworks i Modal. Obrazy, wideo i Cloud Computer nadal zużywają kredyty Manusa.
- Ocena: LumoBot [przewaga], Manus [brak]
- Źródło: https://manus.im/pricing, https://manus.im/docs/models/manus-flex.md (19.11.2026)

### 11. Jawny model przy zadaniu
- Werdykt: poprawić. Stare: "brak stałej kontroli nad modelem". W Flex wybierasz dostawcę, model i wysiłek, a menu pokazuje model. Remis.
- Poprawione zdanie: W Manus Flex sam wybierasz dostawcę, model i poziom wysiłku, a menu pokazuje nazwę modelu. W zwykłym trybie wybierasz Manus 2.0 Lite, 2.0 albo 2.0 Max.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/models/manus-flex.md (19.11.2026)

### 12. Liczba dostawców i modeli
- Werdykt: poprawić. Stare twierdziło przewagę 14/158. Flex ma 8 dostawców z OpenRouter, więc zakresu nie da się uczciwie porównać.
- Poprawione zdanie: Manus Flex obsługuje 8 dostawców, w tym OpenRouter z modelami wielu rodzin. Do mediów Manus ma wbudowane modele obrazu, wideo, dźwięku i 3D. Nie da się uczciwie powiedzieć, kto ma szerszy wybór.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/models/manus-flex.md (19.11.2026)

### 13. Rozmowa głosowa
- Werdykt: poprawić. Pominięto polecenia głosowe w aplikacji na telefon oraz mowę na tekst. Polski niepotwierdzony.
- Poprawione zdanie: W aplikacji Manus na telefonie wydajesz polecenia głosem i oglądasz pulpit komputera na żywo. Manus zamienia też mowę na tekst i tekst na mowę. Oficjalne strony nie mówią, czy rozmowa głosowa działa po polsku.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/features/desktop.md, https://manus.im/docs/features/multi-modal.md (19.11.2026)

### 14. Lider zespołu
- Werdykt: poprawić. Główne zadanie w zadaniach równoległych prowadzi pozostałe, więc przewaga LumoBota niepotwierdzona.
- Poprawione zdanie: W zadaniach równoległych główne zadanie dzieli pracę na osobne zadania, sprawdza postęp, czyta wyniki i wysyła poprawki. Wide Research uruchamia wielu agentów naraz.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/features/parallel-tasks.md (19.11.2026)

### 15. Obrazy i media
- Werdykt: poprawić. Manus ma szersze media: obraz, wideo, dźwięk, 3D i edytor wideo. Ocena: przewaga Manusa.
- Poprawione zdanie: Manus tworzy obrazy, wideo, dźwięk i modele 3D wbudowanymi modelami, ma edytor wideo w Studio i przygotowuje slajdy z grafiką. Te funkcje zużywają kredyty.
- Ocena: LumoBot [brak], Manus [przewaga]
- Źródło: https://manus.im/docs/features/multi-modal.md, https://manus.im/docs/llms.txt (19.11.2026)

### 16. Przeglądarka z twoimi logowaniami
- Werdykt: poprawić. Stare: Manus ma tylko środowisko po stronie usługi. Browser Operator działa w twojej lokalnej przeglądarce z logowaniami.
- Poprawione zdanie: Browser Operator pracuje w twojej przeglądarce na twoich zalogowanych sesjach. Do innych zadań Manus używa odizolowanej przeglądarki w chmurze.
- Ocena: LumoBot [brak], Manus [brak]
- Źródło: https://manus.im/docs/features/browser-operator.md (19.11.2026)

## Tabela vs-openclaw (tresci/tabela-v15.md)

### 1. Sprawdzenie przed „gotowe”
- Werdykt: poprawić. Pominięto dodatek Auto Review z recenzentem.
- Poprawione zdanie: OpenClaw ma dodatek Auto Review, który w wymaganym punkcie kontrolnym sprawdza zmiany w repozytorium osobnym recenzentem. Trzeba go włączyć w ustawieniach.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/tools/autoreview (19.11.2026)

### 2. Niezależny sprawdzający
- Werdykt: poprawić. Stare: "brak danych o sprawdzającym". OpenClaw ma szablon z agentem recenzentem.
- Poprawione zdanie: Gotowy zespół OpenClaw ma agenta recenzenta (reviewer) obok koordynatora, badacza i autora. Auto Review uruchamia recenzenta osobno od autora zmian.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/concepts/multi-agent, https://docs.openclaw.ai/tools/autoreview (19.11.2026)

### 3. Praca do skutku po teście
- Werdykt: nie da się potwierdzić. Koordynator sprawdza wyniki; pętli do skutku dokumentacja nie opisuje.
- Poprawione zdanie: Koordynator OpenClaw sprawdza wyniki specjalistów, zanim odda całość. Dokumentacja nie opisuje stałej pętli poprawek aż do przejścia testu.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/concepts/multi-agent (19.11.2026)

### 4. Neuro hamuje przed stratą tokenów
- Werdykt: nie da się potwierdzić. OpenClaw raportuje koszty; brak odpowiednika Neuro niepotwierdzony.
- Poprawione zdanie: OpenClaw raportuje zużycie tokenów i koszty. Dokumentacja nie opisuje hamulca opartego na historii wyników.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/llms.txt (19.11.2026)

### 5. Punkt powrotu git
- Werdykt: poprawić. Stare: "kontrola wersji, którą sam skonfigurujesz". Managed worktrees dają gałąź i snapshot automatycznie.
- Poprawione zdanie: OpenClaw daje zadaniu agenta własną gałąź git i osobny katalog roboczy (managed worktrees). Przed usunięciem zapisuje ich zawartość, więc możesz ją przywrócić.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/concepts/managed-worktrees (19.11.2026)

### 6. Hasła poza modelem
- Werdykt: poprawić. Stare: "nie potwierdza ukrycia haseł przed modelem". Chroniony magazyn pomija wartości w odczytach agenta.
- Poprawione zdanie: OpenClaw ma chroniony magazyn sekretów. Agent dostaje tylko uchwyt, a prawdziwą wartość Gateway podstawia dopiero przy wysyłce. Można też podłączyć 1Password, Vault albo Bitwarden.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/start/why-openclaw/secrets (19.11.2026)

### 7. Start na Windows
- Werdykt: poprawić, było fałszywe. Stare: "wymaga samodzielnej instalacji Gateway i Node". Windows Hub ma instalator .exe i sam stawia Gateway; skrypt sam dociąga Node.
- Poprawione zdanie: OpenClaw ma aplikację Windows Hub z instalatorem .exe, bez uprawnień administratora. Kreator przy pierwszym uruchomieniu sam instaluje lokalny Gateway. Jest też instalator dla PowerShella, który sam dociąga Node.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/platforms/windows, https://github.com/openclaw/openclaw (19.11.2026)

### 8. Kanały i dostęp
- Werdykt: poprawić. Kanały są dodatkiem, nie warunkiem. OpenClaw ma ich ponad 20, więc w tej kategorii przewaga OpenClaw.
- Poprawione zdanie: OpenClaw działa w ponad 20 komunikatorach, takich jak WhatsApp, Telegram, Discord i Slack. Nieznani nadawcy domyślnie muszą zostać sparowani, a `openclaw security audit` sprawdza ustawienia.
- Ocena: LumoBot [brak], OpenClaw [przewaga]
- Źródło: https://github.com/openclaw/openclaw, https://docs.openclaw.ai/gateway/security (19.11.2026)

### 9. Liczba dostawców i modeli
- Werdykt: prawda, bez przewagi. Liczba modeli zależy od konfiguracji; OpenClaw sam wykrywa modele. Remis.
- Poprawione zdanie: OpenClaw obsługuje wielu dostawców w chmurze i lokalnie przez wtyczki i sam wykrywa dostępne modele. Liczba zależy od konfiguracji, więc nie da się uczciwie porównać zakresu.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/llms.txt (19.11.2026)

### 10. Model lokalny
- Werdykt: poprawić, było fałszywe. Stare: lokalny model wymaga ręcznego endpointu. Ollama działa lokalnie bez klucza, modele są wykrywane, są przykłady LM Studio.
- Poprawione zdanie: OpenClaw łączy się z lokalną Ollamą bez klucza i sam wykrywa jej modele. Ma też gotowe przykłady dla LM Studio i llama.cpp.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/providers/ollama/setup, https://docs.openclaw.ai/llms.txt (19.11.2026)

### 11. Model dla sprawdzającego
- Werdykt: poprawić. Każdy agent ma własny model, Auto Review przyjmuje model recenzenta.
- Poprawione zdanie: Każdy agent OpenClaw może mieć własny model, a Auto Review pozwala wskazać model recenzenta.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/concepts/multi-agent, https://docs.openclaw.ai/tools/autoreview (19.11.2026)

### 12. Koszt
- Werdykt: poprawić. Oba darmowe; OpenClaw nie ma płatnego planu ani usługi. Stare sugerowało wyższe koszty OpenClaw. Remis.
- Poprawione zdanie: OpenClaw nie ma płatnego planu ani usługi w chmurze. Płacisz tylko dostawcy modelu albo nic przy modelu lokalnym. Kod jest otwarty na licencji MIT.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://github.com/openclaw/openclaw (19.11.2026)

### 13. Rozmowa głosowa
- Werdykt: poprawić. Pominięto tryb Talk, słowo wybudzające i wybór głosu, także na Windows. Polski niepotwierdzony.
- Poprawione zdanie: OpenClaw ma tryb Talk do ciągłej rozmowy głosowej, słowo wybudzające i wybór głosu, także w aplikacji na Windows. Oficjalne strony nie mówią, jak działa po polsku. Nie ma wyspy na pulpicie.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/nodes/talk, https://docs.openclaw.ai/platforms/windows (19.11.2026)

### 14. Lider zespołu
- Werdykt: poprawić. Stare: "brak danych o Liderze". Szablon zespołu ma koordynatora (chief of staff).
- Poprawione zdanie: OpenClaw ma gotowy szablon zespołu z koordynatorem (chief of staff). Koordynator przydziela pracę specjalistom, sprawdza ich wyniki i oddaje całość.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/concepts/multi-agent (19.11.2026)

### 15. Obrazy
- Werdykt: poprawić. OpenClaw generuje obrazy przez dostawców; brak gotowego agenta od obrazów nie oznacza braku funkcji.
- Poprawione zdanie: OpenClaw tworzy i edytuje obrazy przez dostawców, na przykład OpenAI gpt-image. Dokumentacja nie opisuje gotowego osobnego agenta od obrazów, ale możesz takiego dodać.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/llms.txt (19.11.2026)

### 16. Aktualizacje
- Werdykt: poprawić, było fałszywe. Stare: "aktualizacja przy udziale użytkownika". OpenClaw ma automatyczne aktualizacje i powrót do poprzedniej wersji.
- Poprawione zdanie: OpenClaw sprawdza wydania codziennie i może aktualizować się sam. Robi kopię przed aktualizacją i wraca do poprzedniej wersji, gdy nowa nie wystartuje.
- Ocena: LumoBot [brak], OpenClaw [brak]
- Źródło: https://docs.openclaw.ai/install/updating/automatic-updates, https://github.com/openclaw/openclaw (19.11.2026)

## Tabela vs-devin (tresci/tabela-v15.md)

### 1. Sprawdzenie przed „gotowe”
- Werdykt: poprawić. Dopisano Quick Review. Przewaga LumoBota niepotwierdzona.
- Poprawione zdanie: Devin pisze, uruchamia i testuje kod. Quick Review i Devin Review sprawdzają zmiany, zanim je zatwierdzisz. Dokumentacja nie opisuje obowiązkowego testu na końcu każdego zadania.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/desktop/quick-review (19.11.2026)

### 2. Niezależny sprawdzający
- Werdykt: poprawić, było fałszywe. Stare: "brak danych o niezależnym agencie". Quick Review to osobny agent z wybieranym modelem.
- Poprawione zdanie: Quick Review uruchamia osobnego agenta, który niezależnie ocenia zmiany. Model recenzenta wybierasz z listy: SWE-check, GPT-5.5 Review albo Opus 4.7 Review.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/desktop/quick-review (19.11.2026)

### 3. Praca do skutku po teście
- Werdykt: nie da się potwierdzić. Devin testuje kod w sesji; pętli do skutku dokumentacja nie opisuje.
- Poprawione zdanie: Devin planuje, pisze, uruchamia i testuje kod w jednej sesji. Dokumentacja nie opisuje stałej pętli poprawek aż do przejścia niezależnego kryterium.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/get-started/devin-intro (19.11.2026)

### 4. Neuro hamuje przed stratą tokenów
- Werdykt: nie da się potwierdzić. Devin ma limity i kontrolę kosztów; brak odpowiednika Neuro niepotwierdzony.
- Poprawione zdanie: Devin ma limity zużycia, a plan Teams ma kontrolę kosztów w trzech progach. Dokumentacja nie opisuje hamulca opartego na historii zadań.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://devin.ai/pricing (19.11.2026)

### 5. Punkt powrotu
- Werdykt: poprawić, było fałszywe. Stare: tylko historia PR. Devin Desktop ma cofanie do polecenia, nazwane punkty kontrolne i worktree.
- Poprawione zdanie: W Devin Desktop cofasz zmiany agenta do dowolnego polecenia i tworzysz nazwane punkty kontrolne. Sesja może też pracować w osobnym worktree git, który scalasz na końcu.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/desktop/cascade, https://docs.devin.ai/desktop/devin-local/worktrees (19.11.2026)

### 6. Hasła poza modelem
- Werdykt: nie da się potwierdzić. Nie potwierdziliśmy, jak Devin chroni sekrety przed modelem. Zdanie złagodzone.
- Poprawione zdanie: Devin ma zarządzanie sekretami dla środowisk w chmurze, a Cognition deklaruje, że nie trenuje modeli na danych klienta. Nie sprawdziliśmy, czy sekrety są ukryte przed modelem.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/llms.txt, https://docs.devin.ai/enterprise/security-access/security/enterprise-security (19.11.2026)

### 7. Pliki w folderze projektu
- Werdykt: poprawić. Stare: Devin pracuje tylko w chmurze. Devin Desktop działa w lokalnym folderze; modele w planach indywidualnych są w chmurze.
- Poprawione zdanie: Devin Desktop na Windows, macOS i Linuksie pracuje na plikach w twoim folderze. Modele w planach indywidualnych działają jednak w chmurze, więc treść zadania trafia do dostawcy modelu.
- Ocena: LumoBot [przewaga], Devin [brak]
- Źródło: https://docs.devin.ai/desktop/devin-desktop-faq, https://devin.ai/pricing (19.11.2026)

### 8. Praca bez chmury producenta
- Werdykt: prawda, doprecyzować. Dopisano wyjątek air-gapped dla administracji.
- Poprawione zdanie: W planach indywidualnych Devin korzysta z modeli w chmurze. Wersję bez internetu z własnym serwerem modeli Devin ma tylko we wdrożeniach dla administracji (air-gapped).
- Ocena: LumoBot [przewaga], Devin [brak]
- Źródło: https://docs.devin.ai/llms.txt, https://devin.ai/pricing (19.11.2026)

### 9. 0 zł bez limitu programu
- Werdykt: prawda. Ceny i limity potwierdzone: Free 0 USD z małym limitem, Pro 20, Max 200, Teams 80 USD, dokup według stawek API.
- Poprawione zdanie: Devin Free kosztuje 0 USD, ale ma mały limit pracy agentów i ograniczony wybór modeli. Pro kosztuje 20 USD, Max 200 USD, a Teams 80 USD miesięcznie. Po limicie dokupujesz użycie według stawek API.
- Ocena: LumoBot [przewaga], Devin [brak]
- Źródło: https://devin.ai/pricing (19.11.2026)

### 10. Liczba dostawców i modeli
- Werdykt: poprawić. Devin daje szeroki wybór, Adaptive i Fusion; zakresu nie da się porównać. Remis.
- Poprawione zdanie: Devin daje modele OpenAI, Claude, Gemini, SpaceXAI, własne SWE-2 i modele open source. Ma też automatyczny dobór (Adaptive) i pary modeli (Fusion). Nie podaje jednej liczby, więc nie da się uczciwie porównać zakresu.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://devin.ai/pricing, https://docs.devin.ai/desktop/models (19.11.2026)

### 11. Modele lokalne bez klucza
- Werdykt: prawda, doprecyzować. Lista modeli w planach indywidualnych to modele w chmurze; własny serwer tylko w air-gapped.
- Poprawione zdanie: Lista modeli w planach indywidualnych obejmuje modele w chmurze. Własny serwer modeli zgodny z OpenAI da się podpiąć tylko we wdrożeniu air-gapped dla administracji.
- Ocena: LumoBot [przewaga], Devin [brak]
- Źródło: https://docs.devin.ai/desktop/models, https://docs.devin.ai/llms.txt (19.11.2026)

### 12. Wybór modelu
- Werdykt: poprawić. Stare: "model zależy od planu". Użytkownik wybiera model sesji i recenzenta; plan ChatGPT w Pro, Max i Teams.
- Poprawione zdanie: W Devinie sam wybierasz model sesji, osobno model recenzenta w Quick Review, a w Pro, Max i Teams możesz użyć swojego planu ChatGPT.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://devin.ai/pricing, https://docs.devin.ai/desktop/quick-review (19.11.2026)

### 13. Rozmowa głosowa
- Werdykt: poprawić. Devin ma rozmowę głosową i dyktowanie. Polski niepotwierdzony.
- Poprawione zdanie: Devin ma rozmowę głosową z agentem i dyktowanie poleceń w Devin Desktop. Oficjalne strony nie mówią, czy działa po polsku. Nie ma wyspy na pulpicie.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/work-with-devin/voice-mode, https://docs.devin.ai/desktop/cascade (19.11.2026)

### 14. Lider zespołu
- Werdykt: poprawić. Podagenci Devin Local i Agent Command Center. Przewaga LumoBota niepotwierdzona.
- Poprawione zdanie: Devin Local uruchamia podagentów do części zadania, a Agent Command Center zarządza agentami lokalnymi i w chmurze z jednego miejsca. Devin Bots w Max i Teams pracują równolegle.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/desktop/devin-local/overview, https://docs.devin.ai/llms.txt (19.11.2026)

### 15. Obrazy
- Werdykt: nie da się potwierdzić. Devin opisuje się jako narzędzie do programowania; brak grafik niepotwierdzony, więc bez przewagi.
- Poprawione zdanie: Devin opisuje się jako narzędzie do inżynierii oprogramowania. Jego dokumentacja nie opisuje tworzenia grafik, ale to nie dowodzi, że ich nie zrobi.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://devin.ai/pricing, https://docs.devin.ai/get-started/devin-intro (19.11.2026)

### 16. Przeglądarka
- Werdykt: poprawić. Devin Desktop ma podgląd w przeglądarce, a chmura własną przeglądarkę. Remis.
- Poprawione zdanie: Devin Desktop pokazuje podgląd strony w edytorze albo w przeglądarce, a Devin w chmurze ma własną przeglądarkę do pracy i testów.
- Ocena: LumoBot [brak], Devin [brak]
- Źródło: https://docs.devin.ai/llms.txt, https://docs.devin.ai/get-started/devin-intro (19.11.2026)

## Pytania (tresci/pytania-v14.md)

### vs-manus

- **Ile zapłacę w LumoBocie, a ile w Manusie?** Werdykt: poprawić. "Praca się zatrzymuje" nieprawdziwe dla Max (płatność za użycie). Poprawiona odpowiedź jest w pliku pytań. Źródło: https://manus.im/pricing (19.11.2026)
- **Czy zobaczę, jaki model pracuje nad moim zadaniem?** Werdykt: poprawić. Flex w Pro i Max, wybór modelu i jego nazwa widoczne. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://manus.im/docs/models/manus-flex.md, https://manus.im/pricing (19.11.2026)
- **Czy treść moich plików wyjeżdża do chmury?** Werdykt: prawda, uzupełnić. Dopisano lokalny folder w Studio. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://manus.im/docs/features/desktop.md (19.11.2026)
- **Skąd wiem, że zadanie jest naprawdę zrobione?** Werdykt: poprawić. Usunięto "nie niezależne sprawdzanie"; dopisano testy i główne zadanie. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://manus.im/docs/features/desktop.md, https://manus.im/docs/features/parallel-tasks.md (19.11.2026)
- **Czy mogę cofnąć to, co zrobił agent?** Werdykt: poprawić. Manus ma wersje, Branch i worktree. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://manus.im/docs/website-builder/build-locally.md, https://manus.im/docs/llms.txt (19.11.2026)
- **Czy LumoBot ma stałego Lidera zespołu?** Werdykt: poprawić. Manus ma główne zadanie, które prowadzi pozostałe. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://manus.im/docs/features/parallel-tasks.md (19.11.2026)

### vs-openclaw

- **Czy muszę coś konfigurować, żeby zacząć w LumoBocie?** Werdykt: poprawić, było fałszywe. OpenClaw ma instalator Windows Hub, Gateway stawia kreator. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.openclaw.ai/platforms/windows (19.11.2026)
- **Dlaczego LumoBot nie kończy pracy bez sprawdzenia?** Werdykt: poprawić. OpenClaw ma Auto Review i agenta recenzenta. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.openclaw.ai/tools/autoreview, https://docs.openclaw.ai/concepts/multi-agent (19.11.2026)
- **Czy w LumoBocie jest polski głos?** Werdykt: poprawić. "Musiałbyś zbudować sam" nieprawdziwe: jest tryb Talk. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.openclaw.ai/nodes/talk (19.11.2026)
- **Ile kosztuje LumoBot, a ile OpenClaw?** Werdykt: prawda, uzupełnić. Dopisano MIT; usunięto sugestię, że tylko LumoBot ma zespół i punkty powrotu. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://github.com/openclaw/openclaw (19.11.2026)
- **Czy LumoBot obsługuje dowolnych dostawców i modele lokalne?** Werdykt: poprawić. Usunięto sugestię ręcznych endpointów u rywala; OpenClaw ma Ollamę bez klucza. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.openclaw.ai/providers/ollama/setup (19.11.2026)
- **Co się stanie, gdy agent coś zepsuje?** Werdykt: poprawić. Dopisano managed worktrees ze snapshotem i zatwierdzanie poleceń. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.openclaw.ai/concepts/managed-worktrees, https://docs.openclaw.ai/gateway/security (19.11.2026)

### vs-devin

- **Ile zapłacę w LumoBocie, a ile w Devinie?** Werdykt: prawda. Ceny potwierdzone; dopisano ograniczony wybór modeli w Free. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://devin.ai/pricing (19.11.2026)
- **Czy w jednym programie zrobię kod, teksty i grafikę?** Werdykt: poprawić. "Najlepszy głównie" to ocena bez pokrycia; zastąpiono opisem Devina o sobie. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://devin.ai/pricing (19.11.2026)
- **Gdzie ląduje mój kod?** Werdykt: poprawić. Devin Desktop pracuje lokalnie; modele są w chmurze. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.devin.ai/desktop/devin-desktop-faq, https://devin.ai/pricing (19.11.2026)
- **Czy mogę wybrać własnego dostawcę i model?** Werdykt: poprawić. Plan ChatGPT także w Teams; model wybiera użytkownik. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://devin.ai/pricing, https://docs.devin.ai/desktop/models (19.11.2026)
- **Czy mogę wrócić do stanu sprzed zmian agenta?** Werdykt: poprawić, było mylące. Devin ma cofanie i punkty kontrolne. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.devin.ai/desktop/cascade (19.11.2026)
- **Czy LumoBot też sprawdza wynik?** Werdykt: poprawić. Dopisano Quick Review u Devina. Poprawiona odpowiedź jest w pliku pytań. Źródło: https://docs.devin.ai/desktop/quick-review (19.11.2026)

## Najważniejsza różnica (tresci/roznica-v14.md)

- vs-manus: poprawić. Usunięto zarzut braku sprawdzającego i punktów powrotu. Zostały potwierdzone różnice: kredyty, Flex w Pro i Max, planowanie w chmurze, brak modeli lokalnych w Flex. Dopisano, w czym wygrywa Manus. Źródła: https://manus.im/pricing, https://manus.im/docs/features/desktop.md, https://manus.im/docs/models/manus-flex.md (19.11.2026)
- vs-openclaw: poprawić, było fałszywe. Usunięto "musisz sam zainstalować Gateway" i "nie opisuje sprawdzania wyniku". Teraz remis z uczciwym opisem. Źródła: https://docs.openclaw.ai/platforms/windows, https://docs.openclaw.ai/concepts/multi-agent, https://docs.openclaw.ai/tools/autoreview (19.11.2026)
- vs-devin: poprawić. Usunięto sugestię, że punkty powrotu i głos ma tylko LumoBot. Zostały ceny i modele lokalne. Dopisano Quick Review i cofanie u Devina. Źródła: https://devin.ai/pricing, https://docs.devin.ai/desktop/quick-review, https://docs.devin.ai/desktop/cascade (19.11.2026)

## Do sprawdzenia przez innych

- Sekcja `glowna` w tresci/pytania-v14.md (pytanie "Czym LumoBot różni się od OpenBota, Manusa i Devina?") i starsze pliki (porownanie-v8.md, vs-v8.md, tabela-v11*.md) mogą powtarzać stare twierdzenia. Nie zmieniałem ich, bo nie są w moim zleceniu.
- Fakty o samym LumoBocie (14 dostawców, 158 modeli, pięć głosów, Neuro) przyjąłem z plików projektu, nie sprawdzałem ich.
