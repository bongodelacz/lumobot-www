"""Generuje podstrony porównań czesci/strona-vs-*.html z jednego miejsca z danymi.
Dane sprawdzone 19.11.2026 na oficjalnych stronach rywali i w kodzie LumoBota 0.24.4."""
from pathlib import Path
from html import escape as e

ROOT = Path(__file__).resolve().parent.parent / "strona" / "czesci"
L, R, T = "LumoBot", "rival", "tie"

RIVALS = [
 dict(slug="openbot", name="OpenBot", logo="openbot.svg", full=True, pal="lagoon", seed=0,
  kicker="Najbliższy krewny: zespół agentów na twoim komputerze",
  lead="Oba programy robią na pierwszy rzut oka to samo: kilku agentów AI pracuje na twoim komputerze na planach, które już opłacasz. Różnica jest w tym, co każdy z nich uważa za najważniejsze.",
  s1=("Krótka odpowiedź", [
   "OpenBot jest szerszy. Działa na Macu, Windowsie, Linuksie i telefonie, ma serwery dla firm i płótno z modelami obrazów i wideo. Jeśli potrzebujesz agentów wszędzie, to on jest dziś dalej.",
   "LumoBot jest węższy, ale pilnuje jednej rzeczy mocniej: wyniku. Zadanie nie kończy się, gdy agent napisze „zrobione”, tylko gdy przejdzie polecenie sprawdzające, na przykład testy. Każda zmiana idzie na osobną gałąź git, więc zawsze jest droga powrotu."]),
  me=["chcesz, żeby „gotowe” znaczyło „przeszło testy”", "rozmawiasz z agentami po polsku, także głosem", "chcesz pewnego powrotu przez gałąź git", "pracujesz na Windowsie i nie potrzebujesz serwera"],
  them=["pracujesz na Macu albo Linuksie", "chcesz sterować agentami z telefonu", "agenci mają pracować na serwerze całą dobę", "potrzebujesz kilku osób w jednym kanale z agentami"],
  rows=[
   ("Systemy", "Windows 10 i 11", "macOS, Windows, Linux, iPhone, Android", R),
   ("Gdzie pracują agenci", "Na twoim komputerze", "Na twoim komputerze albo serwerze", R),
   ("Cena prywatnie", "0 zł", "0 EUR", T),
   ("Użytek w pracy", "0 zł", "Licencja od 10 EUR miesięcznie, darmowa do 1 grudnia 2026", L),
   ("Serwer w chmurze", "Brak", "Od 30 EUR miesięcznie, 25 GB", R),
   ("Kiedy zadanie jest gotowe", "Gdy przejdzie polecenie sprawdzające albo niezależny sprawdzający", "Agenci przeglądają sobie wyniki, możesz zatwierdzać kroki", L),
   ("Powrót po błędzie", "Osobna gałąź git na każde zadanie i migawka plików", "Strona radzi trzymać kopie zapasowe", L),
   ("Dostawcy AI", "Claude Code, Codex, Antigravity, OpenCode, Cursor i klucze API", "Codex, Claude Code, Gemini, Grok, OpenCode, Cursor, Cline i inni", T),
   ("Modele lokalne", "Ollama i LM Studio", "Ollama i LM Studio", T),
   ("Głos", "Rozpoznawanie mowy offline po polsku, odpowiedzi głosem", "Czytanie odpowiedzi i polecenia głosowe", L),
   ("Telefon", "Powiadomienia przez ntfy, Discord, Slack, Telegram", "Aplikacje na iPhone i Androida", R),
   ("Harmonogram", "Raz, co kilka godzin, codziennie, co tydzień", "Rutyny i wyzwalacze w workflow", T),
   ("Ludzie w zespole", "Jeden użytkownik", "Kanały z ludźmi i agentami", R),
  ],
  s2=("Najważniejsza różnica", [
   "W OpenBocie agenci sami oceniają swoją pracę i przekazują ją dalej. To szybkie, ale ocena zależy od modelu, który właśnie pracował.",
   "W LumoBocie ostatnie słowo ma coś, co nie jest autorem: wynik testów, kod wyjścia polecenia albo osobny sprawdzający, który może tylko czytać. Dlatego LumoBot czasem pracuje dłużej, ale rzadziej oddaje coś, co tylko wygląda na skończone."]),
  facts=[("Cena w szczegółach", "Prywatnie 0 EUR. Licencja do pracy Starter 10 EUR, Team 25 EUR miesięcznie, w cenniku oznaczone jako darmowe do 1 grudnia 2026. Serwer Starter 30 EUR, Standard 50 EUR, Pro 100 EUR miesięcznie."),
         ("Licencja kodu", "Kod jest na GitHubie na licencji PolyForm Noncommercial, czyli można go czytać, ale użytek komercyjny wymaga licencji."),
         ("Gdzie OpenBot jest lepszy", "Więcej systemów, aplikacje mobilne, serwery dla firm, praca kilku osób w jednym kanale i bardzo częste wydania, co kilka dni.")],
  src=[("openbot.run", "https://openbot.run"), ("Cennik", "https://openbot.run/pricing"), ("Lista zmian", "https://openbot.run/changelog")]),

 dict(slug="grok-bot", name="Grok Bot", logo="grok.svg", full=False, pal="rose", seed=5,
  kicker="Twój komputer kontra komputer w chmurze",
  lead="Grok Bot od xAI to boty, które dostają własny komputer w chmurze, logują się do twoich narzędzi i pracują, gdy ty śpisz. LumoBot robi pracę na twoim komputerze, w twoim folderze.",
  s1=("Krótka odpowiedź", [
   "Jeśli agent ma pracować przy zamkniętym laptopie, siedzieć w Slacku i dołączać do spotkań, Grok Bot jest do tego zbudowany. Płacisz za to abonamentem od 30 USD miesięcznie i oddajesz pracę na komputer w chmurze.",
   "Jeśli pliki mają zostać u ciebie, a ty chcesz wiedzieć, jaki model robi zadanie, LumoBot daje ci tę kontrolę. Grok Bot sam wybiera model i według dokumentacji nie mówi, którego użył."]),
  me=["pliki i projekt mają zostać na twoim dysku", "chcesz sam wybierać model i dostawcę", "chcesz używać modeli lokalnych za darmo", "nie chcesz kolejnego abonamentu"],
  them=["agent ma pracować przy wyłączonym laptopie", "chcesz botów w Slacku, Teams i na spotkaniach", "i tak płacisz za X Premium albo Cursor", "potrzebujesz aplikacji na telefon"],
  rows=[
   ("Gdzie pracują agenci", "Na twoim komputerze", "Na komputerze w chmurze, lokalnie tylko za zgodą", L),
   ("Praca przy zamkniętym laptopie", "Nie", "Tak", R),
   ("Wybór modelu", "Ty wybierasz dostawcę i model", "Bot wybiera sam i nie pokazuje którego", L),
   ("Modele lokalne", "Ollama i LM Studio", "Brak", L),
   ("Cena", "0 zł", "Premium 30 USD, Super 100 USD, Ultra 200 USD miesięcznie", L),
   ("Limit użycia", "Limit twojego dostawcy AI", "Tygodniowa pula, dodatkowe użycie płatne", L),
   ("Systemy", "Windows 10 i 11", "macOS, Windows, Linux, iPhone, Android", R),
   ("Głos", "Po polsku, rozpoznawanie offline", "Dyktowanie, rozmowa na żywo, notatki głosowe", T),
   ("Spotkania i komunikatory", "Powiadomienia do Slacka, Discorda, Telegrama", "Bot w Slacku, Teams, Google Meet i Zoom", R),
   ("Kiedy zadanie jest gotowe", "Gdy przejdzie sprawdzenie", "Auto Review przed wrażliwymi akcjami", L),
   ("Oddzielenie agentów", "Każdy agent pracuje w folderze projektu", "Boty jednego użytkownika dzielą jeden komputer i logowania", L),
  ],
  s2=("O co tu naprawdę chodzi", [
   "Komputer w chmurze jest wygodny: działa zawsze i nie zabiera mocy twojej maszynie. Ale wszystko, czego bot potrzebuje, musi tam trafić, razem z logowaniami. Dokumentacja Grok Bota sama zaznacza, że boty jednej osoby nie są od siebie odgrodzone.",
   "LumoBot wybiera odwrotnie. Agent pracuje w folderze projektu na twoim dysku, hasła są szyfrowane lokalnie i nie trafiają do modelu, a ty widzisz, który dostawca wykonał każdy krok. Ceną jest to, że komputer musi być włączony."]),
  facts=[("Cena w szczegółach", "Premium 30 USD, Super 100 USD z 3,5 razy większym limitem, Ultra 200 USD z 12 razy większym. Jest też w planach X Premium, Super i Ultra oraz w płatnych planach Cursor."),
         ("Prywatność", "Grok Bot korzysta z logowania i ustawień prywatności Cursora. Usunięcie go oznacza usunięcie konta Cursor."),
         ("Gdzie Grok Bot jest lepszy", "Praca całą dobę bez twojego komputera, aplikacje mobilne, obecność w Slacku i na spotkaniach oraz gotowe boty w sklepie.")],
  src=[("x.ai/bot", "https://x.ai/bot"), ("FAQ Grok Bot", "https://docs.x.ai/grok-bot/faq"), ("Plany X", "https://docs.x.ai/x-subscription/grok-bot")]),

 dict(slug="claude-cowork", name="Claude Cowork", logo="claude.svg", full=False, pal="forest", seed=10,
  kicker="Wielu dostawców AI kontra jeden",
  lead="Cowork to tryb pracy w aplikacji Claude od Anthropic. Planuje zadanie, dzieli je na części, pracuje na plikach w wybranych folderach i może dalej działać w chmurze. LumoBot może użyć tego samego Claude Code, ale obok niego także innych dostawców.",
  s1=("Krótka odpowiedź", [
   "Jeśli pracujesz głównie na dokumentach, arkuszach i prezentacjach, a w firmie liczą się logi, zgodność i panel administratora, Cowork jest dopracowanym wyborem. Wymaga płatnego planu Claude.",
   "Jeśli chcesz w jednym zespole łączyć Claude, ChatGPT, Gemini i modele lokalne, a koniec zadania ma wyznaczać test, a nie ocena modelu, wybierz LumoBota. Możesz w nim dalej używać swojego planu Claude."]),
  me=["chcesz łączyć różnych dostawców AI w jednym zespole", "koniec zadania ma wyznaczać test", "chcesz rozmawiać głosem po polsku", "nie chcesz płacić za aplikację"],
  them=["pracujesz na dokumentach, arkuszach i prezentacjach", "zadanie ma trwać w chmurze po zamknięciu aplikacji", "firma potrzebuje administracji, logów i zgodności", "pracujesz na Macu"],
  rows=[
   ("Dostawcy AI", "Claude, ChatGPT, Antigravity, OpenCode, Cursor, klucze API", "Anthropic", L),
   ("Modele lokalne", "Ollama i LM Studio", "Brak", L),
   ("Cena", "0 zł plus twój plan AI", "Tylko płatne plany, Pro od 20 USD miesięcznie", L),
   ("Systemy", "Windows 10 i 11", "macOS, Windows, Linux w becie, web, telefon", R),
   ("Praca w chmurze", "Nie", "Tak, sesje w chmurze działają po zamknięciu aplikacji", R),
   ("Kiedy zadanie jest gotowe", "Gdy przejdzie polecenie sprawdzające albo niezależny sprawdzający", "Ocenia Claude, akcje zatwierdzasz ręcznie lub automatycznie", L),
   ("Zgoda na akcje", "Dostęp „pytaj” albo „pełny” dla każdego agenta", "Trzy tryby: ręczny, automatyczny, bez sprawdzania", T),
   ("Powrót po błędzie", "Osobna gałąź git na każde zadanie", "Usuwanie plików wymaga zgody", L),
   ("Harmonogram", "Tak, lokalnie", "Tak, w chmurze", T),
   ("Głos po polsku", "Tak", "Brak informacji", L),
   ("Administracja w firmie", "Brak", "Panel właściciela, Compliance API, OpenTelemetry", R),
  ],
  s2=("Najważniejsza różnica", [
   "Cowork to jeden mocny model, który dzieli zadanie na części i sam ocenia, czy skończył. Producent uczciwie pisze, że automatyczne sprawdzanie akcji może przeoczyć coś ryzykownego, i przy ważnej pracy poleca tryb ręczny.",
   "LumoBot rozdziela role. Jeden agent pisze, inny może sprawdzać, a decyzję o końcu podejmuje wynik polecenia, nie żaden z nich. Do tego każdy z agentów może pracować na innym dostawcy."]),
  facts=[("Cena w szczegółach", "Pro 20 USD miesięcznie albo 17 USD przy płatności rocznej, Max 100 USD, Ultra 200 USD, Team Standard 25 USD, Team Premium 125 USD za osobę."),
         ("Bezpieczeństwo", "Lokalne zadania działają w maszynie wirtualnej. Claude czyta i zapisuje tylko podłączone foldery. Producent ostrzega przed atakami przez wstrzyknięte polecenia."),
         ("Gdzie Cowork jest lepszy", "Praca w chmurze, więcej systemów, gotowe pliki Excel i PowerPoint, wtyczki i rozbudowana administracja dla firm.")],
  src=[("Pierwsze kroki", "https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork"), ("Cowork w firmie", "https://support.claude.com/en/articles/13455879-use-cowork-on-team-and-enterprise-plans"), ("Cennik Claude", "https://claude.com/pricing")]),

 dict(slug="manus", name="Manus", logo="manus.svg", full=False, pal="ember", seed=15,
  kicker="Twoje plany AI kontra kredyty",
  lead="Manus to autonomiczny agent, który pracuje w chmurze albo w aplikacji Manus Studio na twoim komputerze. Rozlicza pracę w kredytach. LumoBot nie ma kredytów, bo korzysta z planu AI, który już masz.",
  s1=("Krótka odpowiedź", [
   "Manus jest mocny w automatyzacjach: zadania mogą ruszać same po nowym mailu, wydarzeniu w kalendarzu albo wiadomości na Slacku, a komputer w chmurze pracuje całą dobę. Za wygodę płacisz kredytami i osobnym abonamentem za komputer.",
   "LumoBot nie liczy kredytów i nie ukrywa, jaki model pracuje. Zadanie kończy się dopiero po sprawdzeniu, a każda zmiana ląduje na osobnej gałęzi git, więc łatwo ją cofnąć."]),
  me=["nie chcesz liczyć kredytów", "chcesz wiedzieć, jaki model wykonuje zadanie", "potrzebujesz testów i git jako zabezpieczenia", "chcesz używać modeli lokalnych"],
  them=["chcesz automatyzacji uruchamianych mailem, kalendarzem czy Slackiem", "potrzebujesz komputera w chmurze całą dobę", "pracujesz na Macu", "chcesz podglądać pulpit z telefonu"],
  rows=[
   ("Rozliczenie", "Brak, płacisz tylko dostawcy AI", "Kredyty: Free 300 dziennie, Pro od 4000 za 20 USD", L),
   ("Gdzie pracuje", "Na twoim komputerze", "W chmurze albo w Manus Studio na twoim komputerze", T),
   ("Komputer w chmurze", "Brak", "Od 30 USD miesięcznie", R),
   ("Wybór modelu", "Dowolny dostawca, także lokalny", "Agenci Manusa, np. Max i Lite", L),
   ("Systemy", "Windows 10 i 11", "macOS, Windows, web, telefon", R),
   ("Zadania naraz", "Kilku agentów w zespole", "Free 1, Pro 20", T),
   ("Automatyzacje", "Harmonogram", "Harmonogram i zdarzenia: mail, kalendarz, Slack, Notion", R),
   ("Kiedy zadanie jest gotowe", "Gdy przejdzie sprawdzenie", "Tryby zgody na akcje", L),
   ("Dostęp do plików", "Agent nie wychodzi poza folder projektu", "Polecenia mogą czytać każdy plik twojego konta", L),
   ("Powrót po błędzie", "Osobna gałąź git na każde zadanie", "Brak informacji", L),
   ("Gdzie są dane", "Na twoim komputerze", "USA i Singapur", L),
  ],
  s2=("O co tu naprawdę chodzi", [
   "Kredyty są wygodne na start, ale trudno przewidzieć, ile kosztuje zadanie, dopóki się nie skończy. Do tego dochodzi osobny abonament, jeśli praca ma trwać przy wyłączonym komputerze.",
   "LumoBot nie stoi między tobą a modelem. Płacisz swojemu dostawcy tyle, ile i tak płacisz, albo zero przy Ollamie i LM Studio. W zamian musisz mieć włączony komputer, bo nie mamy chmury."]),
  facts=[("Cena w szczegółach", "Free 0 USD z 300 kredytami dziennie. Pro od 20 USD za 4000 kredytów albo 40 USD za 8000. Team od 20 USD za osobę. Cloud Computer Standard 30 USD, Advanced 50 USD miesięcznie."),
         ("Na co uważać", "W trybach zgody zmiany plików są ograniczone do folderu zadania, ale polecenia mogą czytać wszystko, co widzi twoje konto. Po rezygnacji z Cloud Computer jego pliki są usuwane."),
         ("Gdzie Manus jest lepszy", "Automatyzacje po zdarzeniach, komputer w chmurze, Mac, aplikacje mobilne i zdalny podgląd pulpitu.")],
  src=[("Manus 2.0", "https://manus.im/en/blog/introducing-manus-2-0"), ("Manus Studio", "https://manus.im/docs/features/desktop.md"), ("Plany i kredyty", "https://help.manus.im/en/articles/11711111"), ("Cloud Computer", "https://help.manus.im/en/articles/15392078-understanding-cloud-computer-plans-and-billing")]),

 dict(slug="openclaw", name="OpenClaw", logo="openclaw.svg", full=False, pal="ocean", seed=20,
  kicker="Asystent w komunikatorze kontra zespół przy projekcie",
  lead="OpenClaw to darmowy asystent AI z otwartym kodem, który stawiasz u siebie i z którym piszesz przez WhatsAppa, Telegrama, Slacka czy Discorda. LumoBot to aplikacja z oknem, w której zespół agentów kończy konkretne zadanie w folderze projektu.",
  s1=("Krótka odpowiedź", [
   "OpenClaw jest świetny, jeśli chcesz osobistego asystenta, do którego piszesz z telefonu jak do znajomego, i lubisz sam go konfigurować. Kod jest na licencji MIT, a społeczność dodaje setki umiejętności.",
   "LumoBot jest dla tych, którzy chcą, żeby praca była skończona i sprawdzona, bez stawiania serwera i bez instalowania umiejętności od obcych ludzi. Pobierasz instalator, logujesz się do swojego planu AI i zlecasz zadanie."]),
  me=["nie chcesz niczego konfigurować w terminalu", "zadanie ma kończyć się testem, a nie odpowiedzią w czacie", "nie chcesz instalować dodatków od nieznanych autorów", "chcesz okno z podglądem pracy agentów"],
  them=["chcesz pisać do asystenta przez WhatsAppa albo Telegrama", "zależy ci na otwartym kodzie na licencji MIT", "pracujesz na Macu albo Linuksie", "chcesz aplikacji na telefon z głosem i kamerą"],
  rows=[
   ("Licencja", "Brak publicznej licencji", "MIT, otwarty kod", R),
   ("Instalacja", "Instalator na Windows", "Skrypt w terminalu, npm albo Docker, wymaga Node.js", L),
   ("Jak z nim rozmawiasz", "Okno aplikacji i głos", "WhatsApp, Telegram, Slack, Discord, iMessage, Teams i ponad 20 innych", R),
   ("Cena", "0 zł", "0 zł plus twój dostawca AI", T),
   ("Plany AI bez klucza API", "Claude Code, Codex, Antigravity, OpenCode, Cursor", "Głównie klucze API, plus Claude CLI i Codex", L),
   ("Modele lokalne", "Ollama i LM Studio", "Ollama, LM Studio, llama.cpp, vLLM i inne", R),
   ("Kiedy zadanie jest gotowe", "Gdy przejdzie polecenie sprawdzające", "Gdy asystent odpowie", L),
   ("Izolacja", "Agent nie wychodzi poza folder projektu", "Narzędzia działają na komputerze bez piaskownicy, chyba że ją ustawisz", L),
   ("Dodatki", "Umiejętności i narzędzia MCP", "Sklep ClawHub, w którym znaleziono setki szkodliwych dodatków", L),
   ("Systemy", "Windows 10 i 11", "macOS, Linux, Windows, iOS, Android", R),
   ("Harmonogram", "Tak", "Tak, cron i webhooki", T),
   ("Powrót po błędzie", "Osobna gałąź git na każde zadanie", "Brak informacji", L),
  ],
  s2=("O co tu naprawdę chodzi", [
   "OpenClaw daje dużo wolności, ale zostawia bezpieczeństwo tobie. Według dokumentacji narzędzia działają bezpośrednio na komputerze, a badacze bezpieczeństwa znaleźli w sklepie ClawHub setki dodatków kradnących hasła. Tysiące instalacji były też wystawione do internetu.",
   "LumoBot jest bardziej zamknięty, ale to celowe. Agent pracuje tylko w folderze projektu, nie widzi twoich haseł, każda zmiana idzie na osobną gałąź git, a koniec zadania wyznacza sprawdzenie, nie rozmowa."]),
  facts=[("Cena w szczegółach", "Program jest darmowy, bez płatnej wersji i bez usługi w chmurze. Płacisz tylko dostawcy modelu przez swój klucz API."),
         ("Na co uważać", "Koi Security sprawdziło 2857 dodatków w ClawHub i oznaczyło 341 jako szkodliwe. Jest też poważna luka CVE-2026-25253. ClawHub dodał później skanowanie dodatków."),
         ("Gdzie OpenClaw jest lepszy", "Otwarty kod, rozmowa przez ponad 20 komunikatorów, aplikacje na wszystkie systemy, więcej modeli lokalnych i duża społeczność.")],
  src=[("GitHub OpenClaw", "https://github.com/openclaw/openclaw"), ("Dokumentacja", "https://docs.openclaw.ai"), ("Dostawcy modeli", "https://docs.openclaw.ai/providers"), ("Szkodliwe dodatki", "https://esecurityplanet.com/threats/hundreds-of-malicious-skills-found-in-openclaws-clawhub")]),

 dict(slug="devin", name="Devin", logo="devin.svg", full=False, pal="violet", seed=25,
  kicker="Programista w chmurze kontra zespół na twoim komputerze",
  lead="Devin od Cognition to autonomiczny inżynier oprogramowania. Pracuje w chmurze z własnym terminalem, edytorem i przeglądarką, bierze zgłoszenia z Jiry czy Lineara i oddaje pull requesty. LumoBot też potrafi programować, ale pracuje na twoim komputerze i nie tylko przy kodzie.",
  s1=("Krótka odpowiedź", [
   "Jeśli prowadzisz zespół programistów i chcesz oddać agentowi zgłoszenia z backlogu, Devin jest do tego stworzony. Łączy się z GitHubem, GitLabem, Jirą, Linearem i Slackiem, a Devin Review sprawdza pull requesty.",
   "Jeśli pracujesz sam albo w małym zespole i chcesz, żeby agenci robili nie tylko kod, ale też teksty, grafiki i strony, a do tego na twoim planie AI, LumoBot wychodzi taniej i zostawia pliki u ciebie."]),
  me=["nie chcesz płacić od 20 do 200 USD miesięcznie za agenta", "pliki mają zostać na twoim komputerze", "robisz nie tylko kod, ale też teksty i grafiki", "chcesz rozmawiać po polsku głosem"],
  them=["prowadzisz zespół programistów z backlogiem w Jirze albo Linearze", "chcesz automatycznego przeglądu pull requestów", "zadania mają iść równolegle w chmurze", "firma wymaga SOC 2 i wdrożenia w VPC"],
  rows=[
   ("Do czego służy", "Każde zadanie w folderze: kod, tekst, grafika, strona", "Programowanie: zgłoszenia, poprawki, pull requesty", T),
   ("Gdzie pracuje", "Na twoim komputerze", "W chmurze, plus CLI na twoim komputerze", L),
   ("Cena", "0 zł plus twój plan AI", "Free, Pro 20 USD, Max 200 USD, Teams 80 USD plus 40 USD za osobę", L),
   ("Kiedy zadanie jest gotowe", "Gdy przejdzie polecenie sprawdzające", "Pisze testy, otwiera pull request, Devin Review szuka błędów", T),
   ("Przegląd kodu", "Opcjonalny sprawdzający przed oddaniem", "Devin Review z oceną pewności i testami bezpieczeństwa", R),
   ("Integracje", "Powiadomienia do Slacka, Discorda, Telegrama", "GitHub, GitLab, Bitbucket, Jira, Linear, Slack, Teams", R),
   ("Wybór modelu", "Dowolny dostawca, także lokalny", "SWE-2 i modele wybrane przez Devina", L),
   ("Modele lokalne", "Ollama i LM Studio", "Brak", L),
   ("Praca równoległa", "Kilku agentów w zespole", "Kilka sesji naraz, zależnie od planu", T),
   ("Bezpieczeństwo firmy", "Brak certyfikatów", "SOC 2 Type II, wdrożenie dedykowane", R),
   ("Głos po polsku", "Tak", "Brak informacji", L),
  ],
  s2=("Najważniejsza różnica", [
   "Devin jest specjalistą: robi jedną rzecz, programowanie, i robi ją w swojej chmurze, połączony z narzędziami zespołu. Za to płacisz miesięczny abonament, a większe firmy rozliczają się w jednostkach pracy ACU.",
   "LumoBot jest zespołem ogólnym. Lider dzieli zadanie, inni agenci piszą, budują i rysują, a całość kończy się dopiero po sprawdzeniu. Wszystko dzieje się w folderze na twoim dysku, na modelu, za który już płacisz."]),
  facts=[("Cena w szczegółach", "Free 0 USD z małym limitem. Pro 20 USD, Max 200 USD miesięcznie. Teams 80 USD plus 40 USD za każdego programistę, do 100 osób. Enterprise rozliczany w ACU według umowy."),
         ("Dane i bezpieczeństwo", "Certyfikat SOC 2 Type II od września 2024. Kod klientów domyślnie nie służy do trenowania. Wdrożenia dedykowane trzymają dane u klienta."),
         ("Gdzie Devin jest lepszy", "Integracja z GitHubem, Jirą i Linearem, przegląd pull requestów, praca w chmurze bez twojego komputera i wymagania bezpieczeństwa dużych firm.")],
  src=[("Czym jest Devin", "https://docs.devin.ai/get-started/devin-intro"), ("Cennik", "https://devin.ai/pricing"), ("Devin Review", "https://docs.devin.ai/work-with-devin/devin-review"), ("Bezpieczeństwo", "https://docs.devin.ai/enterprise/security/enterprise-security")])
]

ACC = {"openbot": "OpenBota", "grok-bot": "Grok Bota", "claude-cowork": "Claude Cowork", "manus": "Manusa", "openclaw": "OpenClaw", "devin": "Devina"}
ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
SCRIPT = """<script>
(function(){
  const run = () => { if(!window.lumoGrain) return;
    document.querySelectorAll('.spo-duel,.vs-mini').forEach(box => { let seen = false;
      new IntersectionObserver(es => { seen = es[0].isIntersecting; if(seen) window.lumoGrain.wake(); }).observe(box);
      window.lumoGrain.add(box, () => seen, +box.dataset.seed, box.dataset.pal); }); };
  document.readyState === 'complete' ? run() : addEventListener('load', run);
})();
</script>"""

def rv(r, cls=""):
    c = ' class="pj-full"' if r["full"] else ""
    return f'<span class="pj-me"><img src="img/logo.png" alt="LumoBot"></span><em>vs</em><span class="pj-rv"><img src="img/rywale/{r["logo"]}" alt="{e(r["name"])}"{c}></span>'

def page(r):
    n = e(r["name"])
    score = {L: 0, R: 0, T: 0}
    for row in r["rows"]: score[row[3]] += 1
    rows = "\n".join(
        f'<tr><th>{e(k)}</th><td class="{"win" if w == L else ""}">{e(a)}</td><td class="{"win" if w == R else ""}">{e(b)}</td></tr>'
        for k, a, b, w in r["rows"])
    p1 = "".join(f"<p>{e(x)}</p>" for x in r["s1"][1])
    p2 = "".join(f"<p>{e(x)}</p>" for x in r["s2"][1])
    me = "".join(f"<li>{e(x)}</li>" for x in r["me"])
    th = "".join(f"<li>{e(x)}</li>" for x in r["them"])
    facts = "\n".join(f'<div class="spo-fact"><h4>{e(a)}</h4><p>{e(b)}</p></div>' for a, b in r["facts"])
    src = "".join(f'<a href="{u}" target="_blank" rel="noopener noreferrer">{e(t)}</a>' for t, u in r["src"])
    others = "\n".join(
        f'<a class="vs-other" href="vs-{o["slug"]}.html"><span class="vs-mini" data-pal="{o["pal"]}" data-seed="{o["seed"]}"><img src="img/rywale/{o["logo"]}" alt=""></span><b>LumoBot vs {e(o["name"])}</b><span class="pj-ar" aria-hidden="true">{ARROW}</span></a>'
        for o in RIVALS if o is not r)
    return f"""<section class="dark spo-section vs-page">
  <div class="wrap spo-wrap">
    <a class="vs-crumb" href="porownanie.html">‹ Wszystkie porównania</a>
    <div class="spo-duel vs-hero" data-pal="{r['pal']}" data-seed="{r['seed']}">{rv(r)}</div>
    <h1 class="display vs-title">LumoBot vs {n}</h1>
    <p class="vs-kicker">{e(r['kicker'])}</p>
    <p class="vs-lead">{e(r['lead'])}</p>
    <p class="spo-meta">Sprawdzone 19 listopada 2026 na oficjalnych stronach i w kodzie LumoBota 0.24.4.</p>

    <section class="vs-text"><h2 class="title">{e(r['s1'][0])}</h2>{p1}</section>

    <div class="spo-pick">
      <div class="me"><h4>Wybierz LumoBota, jeśli</h4><ul>{me}</ul></div>
      <div><h4>Wybierz {e(ACC[r["slug"]])}, jeśli</h4><ul>{th}</ul></div>
    </div>

    <section class="vs-tab">
      <h2 class="title">Punkt po punkcie</h2>
      <p class="vs-score"><span class="l">LumoBot lepszy w {score[L]}</span><span>{n} lepszy w {score[R]}</span><span>Remis w {score[T]}</span></p>
      <div class="spo-scroll"><table class="vs-table">
        <thead><tr><th></th><th><img src="img/logo.png" alt="">LumoBot</th><th><img src="img/rywale/{r['logo']}" alt="">{n}</th></tr></thead>
        <tbody>
{rows}
        </tbody></table></div>
      <p class="vs-note">Pogrubione pole oznacza, kto w danym punkcie wypada lepiej.</p>
    </section>

    <section class="vs-text"><h2 class="title">{e(r['s2'][0])}</h2>{p2}</section>

    <div class="spo-profile-grid vs-facts">
{facts}
    </div>
    <p class="spo-src">Źródła {src}</p>

    <section class="vs-more"><h2 class="title">Inne porównania</h2><div class="vs-others">
{others}
    </div><p class="spo-back"><a href="pobierz.html">Pobierz LumoBota za darmo ›</a></p></section>
  </div>
</section>
{SCRIPT}
"""

for r in RIVALS:
    (ROOT / f"strona-vs-{r['slug']}.html").write_text(page(r), encoding="utf-8")
    print("zapisano", r["slug"])
