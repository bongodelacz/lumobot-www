## DANE

Stan sprawdzenia: 19 listopada 2026. Wartość w komórce ma najwyżej osiem słów. Znacznik źródła w każdej komórce prowadzi do adresu pod tabelą. `Tak` oznacza potwierdzoną funkcję, `nie` oznacza brak funkcji, a `częściowo` oznacza funkcję ograniczoną, zależną od planu albo brak jednoznacznego potwierdzenia. `Brak danych` nie jest domysłem.

| Grupa | Kryterium | LumoBot | OpenBot | Grok Bot | Claude Cowork | Manus | OpenClaw | Devin |
|---|---|---|---|---|---|---|---|---|
| KOSZT | Cena aplikacji | **tak**: 0 zł [L2] | **tak**: 0 EUR prywatnie [O2] | **nie**: 30 USD/mies. Premium [G5] | **nie**: Pro od 20 USD/mies. [C3] | **tak**: Free 0 USD [M1] | **tak**: brak abonamentu [OC3] | **tak**: Free 0 USD [D1] |
| KOSZT | Płatność za AI | **częściowo**: twój plan, klucz lub lokalnie [L2] | **tak**: płacisz posiadany plan AI [O1] | **tak**: plan zawiera użycie, potem tokeny [G5] | **tak**: limit planu, potem kredyty API [C3] | **tak**: kredyty, potem płatność za użycie [M1] | **tak**: płacisz dostawcy modelu [OC3] | **tak**: limit planu, potem API [D1] |
| KOSZT | Darmowy plan/limit | **tak**: aplikacja bez limitu, model osobno [L2] | **tak**: darmowy użytek osobisty [O2] | **częściowo**: próba, limit użycia [G1] | **tak**: Free, limity co pięć godzin [C3] | **tak**: 300 kredytów dziennie [M1] | **tak**: brak abonamentu, limit dostawcy [OC3] | **tak**: Free, lekki limit agentów [D1] |
| GDZIE I PRYWATNOŚĆ | System i pliki | **częściowo**: Windows 10/11, folder projektu [L2] | **tak**: macOS, Windows, Linux, telefony [O4] | **tak**: Windows, macOS, Linux, iOS, Android [G1] | **tak**: desktop, web, mobile, Chrome [C1] | **tak**: web, Windows, macOS, iOS, Android [M3] | **tak**: macOS, Windows, Linux, iOS, Android [OC3] | **tak**: web, CLI, desktop, chmura [D2] |
| GDZIE I PRYWATNOŚĆ | Offline i modele lokalne | **tak**: Ollama i LM Studio [L5] | **tak**: Ollama, LM Studio, własny komputer [O1] | **częściowo**: lokalny komputer tylko za zgodą [G1] | **częściowo**: pliki lokalne, wykonanie chmurowe [C1] | **częściowo**: Studio lokalnie, planowanie chmurowe [M3] | **tak**: dostawcy hostowani i lokalni [OC1] | **częściowo**: dedykowane środowiska, brak offline [D3] |
| GDZIE I PRYWATNOŚĆ | Dane w chmurze | **częściowo**: projekt lokalny, prompt do dostawcy [L2] | **częściowo**: lokalnie lub serwer zarządzany [O3] | **tak**: cloud computer, wspólne pliki [G1] | **tak**: sesje i pliki na koncie Claude [C1] | **tak**: planowanie i treść w chmurze [M4] | **częściowo**: stan lokalny, prompty u dostawcy [OC3] | **tak**: dane w chmurze, tenant Enterprise [D3] |
| MODELE | Liczba dostawców AI | **tak**: 14 dostawców [L1] | **tak**: 14 dostawców i własne modele [O1] | **częściowo**: model z listy dostawców [G1] | **nie**: jeden dostawca, Anthropic [C1] | **tak**: wielu dostawców, lista modeli [M2] | **tak**: wielu dostawców, katalog rozszerzalny [OC1] | **tak**: OpenAI, Claude, Gemini i inni [D1] |
| MODELE | Wybór modelu per agent | **tak**: wybór modelu dla każdego agenta [L2] | **tak**: zmieniasz dostawcę, agent zostaje [O1] | **nie**: Bot wybiera model automatycznie [G1] | **częściowo**: wybór modeli Claude w planie [C3] | **tak**: model wybierasz albo dobiera Manus [M2] | **tak**: model per agent i sesja [OC1] | **częściowo**: dostęp zależy od planu [D1] |
| MODELE | Własny plan AI | **tak**: plan, klucz API lub model lokalny [L2] | **tak**: plan AI, który już masz [O1] | **częściowo**: wybrane plany X, Grok, Cursor [G1] | **nie**: wymaga płatnego planu Claude [C1] | **częściowo**: własne klucze w Manus Flex [M1] | **tak**: własny klucz lub endpoint [OC1] | **częściowo**: plan ChatGPT w Pro i Max [D1] |
| ZESPÓŁ I JAKOŚĆ | Zespół agentów | **tak**: Lider i specjaliści [L2] | **tak**: agenci przekazują zadania i pliki [O1] | **tak**: Boty działają równolegle [G1] | **tak**: podagenci i równoległe strumienie [C1] | **tak**: zadania równoległe i grupy agentów [M5] | **tak**: routing wielu agentów [OC1] | **tak**: Devin Bots i sesje równoległe [D1] |
| ZESPÓŁ I JAKOŚĆ | Kto ocenia wynik | **tak**: test lub niezależny sprawdzający [L2] | **częściowo**: agenci sprawdzają, zatwierdzasz kroki [O1] | **częściowo**: Auto Review i zgody [G2] | **częściowo**: automatyczna kontrola bezpieczeństwa [C2] | **nie**: brak danych o stałym sprawdzającym [M3] | **nie**: brak stałego sprawdzania wyniku [OC2] | **tak**: Devin Review, testy i CI [D4] |
| ZESPÓŁ I JAKOŚĆ | Praca do skutku | **tak**: pracuje aż sprawdzenie przejdzie [L2] | **częściowo**: przepływy i agenci kontynuują pracę [O3] | **tak**: Boty pracują do końca, 24/7 [G5] | **tak**: zadania długie i zaplanowane [C1] | **tak**: agent wykonuje zadania projektowe [M1] | **częściowo**: automatyzacje i sesje, brak gwarancji [OC3] | **tak**: pisze, uruchamia i testuje kod [D2] |
| ZESPÓŁ I JAKOŚĆ | Punkty powrotu/cofanie | **tak**: gałąź git i zapis po rundzie [L3] | **częściowo**: brak danych o punktach powrotu [O1] | **częściowo**: brak danych o cofnięciu zmian [G1] | **częściowo**: usuwanie z potwierdzeniem, brak punktów [C1] | **częściowo**: brak danych o punktach powrotu [M3] | **częściowo**: kontrola wersji, konfiguracja użytkownika [OC3] | **częściowo**: historia PR i branch protection [D3] |
| CODZIENNA PRACA | Rozmowa głosowa po polsku | **tak**: głos po polsku, rozpoznawanie offline [L2] | **częściowo**: brak danych o polskim głosie [O1] | **częściowo**: głos i dyktowanie, język niepotwierdzony [G4] | **częściowo**: Voice mode, polski niepotwierdzony [C3] | **częściowo**: brak danych o polskim głosie [M1] | **częściowo**: głos w aplikacjach, język niepotwierdzony [OC3] | **częściowo**: tryb głosowy, polski niepotwierdzony [D2] |
| CODZIENNA PRACA | Własna przeglądarka agenta | **tak**: własna przeglądarka, karty i logowania [L4] | **tak**: dane przeglądarki na komputerze [O1] | **tak**: własny komputer i sesje przeglądarki [G1] | **tak**: wbudowana przeglądarka Cowork [C1] | **tak**: Cloud Computer i My Browser [M2] | **tak**: sterowanie przeglądarką przez Gateway [OC2] | **tak**: browser, testy i podgląd [D2] |
| CODZIENNA PRACA | Aktualizacje | **tak**: sprawdza i instaluje nowe wydania [L3] | **częściowo**: brak danych o automatycznych aktualizacjach [O4] | **częściowo**: brak danych o mechanizmie aktualizacji [G5] | **częściowo**: brak danych o mechanizmie aplikacji [C1] | **tak**: usługa chmurowa, aktualizuje producent [M1] | **częściowo**: aktualizacje po stronie użytkownika [OC3] | **tak**: usługa chmurowa, aktualizuje producent [D2] |

### Źródła lokalne LumoBota

- [L1](../strona/app/dane.js), lista dostawców i modeli.
- [L2](../strona/czesci/strona-porownanie.html), cena, prywatność, praca zespołowa, sprawdzanie, głos i system.
- [L3](../strona/app/index.html), punkty powrotu i aktualizacje.
- [L4](../tresci/teksty.md), przeglądarka agenta, głos i aktualizacje.
- [L5](../strona/czesci/sekcja-neuro.html), liczba dostawców, modeli i modele lokalne.

### Źródła konkurentów

- [O1](https://openbot.run/pl), funkcje, dostawcy, dane lokalne, agenci i przepływy.
- [O2](https://openbot.run/pl/pricing), cennik OpenBot.
- [O3](https://openbot.run/pl/teams), serwer zarządzany, praca 24/7 i zespół.
- [O4](https://openbot.run/download), obsługiwane systemy i urządzenia.
- [G1](https://docs.x.ai/grok-bot/faq), modele, plany, chmura, systemy i praca w tle.
- [G2](https://docs.x.ai/grok-bot/approvals-security-and-privacy), zgody, Auto Review i prywatność.
- [G3](https://docs.x.ai/grok-bot/team-bots), Boty zespołowe i wspólna praca.
- [G4](https://docs.x.ai/grok-bot/mobile), aplikacje mobilne, głos i dyktowanie.
- [G5](https://x.ai/bot), cennik, użycie, praca do końca i kanały.
- [C1](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork), dostępność, chmura, podagenci i przeglądarka.
- [C2](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely), tryby zgody i kontrola bezpieczeństwa.
- [C3](https://claude.com/pricing), ceny, limity, modele i Voice mode.
- [M1](https://manus.im/pricing), plany, kredyty i Manus Flex.
- [M2](https://manus.im/pl/models), dostawcy, modele i wybór modelu.
- [M3](https://manus.im/docs/features/desktop.md), tryb lokalny, urządzenia i zgody.
- [M4](https://help.manus.im/en/articles/15392111-what-is-the-cloud-computer), Cloud Computer i praca w chmurze.
- [M5](https://manus.im/en/blog/introducing-manus-2-0), grupy agentów i praca równoległa.
- [OC1](https://docs.openclaw.ai/concepts/models), dostawcy, modele i wybór per agent.
- [OC2](https://docs.openclaw.ai/gateway/security), Gateway, bezpieczeństwo i przeglądarka.
- [OC3](https://github.com/openclaw/openclaw), systemy, lokalny stan, kanały, licencja i aktualizacje.
- [D1](https://devin.ai/pricing), ceny, limity, modele, Devin Bots i plan ChatGPT.
- [D2](https://docs.devin.ai/get-started/devin-intro), środowisko, praca do końca, browser i głos.
- [D3](https://docs.devin.ai/enterprise/security-access/security/enterprise-security), dane, tenant i ochrona gałęzi.
- [D4](https://docs.devin.ai/work-with-devin/devin-review), Devin Review, testy i bezpieczeństwo.

[L1]: ../strona/app/dane.js
[L2]: ../strona/czesci/strona-porownanie.html
[L3]: ../strona/app/index.html
[L4]: ../tresci/teksty.md
[L5]: ../strona/czesci/sekcja-neuro.html
[O1]: https://openbot.run/pl
[O2]: https://openbot.run/pl/pricing
[O3]: https://openbot.run/pl/teams
[O4]: https://openbot.run/download
[G1]: https://docs.x.ai/grok-bot/faq
[G2]: https://docs.x.ai/grok-bot/approvals-security-and-privacy
[G3]: https://docs.x.ai/grok-bot/team-bots
[G4]: https://docs.x.ai/grok-bot/mobile
[G5]: https://x.ai/bot
[C1]: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork
[C2]: https://support.claude.com/en/articles/13364135-use-claude-cowork-safely
[C3]: https://claude.com/pricing
[M1]: https://manus.im/pricing
[M2]: https://manus.im/pl/models
[M3]: https://manus.im/docs/features/desktop.md
[M4]: https://help.manus.im/en/articles/15392111-what-is-the-cloud-computer
[M5]: https://manus.im/en/blog/introducing-manus-2-0
[OC1]: https://docs.openclaw.ai/concepts/models
[OC2]: https://docs.openclaw.ai/gateway/security
[OC3]: https://github.com/openclaw/openclaw
[D1]: https://devin.ai/pricing
[D2]: https://docs.devin.ai/get-started/devin-intro
[D3]: https://docs.devin.ai/enterprise/security-access/security/enterprise-security
[D4]: https://docs.devin.ai/work-with-devin/devin-review

## TEKSTY

Autor: Pióro, 19 listopada 2026. Komórki: Tak, Częściowo, Nie, najwyżej osiem słów, z faktów Radara (sekcja DANE). Przy braku danych piszemy wprost: brak danych.

**Jak liczymy podsumowanie.** Punkt dla LumoBota, gdy jego ocena jest wyższa niż konkurenta (Tak, Częściowo, Nie). Remis, gdy oceny są równe. Punkt dla konkurenta w odwrotnym przypadku. Wyjątek: Dane zostają u ciebie. Radar ocenia tam, czy dane są w chmurze, a dla prywatności chmura to minus, więc ocenę odwracamy. Pozostałe oceny bierzemy z kolumn Radara bez zmian.

**Kryteria po kolei (1 do 16):** Cena aplikacji; Opłata za model AI; Darmowy start; Systemy i urządzenia; Praca bez internetu; Dane zostają u ciebie; Dostawcy AI; Osobny model dla każdego agenta; Twój własny plan AI; Zespół agentów; Kto sprawdza wynik; Praca do skutku; Droga powrotu; Rozmowa głosowa po polsku; Własna przeglądarka agenta; Aktualizacje.


### TEKSTY: OpenBot (strona vs-openbot)

**Tytuł tabeli:** Gdzie LumoBot daje więcej niż OpenBot


**Grupa 1: Ile płacisz**

| Kryterium | LumoBot | OpenBot | Punkt dla |
|---|---|---|---|
| Cena aplikacji | Tak: 0 zł za aplikację | Tak: 0 EUR do użytku prywatnego | remis |
| Opłata za model AI | Częściowo: za model płacisz osobno albo liczysz lokalnie za 0 zł | Tak: płacisz plan AI, który już masz | OpenBot |
| Darmowy start | Tak: aplikacja bez limitu, model osobno | Tak: darmowy użytek osobisty | remis |

**Werdykt grupy:** Prawie remis: OpenBot jest darmowy do użytku prywatnego i też płacisz tylko za plan AI, który już masz.

**Grupa 2: Gdzie pracujesz i co z twoimi danymi**

| Kryterium | LumoBot | OpenBot | Punkt dla |
|---|---|---|---|
| Systemy i urządzenia | Częściowo: na razie Windows 10 i 11 | Tak: macOS, Windows, Linux i telefony | OpenBot |
| Praca bez internetu | Tak: Ollama i LM Studio, głos też offline | Tak: Ollama, LM Studio, własny komputer | remis |
| Dane zostają u ciebie | Częściowo: projekt u ciebie, prompt idzie do dostawcy AI | Częściowo: lokalnie albo serwer zarządzany | remis |

**Werdykt grupy:** OpenBot działa na więcej systemach i telefonach, LumoBot na razie tylko na Windows. Poza tym oba trzymają pracę blisko twojego komputera.

**Grupa 3: Wybór AI**

| Kryterium | LumoBot | OpenBot | Punkt dla |
|---|---|---|---|
| Dostawcy AI | Tak: 14 dostawców AI | Tak: 14 dostawców i własne modele | remis |
| Osobny model dla każdego agenta | Tak: każdy agent ma własny model | Tak: zmieniasz dostawcę, agent zostaje | remis |
| Twój własny plan AI | Tak: twój plan, klucz API albo model lokalny | Tak: plan AI, który już masz | remis |

**Werdykt grupy:** Remis: oba łączą 14 dostawców i pozwalają użyć własnego planu AI.

**Grupa 4: Zespół i pewność wyniku**

| Kryterium | LumoBot | OpenBot | Punkt dla |
|---|---|---|---|
| Zespół agentów | Tak: Lider i specjaliści | Tak: agenci przekazują sobie zadania i pliki | remis |
| Kto sprawdza wynik | Tak: test albo niezależny sprawdzający | Częściowo: agenci sprawdzają, ty zatwierdzasz kroki | LumoBot |
| Praca do skutku | Tak: agent pracuje, aż sprawdzenie przejdzie | Częściowo: przepływy i agenci kontynuują pracę | LumoBot |
| Droga powrotu | Tak: gałąź git i zapis po każdej rundzie | Częściowo: brak danych o punktach powrotu | LumoBot |

**Werdykt grupy:** Tu LumoBot wygrywa wyraźnie: wynik sprawdza test albo niezależny agent, a każda zmiana ma drogę powrotu.

**Grupa 5: Na co dzień**

| Kryterium | LumoBot | OpenBot | Punkt dla |
|---|---|---|---|
| Rozmowa głosowa po polsku | Tak: rozmowa głosowa po polsku | Częściowo: brak danych o polskim głosie | LumoBot |
| Własna przeglądarka agenta | Tak: własna przeglądarka, karty i logowania | Tak: dane przeglądarki zostają na komputerze | remis |
| Aktualizacje | Tak: sam sprawdza i instaluje nowe wydania | Częściowo: brak danych o aktualizacjach | LumoBot |

**Werdykt grupy:** LumoBot dodaje głos po polsku i aktualizacje, przeglądarka agenta jest w obu.

**Podsumowanie:** LumoBot lepszy w 5 z 16 punktów, remis w 9, OpenBot lepszy w 2.

**Zachęta pod tabelą:** Sprawdź sam: pobierz LumoBota za 0 zł i daj mu zadanie, które kończy się dopiero, gdy przejdzie test.

### TEKSTY: Grok Bot (strona vs-grok-bot)

**Tytuł tabeli:** Gdzie LumoBot daje więcej niż Grok Bot


**Grupa 1: Ile płacisz**

| Kryterium | LumoBot | Grok Bot | Punkt dla |
|---|---|---|---|
| Cena aplikacji | Tak: 0 zł za aplikację | Nie: 30 USD miesięcznie za Premium | LumoBot |
| Opłata za model AI | Częściowo: za model płacisz osobno albo liczysz lokalnie za 0 zł | Tak: plan zawiera użycie, potem płacisz za tokeny | Grok Bot |
| Darmowy start | Tak: aplikacja bez limitu, model osobno | Częściowo: próba z limitem użycia | LumoBot |

**Werdykt grupy:** LumoBot kosztuje 0 zł, Grok Bot Premium 30 USD miesięcznie. Za model AI płacisz u obu.

**Grupa 2: Gdzie pracujesz i co z twoimi danymi**

| Kryterium | LumoBot | Grok Bot | Punkt dla |
|---|---|---|---|
| Systemy i urządzenia | Częściowo: na razie Windows 10 i 11 | Tak: Windows, macOS, Linux, iOS i Android | Grok Bot |
| Praca bez internetu | Tak: Ollama i LM Studio, głos też offline | Częściowo: komputer lokalny tylko za twoją zgodą | LumoBot |
| Dane zostają u ciebie | Częściowo: projekt u ciebie, prompt idzie do dostawcy AI | Tak: komputer w chmurze i wspólne pliki | LumoBot |

**Werdykt grupy:** Grok Bot działa na telefonach i innych systemach, a LumoBot na razie na Windows. W prywatności LumoBot wygrywa: działa offline, a projekt zostaje u ciebie.

**Grupa 3: Wybór AI**

| Kryterium | LumoBot | Grok Bot | Punkt dla |
|---|---|---|---|
| Dostawcy AI | Tak: 14 dostawców AI | Częściowo: model z listy dostawców | LumoBot |
| Osobny model dla każdego agenta | Tak: każdy agent ma własny model | Nie: Bot sam wybiera model | LumoBot |
| Twój własny plan AI | Tak: twój plan, klucz API albo model lokalny | Częściowo: tylko wybrane plany X, Grok i Cursor | LumoBot |

**Werdykt grupy:** Największa różnica: w LumoBocie wybierasz dostawcę, model i plan AI sam, w Grok Bocie Bot decyduje za ciebie.

**Grupa 4: Zespół i pewność wyniku**

| Kryterium | LumoBot | Grok Bot | Punkt dla |
|---|---|---|---|
| Zespół agentów | Tak: Lider i specjaliści | Tak: Boty działają równolegle | remis |
| Kto sprawdza wynik | Tak: test albo niezależny sprawdzający | Częściowo: Auto Review i zgody | LumoBot |
| Praca do skutku | Tak: agent pracuje, aż sprawdzenie przejdzie | Tak: Boty pracują do końca, całą dobę | remis |
| Droga powrotu | Tak: gałąź git i zapis po każdej rundzie | Częściowo: brak danych o cofaniu zmian | LumoBot |

**Werdykt grupy:** Oba pracują zespołowo i do końca, ale tylko LumoBot kończy dopiero po teście i ma gałąź z punktami powrotu.

**Grupa 5: Na co dzień**

| Kryterium | LumoBot | Grok Bot | Punkt dla |
|---|---|---|---|
| Rozmowa głosowa po polsku | Tak: rozmowa głosowa po polsku | Częściowo: głos i dyktowanie, polski niepotwierdzony | LumoBot |
| Własna przeglądarka agenta | Tak: własna przeglądarka, karty i logowania | Tak: własny komputer i sesje przeglądarki | remis |
| Aktualizacje | Tak: sam sprawdza i instaluje nowe wydania | Częściowo: brak danych o aktualizacjach | LumoBot |

**Werdykt grupy:** LumoBot ma głos po polsku i potwierdzone aktualizacje, przeglądarkę mają oba.

**Podsumowanie:** LumoBot lepszy w 11 z 16 punktów, remis w 3, Grok Bot lepszy w 2.

**Zachęta pod tabelą:** Sprawdź sam: pobierz LumoBota za 0 zł i daj mu zadanie, które kończy się dopiero, gdy przejdzie test.

### TEKSTY: Claude Cowork (strona vs-claude-cowork)

**Tytuł tabeli:** Gdzie LumoBot daje więcej niż Claude Cowork


**Grupa 1: Ile płacisz**

| Kryterium | LumoBot | Claude Cowork | Punkt dla |
|---|---|---|---|
| Cena aplikacji | Tak: 0 zł za aplikację | Nie: Pro od 20 USD miesięcznie | LumoBot |
| Opłata za model AI | Częściowo: za model płacisz osobno albo liczysz lokalnie za 0 zł | Tak: limit planu, potem kredyty API | Claude Cowork |
| Darmowy start | Tak: aplikacja bez limitu, model osobno | Tak: plan Free, limity co pięć godzin | remis |

**Werdykt grupy:** LumoBot kosztuje 0 zł, Cowork od 20 USD miesięcznie. Darmowy plan Cowork ma limity, aplikacja LumoBota nie ma.

**Grupa 2: Gdzie pracujesz i co z twoimi danymi**

| Kryterium | LumoBot | Claude Cowork | Punkt dla |
|---|---|---|---|
| Systemy i urządzenia | Częściowo: na razie Windows 10 i 11 | Tak: desktop, web, telefon i Chrome | Claude Cowork |
| Praca bez internetu | Tak: Ollama i LM Studio, głos też offline | Częściowo: pliki lokalnie, wykonanie w chmurze | LumoBot |
| Dane zostają u ciebie | Częściowo: projekt u ciebie, prompt idzie do dostawcy AI | Tak: sesje i pliki na koncie Claude | LumoBot |

**Werdykt grupy:** Cowork działa na wielu urządzeniach, LumoBot na razie na Windows. Za to u nas pliki i projekt zostają na komputerze, u Cowork w chmurze Claude.

**Grupa 3: Wybór AI**

| Kryterium | LumoBot | Claude Cowork | Punkt dla |
|---|---|---|---|
| Dostawcy AI | Tak: 14 dostawców AI | Nie: jeden dostawca, Anthropic | LumoBot |
| Osobny model dla każdego agenta | Tak: każdy agent ma własny model | Częściowo: wybierasz tylko modele Claude | LumoBot |
| Twój własny plan AI | Tak: twój plan, klucz API albo model lokalny | Nie: wymaga płatnego planu Claude | LumoBot |

**Werdykt grupy:** To najmocniejszy punkt LumoBota: 14 dostawców i własny plan zamiast jednego dostawcy, Anthropic.

**Grupa 4: Zespół i pewność wyniku**

| Kryterium | LumoBot | Claude Cowork | Punkt dla |
|---|---|---|---|
| Zespół agentów | Tak: Lider i specjaliści | Tak: podagenci i równoległe strumienie | remis |
| Kto sprawdza wynik | Tak: test albo niezależny sprawdzający | Częściowo: automatyczna kontrola bezpieczeństwa | LumoBot |
| Praca do skutku | Tak: agent pracuje, aż sprawdzenie przejdzie | Tak: zadania długie i zaplanowane | remis |
| Droga powrotu | Tak: gałąź git i zapis po każdej rundzie | Częściowo: usuwanie z potwierdzeniem, bez punktów powrotu | LumoBot |

**Werdykt grupy:** Oba mają zespoły agentów, ale tylko LumoBot kończy po teście i ma punkty powrotu.

**Grupa 5: Na co dzień**

| Kryterium | LumoBot | Claude Cowork | Punkt dla |
|---|---|---|---|
| Rozmowa głosowa po polsku | Tak: rozmowa głosowa po polsku | Częściowo: tryb głosowy, polski niepotwierdzony | LumoBot |
| Własna przeglądarka agenta | Tak: własna przeglądarka, karty i logowania | Tak: wbudowana przeglądarka Cowork | remis |
| Aktualizacje | Tak: sam sprawdza i instaluje nowe wydania | Częściowo: brak danych o aktualizacjach aplikacji | LumoBot |

**Werdykt grupy:** LumoBot mówi po polsku i aktualizuje się sam, przeglądarkę mają oba.

**Podsumowanie:** LumoBot lepszy w 10 z 16 punktów, remis w 4, Claude Cowork lepszy w 2.

**Zachęta pod tabelą:** Sprawdź sam: pobierz LumoBota za 0 zł i daj mu zadanie, które kończy się dopiero, gdy przejdzie test.

### TEKSTY: Manus (strona vs-manus)

**Tytuł tabeli:** Gdzie LumoBot daje więcej niż Manus


**Grupa 1: Ile płacisz**

| Kryterium | LumoBot | Manus | Punkt dla |
|---|---|---|---|
| Cena aplikacji | Tak: 0 zł za aplikację | Tak: plan Free za 0 USD | remis |
| Opłata za model AI | Częściowo: za model płacisz osobno albo liczysz lokalnie za 0 zł | Tak: kredyty, potem płatność za użycie | Manus |
| Darmowy start | Tak: aplikacja bez limitu, model osobno | Tak: 300 kredytów dziennie | remis |

**Werdykt grupy:** Prawie remis: Manus ma Free za 0 USD i 300 kredytów dziennie. LumoBot ma 0 zł za aplikację, za model płacisz osobno.

**Grupa 2: Gdzie pracujesz i co z twoimi danymi**

| Kryterium | LumoBot | Manus | Punkt dla |
|---|---|---|---|
| Systemy i urządzenia | Częściowo: na razie Windows 10 i 11 | Tak: web, Windows, macOS, iOS i Android | Manus |
| Praca bez internetu | Tak: Ollama i LM Studio, głos też offline | Częściowo: Studio lokalnie, planowanie w chmurze | LumoBot |
| Dane zostają u ciebie | Częściowo: projekt u ciebie, prompt idzie do dostawcy AI | Tak: planowanie i treść w chmurze | LumoBot |

**Werdykt grupy:** Manus działa na wielu urządzeniach, LumoBot na razie na Windows. Za to u nas praca działa też offline na modelach lokalnych, a treść nie ląduje w chmurze.

**Grupa 3: Wybór AI**

| Kryterium | LumoBot | Manus | Punkt dla |
|---|---|---|---|
| Dostawcy AI | Tak: 14 dostawców AI | Tak: wielu dostawców, lista modeli | remis |
| Osobny model dla każdego agenta | Tak: każdy agent ma własny model | Tak: model wybierasz albo dobiera Manus | remis |
| Twój własny plan AI | Tak: twój plan, klucz API albo model lokalny | Częściowo: własne klucze w Manus Flex | LumoBot |

**Werdykt grupy:** Oba dają wielu dostawców, ale LumoBot pozwala użyć własnego planu AI, klucza albo modelu lokalnego bez dopłat.

**Grupa 4: Zespół i pewność wyniku**

| Kryterium | LumoBot | Manus | Punkt dla |
|---|---|---|---|
| Zespół agentów | Tak: Lider i specjaliści | Tak: zadania równoległe i grupy agentów | remis |
| Kto sprawdza wynik | Tak: test albo niezależny sprawdzający | Nie: brak danych o stałym sprawdzającym | LumoBot |
| Praca do skutku | Tak: agent pracuje, aż sprawdzenie przejdzie | Tak: agent wykonuje zadania projektowe | remis |
| Droga powrotu | Tak: gałąź git i zapis po każdej rundzie | Częściowo: brak danych o punktach powrotu | LumoBot |

**Werdykt grupy:** Manus nie pokazuje stałego sprawdzającego. W LumoBocie wynik musi przejść test, a zmiany masz na osobnej gałęzi.

**Grupa 5: Na co dzień**

| Kryterium | LumoBot | Manus | Punkt dla |
|---|---|---|---|
| Rozmowa głosowa po polsku | Tak: rozmowa głosowa po polsku | Częściowo: brak danych o polskim głosie | LumoBot |
| Własna przeglądarka agenta | Tak: własna przeglądarka, karty i logowania | Tak: Cloud Computer i My Browser | remis |
| Aktualizacje | Tak: sam sprawdza i instaluje nowe wydania | Tak: usługa w chmurze, aktualizuje producent | remis |

**Werdykt grupy:** LumoBot ma głos po polsku, przeglądarkę mają oba, a aktualizacje w chmurze Manusa robi producent.

**Podsumowanie:** LumoBot lepszy w 6 z 16 punktów, remis w 8, Manus lepszy w 2.

**Zachęta pod tabelą:** Sprawdź sam: pobierz LumoBota za 0 zł i daj mu zadanie, które kończy się dopiero, gdy przejdzie test.

### TEKSTY: OpenClaw (strona vs-openclaw)

**Tytuł tabeli:** Gdzie LumoBot daje więcej niż OpenClaw


**Grupa 1: Ile płacisz**

| Kryterium | LumoBot | OpenClaw | Punkt dla |
|---|---|---|---|
| Cena aplikacji | Tak: 0 zł za aplikację | Tak: brak abonamentu | remis |
| Opłata za model AI | Częściowo: za model płacisz osobno albo liczysz lokalnie za 0 zł | Tak: płacisz dostawcy modelu | OpenClaw |
| Darmowy start | Tak: aplikacja bez limitu, model osobno | Tak: brak abonamentu, limit dostawcy | remis |

**Werdykt grupy:** Prawie remis: OpenClaw nie ma abonamentu, LumoBot też. Za model AI płacisz dostawcy w obu.

**Grupa 2: Gdzie pracujesz i co z twoimi danymi**

| Kryterium | LumoBot | OpenClaw | Punkt dla |
|---|---|---|---|
| Systemy i urządzenia | Częściowo: na razie Windows 10 i 11 | Tak: macOS, Windows, Linux, iOS i Android | OpenClaw |
| Praca bez internetu | Tak: Ollama i LM Studio, głos też offline | Tak: dostawcy hostowani i lokalni | remis |
| Dane zostają u ciebie | Częściowo: projekt u ciebie, prompt idzie do dostawcy AI | Częściowo: stan lokalny, prompty u dostawcy | remis |

**Werdykt grupy:** OpenClaw działa na każdym systemie i telefonie, LumoBot na razie na Windows. W prywatności jest remis: oba trzymają stan lokalnie.

**Grupa 3: Wybór AI**

| Kryterium | LumoBot | OpenClaw | Punkt dla |
|---|---|---|---|
| Dostawcy AI | Tak: 14 dostawców AI | Tak: wielu dostawców, katalog rozszerzalny | remis |
| Osobny model dla każdego agenta | Tak: każdy agent ma własny model | Tak: model dla agenta i sesji | remis |
| Twój własny plan AI | Tak: twój plan, klucz API albo model lokalny | Tak: własny klucz albo endpoint | remis |

**Werdykt grupy:** Remis: oba mają wielu dostawców, wybór modelu dla agenta i własny klucz.

**Grupa 4: Zespół i pewność wyniku**

| Kryterium | LumoBot | OpenClaw | Punkt dla |
|---|---|---|---|
| Zespół agentów | Tak: Lider i specjaliści | Tak: routing wielu agentów | remis |
| Kto sprawdza wynik | Tak: test albo niezależny sprawdzający | Nie: brak stałego sprawdzania wyniku | LumoBot |
| Praca do skutku | Tak: agent pracuje, aż sprawdzenie przejdzie | Częściowo: automatyzacje i sesje, bez gwarancji | LumoBot |
| Droga powrotu | Tak: gałąź git i zapis po każdej rundzie | Częściowo: kontrola wersji w twojej konfiguracji | LumoBot |

**Werdykt grupy:** LumoBot wygrywa, bo gwarantuje wynik: test albo niezależny sprawdzający, praca do skutku i gałąź z punktami powrotu.

**Grupa 5: Na co dzień**

| Kryterium | LumoBot | OpenClaw | Punkt dla |
|---|---|---|---|
| Rozmowa głosowa po polsku | Tak: rozmowa głosowa po polsku | Częściowo: głos w aplikacjach, polski niepotwierdzony | LumoBot |
| Własna przeglądarka agenta | Tak: własna przeglądarka, karty i logowania | Tak: sterowanie przeglądarką przez Gateway | remis |
| Aktualizacje | Tak: sam sprawdza i instaluje nowe wydania | Częściowo: aktualizujesz sam | LumoBot |

**Werdykt grupy:** LumoBot ma głos po polsku i sam się aktualizuje, przeglądarkę mają oba.

**Podsumowanie:** LumoBot lepszy w 5 z 16 punktów, remis w 9, OpenClaw lepszy w 2.

**Zachęta pod tabelą:** Sprawdź sam: pobierz LumoBota za 0 zł i daj mu zadanie, które kończy się dopiero, gdy przejdzie test.

### TEKSTY: Devin (strona vs-devin)

**Tytuł tabeli:** Gdzie LumoBot daje więcej niż Devin


**Grupa 1: Ile płacisz**

| Kryterium | LumoBot | Devin | Punkt dla |
|---|---|---|---|
| Cena aplikacji | Tak: 0 zł za aplikację | Tak: plan Free za 0 USD | remis |
| Opłata za model AI | Częściowo: za model płacisz osobno albo liczysz lokalnie za 0 zł | Tak: limit planu, potem płacisz za API | Devin |
| Darmowy start | Tak: aplikacja bez limitu, model osobno | Tak: Free z lekkim limitem agentów | remis |

**Werdykt grupy:** Prawie remis: Devin ma plan Free za 0 USD. Płatne plany to Pro 20, Max 200 i Teams 80 USD miesięcznie, a za aplikację LumoBota nie płacisz nic.

**Grupa 2: Gdzie pracujesz i co z twoimi danymi**

| Kryterium | LumoBot | Devin | Punkt dla |
|---|---|---|---|
| Systemy i urządzenia | Częściowo: na razie Windows 10 i 11 | Tak: web, CLI, desktop i chmura | Devin |
| Praca bez internetu | Tak: Ollama i LM Studio, głos też offline | Częściowo: dedykowane środowiska, bez trybu offline | LumoBot |
| Dane zostają u ciebie | Częściowo: projekt u ciebie, prompt idzie do dostawcy AI | Tak: dane w chmurze, tenant Enterprise | LumoBot |

**Werdykt grupy:** Devin działa w przeglądarce i chmurze, LumoBot na razie na Windows. Za to LumoBot pracuje offline na modelach lokalnych i trzyma projekt u ciebie.

**Grupa 3: Wybór AI**

| Kryterium | LumoBot | Devin | Punkt dla |
|---|---|---|---|
| Dostawcy AI | Tak: 14 dostawców AI | Tak: OpenAI, Claude, Gemini i inni | remis |
| Osobny model dla każdego agenta | Tak: każdy agent ma własny model | Częściowo: dostęp zależy od planu | LumoBot |
| Twój własny plan AI | Tak: twój plan, klucz API albo model lokalny | Częściowo: plan ChatGPT tylko w Pro i Max | LumoBot |

**Werdykt grupy:** LumoBot pozwala wybrać model dla każdego agenta i użyć własnego planu, w Devinie to zależy od planu.

**Grupa 4: Zespół i pewność wyniku**

| Kryterium | LumoBot | Devin | Punkt dla |
|---|---|---|---|
| Zespół agentów | Tak: Lider i specjaliści | Tak: Devin Bots i sesje równoległe | remis |
| Kto sprawdza wynik | Tak: test albo niezależny sprawdzający | Tak: Devin Review, testy i CI | remis |
| Praca do skutku | Tak: agent pracuje, aż sprawdzenie przejdzie | Tak: pisze, uruchamia i testuje kod | remis |
| Droga powrotu | Tak: gałąź git i zapis po każdej rundzie | Częściowo: historia PR i ochrona gałęzi | LumoBot |

**Werdykt grupy:** Tu jest blisko: Devin też ma przegląd, testy i CI. LumoBot dokłada gałąź z punktami powrotu po każdej rundzie.

**Grupa 5: Na co dzień**

| Kryterium | LumoBot | Devin | Punkt dla |
|---|---|---|---|
| Rozmowa głosowa po polsku | Tak: rozmowa głosowa po polsku | Częściowo: tryb głosowy, polski niepotwierdzony | LumoBot |
| Własna przeglądarka agenta | Tak: własna przeglądarka, karty i logowania | Tak: przeglądarka, testy i podgląd | remis |
| Aktualizacje | Tak: sam sprawdza i instaluje nowe wydania | Tak: usługa w chmurze, aktualizuje producent | remis |

**Werdykt grupy:** LumoBot ma głos po polsku, przeglądarkę i aktualizacje mają oba.

**Podsumowanie:** LumoBot lepszy w 6 z 16 punktów, remis w 8, Devin lepszy w 2.

**Zachęta pod tabelą:** Sprawdź sam: pobierz LumoBota za 0 zł i daj mu zadanie, które kończy się dopiero, gdy przejdzie test.
