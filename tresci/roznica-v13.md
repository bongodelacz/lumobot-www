# Najważniejsza różnica, v13

Fakty z tresci/porownanie-v8.md i tresci/tabela-v11-fakty.md, stan na 19 listopada 2026. Każda strona ma 3 akapity.

## vs-openbot

OpenBot jest szerszy: działa na macOS 13+, Windows 10+, Linuxie, iPhonie i Androidzie, a serwer zarządzany pracuje 24/7. LumoBot działa tylko na Windows 10 i 11 i musi mieć włączony komputer. Jeśli potrzebujesz telefonu albo pracy po zamknięciu laptopa, OpenBot ma tu przewagę.

LumoBot wygrywa tym, że zadanie kończy się dopiero po sprawdzeniu. Polecenie sprawdzające, na przykład test, albo niezależny sprawdzający musi potwierdzić cel, a sam komunikat agenta "gotowe" nie wystarczy. Po każdej rundzie LumoBot zapisuje też punkt powrotu git. OpenBot ma kroki zatwierdzania, ale nie opisuje stałego niezależnego sprawdzania.

Różni się też model pracy i koszt. LumoBot kosztuje 0 zł za aplikację, działa lokalnie i ma polską rozmowę głosową z wyspą na pulpicie. OpenBot na własnym komputerze kosztuje 0 EUR, ale serwer to 30, 50 lub 100 EUR miesięcznie, a licencja do pracy 10 lub 25 EUR.

## vs-grok-bot

Grok Bot pracuje na komputerze w chmurze, więc zadanie trwa dalej po zamknięciu laptopa. Ma aplikacje na macOS, Windows, Linuxa, iOS i Androida oraz działa w Slacku, Teams, na X i na spotkaniach. LumoBot nie ma żadnej z tych funkcji.

W LumoBocie sam wybierasz dostawcę i model spośród 14 dostawców i 158 modeli, także lokalnych przez Ollamę i LM Studio. Grok Bot dobiera model automatycznie i nie pokazuje jego nazwy. Własny plan podłączysz tam tylko w granicach planów X, Grok i Cursor.

Różnica widać w danych i cenie. Wszystkie Boty jednego użytkownika dzielą w chmurze jeden komputer, pliki, przeglądarkę i logowania. W LumoBocie projekt i zaszyfrowane hasła zostają na twoim komputerze, a aplikacja kosztuje 0 zł, gdy Grok Bot zaczyna się od 30 USD miesięcznie.

## vs-claude-cowork

Claude Cowork świetnie radzi sobie z dokumentami, arkuszami, prezentacjami i badaniami. Sesje chmurowe działają po zamknięciu laptopa, a plany Team i Enterprise dają administrację firmową. LumoBot nie ma chmury 24/7 ani panelu dla firm.

Cowork używa wyłącznie modeli Anthropic, takich jak Opus, Sonnet, Haiku i Fable, i wymaga płatnego planu Pro, Max, Ultra, Team lub Enterprise. Pro kosztuje 20 USD miesięcznie, czyli 17 USD przy płatności rocznej. LumoBot łączy 14 dostawców i 158 modeli, a aplikacja kosztuje 0 zł.

Różni się też koniec zadania. W trybie automatycznym Cowork ma kontrolę bezpieczeństwa, ale Anthropic sam ostrzega, że może ona przeoczyć ryzykowną akcję. W LumoBocie koniec zadania potwierdza test lub niezależny sprawdzający, a praca może iść na osobnej gałęzi git z punktami powrotu.

## vs-manus

Manus robi więcej rodzajów pracy: strony, slajdy, grafikę, wideo, gry i automatyzacje po mailu, kalendarzu lub Slacku. Cloud Computer działa całą dobę, a aplikacje są na Windows, macOS, iOS i Androida. LumoBot jest tylko na Windows 10 i 11.

Manus rozlicza pracę w kredytach: Free daje 300 dziennie, Pro 4 000, a Max 40 000 miesięcznie, za 0, 20 i 200 USD. Własne klucze działają tylko przez Manus Flex w planie Pro. LumoBot nie ma kredytów i kosztuje 0 zł, a płacisz tylko za swój plan lub klucz.

Najważniejsza różnica to sprawdzanie i dane. Tryby Ask for approval, Approve for me i Full access w Manus Studio kontrolują zgodę na działania, ale nie potwierdzają celu. Manus planuje w chmurze i treść czytanych plików staje się częścią zadania, a LumoBot ma test lub sprawdzającego i trzyma folder lokalnie.

## vs-openclaw

OpenClaw to otwarty kod na licencji MIT. Działa na macOS, Windows, Linuxie i WSL2, a iOS i Android są węzłami. Jeden Gateway łączy ponad 20 kanałów, między innymi WhatsApp, Telegram, Discord i Slack, więc piszesz do agenta z dowolnego komunikatora.

Za tę wolność płacisz konfiguracją. Gateway, Node i zabezpieczenia instalujesz sam, a dokumentacja ostrzega, że jeden Gateway nie jest granicą dla wzajemnie wrogich użytkowników. LumoBot jest gotową aplikacją na Windows 10 i 11 z polskim głosem, wyspą i własną przeglądarką agenta, bez pracy w terminalu.

Koszt jest podobny: OpenClaw nie ma abonamentu, a LumoBot kosztuje 0 zł za aplikację. W obu płacisz tylko dostawcy modelu albo używasz modelu lokalnego. Różni je sprawdzanie: OpenClaw ma `openclaw security audit`, ale nie ma stałego sprawdzania wyniku, a LumoBot kończy zadanie po teście lub niezależnym sprawdzającym.

## vs-devin

Devin to wyspecjalizowany inżynier oprogramowania w chmurze. Pisze kod, uruchamia testy i CI, przygotowuje pull requesty, a Devin Review wskazuje błędy i luki. Devin Bots pracują po zamknięciu laptopa i przyjmują zadania ze Slacka, Teams, Jira i Linear.

LumoBot to jeden program na Windows 10 i 11, który robi kod, teksty, obrazy i inne zadania w folderze na twoim komputerze. Ma polską rozmowę głosową, wyspę i punkty powrotu git po każdej rundzie. Wybierasz też spośród 14 dostawców i 158 modeli, także lokalnych, a Devin oferuje pulę zależną od planu.

Cena rozstrzyga w mniejszych projektach. LumoBot kosztuje 0 zł za aplikację, a Devin ma plany 0 USD z małym limitem, Pro 20, Teams 80 i Max 200 USD miesięcznie. Większe limity i praca zespołowa w Devinie wymagają płatnego planu, a dokumentacja zaleca przegląd kodu przez człowieka.
