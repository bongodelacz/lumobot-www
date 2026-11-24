# Weryfikacja v16-a2: jedna miara dla OpenBot, Grok Bot i Claude Cowork

Sprawdził: Weryfikator, 19.11.2026. Miara taka sama jak w v16-b (Manus, OpenClaw, Devin): `[przewaga]` tylko przy potwierdzonej różnicy, brak informacji to `[brak]` po obu stronach, gdy rywal jest lepszy, `[przewaga]` przy rywalu.

## Wynik w tabeli (tresci/tabela-v15.md)

| Rywal | Przewaga LumoBota przed | po | Przewaga rywala po |
| --- | --- | --- | --- |
| OpenBot | 9 z 16 | 1 z 16 (0 zł za pracę zawodową) | 1 (telefon, komunikatory, macOS i Linux) |
| Grok Bot | 16 z 16 | 6 z 16 (pliki lokalnie, bez chmury, 0 zł, jawny model, wybór dostawcy, model lokalny) | 1 (praca po zamknięciu laptopa) |
| Claude Cowork | 12 z 16 | 5 z 16 (pliki lokalnie, bez chmury, 0 zł, wielu dostawców, model lokalny) | 1 (praca po zamknięciu laptopa) |

Zdjęte przewagi: test przed „gotowe”, niezależny sprawdzający, praca do skutku, Neuro, punkt powrotu git, hasła, agent od obrazów, Lider, głos. U rywali nie ma o tym informacji albo mają odpowiednik, więc to nie jest potwierdzona różnica. Zmienione wiersze: OpenBot „Aktualizacja” zastąpiona przez „Telefon i komunikatory”, Grok „Brak kredytów” scalony z „0 zł”, Cowork „Jawny katalog” (dublował „Wielu dostawców”) zastąpiony przez „Praca po zamknięciu laptopa”. Każda tabela ma nadal 16 wierszy.

## Nowe fakty, których brakowało w v16-a

- OpenBot ma sejf Vault: loginy, karty i dane kontaktowe na komputerze, zaszyfrowane przez system. Agent widzi tylko nazwę karty i 4 ostatnie cyfry. Działają też 1Password i Bitwarden. Źródło: https://openbot.run/llms-full.txt
- OpenBot ma dyktowanie i panel Voice, a lokalne modele mowy obsługują 31 języków. Polski nie jest potwierdzony. Źródło: https://openbot.run/llms-full.txt
- Licencja OpenBot do pracy (10 albo 25 EUR miesięcznie) jest bezpłatna do 1 grudnia 2026, a darmowy jest tylko użytek osobisty i niekomercyjny. Źródło: https://openbot.run/pl/pricing
- OpenBot działa na Windows, macOS i Linuksie, ma aplikacje iPhone i Android, aplikację w przeglądarce oraz agentów w Slacku, Discordzie i Telegramie. Każdy agent ma własnego dostawcę, więc sprawdzający może mieć inny model. Źródło: https://openbot.run/llms.txt
- Dokumentacja OpenBot nie opisuje automatycznego punktu powrotu git. Poradnik radzi prosić agenta o zachowanie poprzedniej wersji pliku. Ocena `[brak]`, bo to nie jest wprost potwierdzony brak. Źródło: https://openbot.run/llms-full.txt
- Grok Bot nie ma osobnej subskrypcji. Jest w planach Premium, Super i Ultra, a Plus i Free go nie obejmują. Próba trwa 7 dni na części kont. Model zawsze wybiera usługa, nie ma wyboru modelu. Grok Bot wymaga zapisu danych w chmurze. Źródło: https://docs.x.ai/grok-bot/faq
- Auto Review w Grok Bot sprawdza każdą akcję przed wykonaniem i uwzględnia prośbę użytkownika. Klucze API wpisuje się w osobnej karcie, poza zapisem rozmowy. Źródło: https://docs.x.ai/grok-bot/approvals-security-and-privacy
- Cowork wykonuje pracę na serwerach Anthropic, a lokalne pliki czyta przez Claude Desktop. Działa tylko w płatnych planach. Zaplanowane zadania ruszają bez włączonego urządzenia. Źródło: https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork

## Pytania (tresci/pytania-v14.md)

- vs-openbot: nowy lead (OpenBot też lokalny, z planami i sprawdzaniem). Pytanie „...a OpenBot może?” sugerowało, że OpenBot oddaje niedokończoną pracę, więc zmieniono je na „Jak LumoBot pilnuje...”. Dopisano licencję do pracy, sejf Vault, panel Voice i poradę o wersjach plików.
- vs-grok-bot: dopisano brak osobnej subskrypcji, plany bez Grok Bota i 7 dni próby. Pytanie o model lokalny opiera się teraz na potwierdzonym fakcie, że model wybiera usługa.
- vs-claude-cowork: pytanie „Dlaczego LumoBot sprawdza wynik, a Cowork nie?” było nieprawdziwe, więc zmieniono je na „Jak LumoBot i Cowork pilnują wyniku?”. Dopisano, że Cowork pokazuje plan i pracuje na serwerach Anthropic.
- porownanie: zmieniono lead „Inni obiecują, że agent skończył” na neutralny. Ceny Manusa i Devina są już sprawdzone (oba mają plan Free, płatne plany od 20 USD). W pytaniu o cofanie dopisano, że Manus i Devin też mają punkty powrotu.
- glowna: usunięto zastrzeżenie „o ile te funkcje są zgodne z implementacją” i dopisano, w czym wygrywają Grok Bot i Cowork. Zdania o Manusie i Devinie poprawiono według v16-b: Manus Free daje 300 kredytów dziennie, Devin ma plan Free i aplikację na komputer, a nie działa wyłącznie w chmurze. Usunięto dopisek „do sprawdzenia”.

Źródła Manusa i Devina: https://manus.im/pricing, https://manus.im/docs/features/desktop.md, https://devin.ai/pricing, https://docs.devin.ai/desktop/models, https://docs.devin.ai/desktop/cascade (19.11.2026).

## Różnica (tresci/roznica-v14.md)

- vs-openbot: zdanie „OpenBot ma kroki zatwierdzania, ale nie opisuje potwierdzenia celu” pomijało, że OpenBot sprawdza pracę. Polska rozmowa przestała być wyróżnikiem, bo OpenBot ma głos. Dopisano, co mają oba programy, oraz licencję do pracy.
- vs-grok-bot: usunięto „nie są osobnymi granicami bezpieczeństwa”, bo to ocena bez cytatu. Dopisano, że Grok Bot też chroni hasła.
- vs-claude-cowork: „korzysta tylko z modeli Anthropic” zmieniono na potwierdzone „działa na modelach Claude”. Dopisano plan i ochronę przed usuwaniem plików.

## Uwaga dla Kreski

Strona musi wziąć nowe wiersze z tresci/tabela-v15.md: OpenBot „Telefon i komunikatory”, Grok i Cowork „Praca po zamknięciu laptopa”, Cowork „Obrazy i dokumenty”. Pozostałe tytuły wierszy zmieniły się tylko trochę.
