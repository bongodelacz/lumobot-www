"""Pisze 6 podstron wtyczek (strona/czesci/strona-wtyczka-*.html) jako czysty tekst z tytułami sekcji.

Fakty tylko z tresci/polaczenia-v16.md (dane z aplikacji). Uruchom:  python narzedzia/wtyczki_podstrony.py
Potem narzedzia/zloz.py.
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "strona" / "czesci"

CHEV = ('<span class="fq-chev" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" '
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>')

SAFE = [
    ("Hasła zostają u ciebie", "Hasła, które podajesz w LumoBocie, są zaszyfrowane na twoim komputerze. Nie trafiają do chmury ani do modelu AI. Do kont logujesz się sam w przeglądarce agenta, a agent pracuje na gotowej sesji i nie zna hasła."),
    ("Projekty i dane na twoim dysku", "Wszystkie projekty, pliki i ustawienia zostają w folderach na twoim komputerze. LumoBot nie ma własnej chmury i nie przesyła nam twoich danych."),
    ("Ty decydujesz, co wychodzi", "Do dostawcy AI, którego sam wybierzesz, trafia tylko treść zadania. Z modelem lokalnym, na przykład Ollama albo LM Studio, nic nie opuszcza komputera. Zanim agent coś wyśle albo opublikuje, pokazuje gotową treść i czeka na twoje „tak”."),
]

PAGES = [
    {
        "slug": "google", "pal": "rose", "seed": 31,
        "logos": [("polaczenia/gmail.svg", "Gmail"), ("polaczenia/gcal.svg", "Kalendarz Google")],
        "title": "Gmail i Kalendarz Google",
        "lead": "Agent przegląda twoją skrzynkę i kalendarz, układa plan dnia i przygotowuje odpowiedzi. Wysyła dopiero wtedy, gdy to zatwierdzisz.",
        "services": [
            ("Gmail", "Agent otwiera Gmaila w swojej przeglądarce, na sesji, którą sam zalogowałeś. Czyta nowe wiadomości, wyciąga z nich sprawy do zrobienia i pisze szkice odpowiedzi. Szkic widzisz w LumoBocie, zanim cokolwiek trafi do adresata."),
            ("Kalendarz Google", "Agent sprawdza spotkania na dziś i na cały tydzień. Wyłapuje nakładające się terminy, przypomina o spotkaniach z poczty i dokłada je do planu dnia."),
        ],
        "tasks": [
            "Przejrzyj pocztę z rana i zrób listę spraw na dziś, od najpilniejszej.",
            "Sprawdź, czy w tym tygodniu nie mam dwóch spotkań w tym samym czasie.",
            "Napisz szkic odpowiedzi na maila od klienta i pokaż mi go przed wysłaniem.",
            "Znajdź w poczcie wszystkie terminy z tego tygodnia i zestaw je z kalendarzem.",
        ],
        "together": ("Poranny przegląd", "Gotowy wzór planu rusza o 08:00: przegląda skrzynkę Gmail, sprawdza dzisiejsze spotkania w Kalendarzu Google i układa plan dnia w pięciu punktach. Rano czeka na ciebie gotowa lista."),
        "start": [
            "Otwórz w LumoBocie Ustawienia, potem Połączenia, i kliknij Połącz przy Gmailu oraz przy Kalendarzu Google.",
            "Zaloguj się sam w przeglądarce agenta, tak jak w zwykłej przeglądarce.",
            "Napisz zadanie w czacie, na przykład: „Przejrzyj pocztę z dzisiaj i zrób listę spraw”.",
        ],
        "links": [("Gmail", "https://mail.google.com"), ("Kalendarz Google", "https://calendar.google.com")],
        "related": ["slack-discord", "wzory"],
        "faq": [
            ("Czy agent widzi moje hasło do Gmaila?", "Nie. Logujesz się sam w przeglądarce agenta, a agent pracuje na gotowej sesji. Hasła nie zna, nie prosi o nie w czacie i nie trafia ono do modelu AI."),
            ("Czy agent wyśle maila bez mojej wiedzy?", "Nie. Przed wysłaniem pokazuje gotową treść i czeka na twoją zgodę. Możesz poprawić szkic albo go odrzucić."),
            ("Czy mogę dostawać przegląd skrzynki codziennie rano?", "Tak. Włącz wzór Poranny przegląd. O 08:00 agent przejrzy pocztę i spotkania, a potem ułoży plan dnia w pięciu punktach."),
            ("Czy działa też z Outlookiem i Teams?", "Tak. W tej samej grupie połączeń są Outlook, Microsoft Teams, Zoom i Calendly. Łączysz je tak samo, logując się samemu."),
            ("Ile to kosztuje?", "LumoBot kosztuje 0 zł, a połączenia są w cenie. Płacisz tylko za plan AI, który już masz, albo nic przy modelu lokalnym."),
        ],
    },
    {
        "slug": "notion-dysk", "pal": "ember", "seed": 32,
        "logos": [("polaczenia/notion.svg", "Notion"), ("polaczenia/gdrive.svg", "Dysk Google")],
        "title": "Notion i Dysk Google",
        "lead": "Agent czyta twoje notatki i pliki, streszcza je i zapisuje gotowe raporty tam, gdzie trzymasz resztę pracy.",
        "services": [
            ("Notion", "Agent przegląda strony i bazy w Notion na twojej sesji. Streszcza notatki ze spotkań, wyłapuje zaległe zadania z planu projektu i przygotowuje nowe strony z podsumowaniem."),
            ("Dysk Google", "Agent przegląda foldery na Dysku, znajduje stare i duże pliki, a gotowe raporty zapisuje we wskazanym miejscu. Obok Dysku łączysz też Dokumenty, Arkusze i Zdjęcia Google."),
        ],
        "tasks": [
            "Znajdź w Notion notatki z ostatniego tygodnia i zrób z nich jedno podsumowanie.",
            "Przejrzyj plan projektu w Notion i wypisz, co jest po terminie.",
            "Wypisz pliki na Dysku, które od roku nikt nie otwierał i które zajmują najwięcej miejsca.",
            "Zapisz raport z projektu na Dysku Google w folderze Raporty.",
        ],
        "together": ("Tygodniowy porządek", "Gotowy wzór planu porządkuje folder Pobrane, przygotowuje raport z projektu i zapisuje go na Dysku Google. Raz w tygodniu, bez twojego udziału aż do zatwierdzenia."),
        "start": [
            "Otwórz Ustawienia, potem Połączenia, i kliknij Połącz przy Notion, a potem przy Dysku Google.",
            "Zaloguj się sam w przeglądarce agenta. Hasła nie podajesz LumoBotowi.",
            "Napisz zadanie w czacie, na przykład: „Streść moje notatki z tego tygodnia”.",
        ],
        "links": [("Notion", "https://www.notion.so"), ("Dysk Google", "https://drive.google.com")],
        "related": ["google", "wzory"],
        "faq": [
            ("Czy agent może zmienić moje pliki bez pytania?", "Wszystko, co widzą inni albo co trafia na zewnątrz, agent najpierw ci pokazuje i czeka na zgodę. Pracę w folderze projektu na twoim dysku możesz cofnąć punktem powrotu."),
            ("Co z moim hasłem do Notion?", "Agent go nie zna. Logujesz się sam w przeglądarce agenta, a agent korzysta z gotowej sesji."),
            ("Czy agent zapisze wynik pracy w Notion albo na Dysku?", "Tak. Przygotuje treść i zapisze ją w wybranym miejscu, gdy to zatwierdzisz. Wzór Tygodniowy porządek robi to co tydzień."),
            ("Jakie inne miejsca na pliki mogę podłączyć?", "Dokumenty i Arkusze Google, Dropbox, OneDrive, Microsoft 365, Airtable, Trello, Canva i WordPress. W sumie 15 połączeń w grupie Pliki i dokumenty."),
            ("Ile to kosztuje?", "LumoBot kosztuje 0 zł, a połączenia są w cenie. Płacisz tylko za plan AI, który już masz."),
        ],
    },
    {
        "slug": "przegladarka", "pal": "lagoon", "seed": 33,
        "logos": [("polaczenia/playwright.svg", "Przeglądarka Playwright"), ("polaczenia/context7.svg", "Dokumentacja Context7")],
        "title": "Przeglądarka i dokumentacja",
        "lead": "Agent ma własną przeglądarkę. Wchodzi na strony, wypełnia formularze i porównuje treści, a przy kodzie sprawdza aktualną dokumentację zamiast pisać z pamięci.",
        "services": [
            ("Przeglądarka Playwright", "Pełne sterowanie prawdziwą przeglądarką: logowanie, formularze, wiele kart naraz. Działa osobno od twojej przeglądarki, więc agent nie zabiera ci ekranu. Przy pierwszym użyciu pobiera się sama."),
            ("Dokumentacja Context7", "Aktualna dokumentacja bibliotek i frameworków. Agent czyta ją przed pisaniem kodu, więc rzadziej podaje przestarzałe funkcje i przykłady."),
        ],
        "tasks": [
            "Sprawdź status mojego zamówienia na stronie sklepu i zapisz go w notatce.",
            "Wypełnij formularz zgłoszenia według mojego opisu, ale nie wysyłaj go bez mojej zgody.",
            "Otwórz trzy strony z ofertami i porównaj ceny w jednej tabeli.",
            "Sprawdź w aktualnej dokumentacji, jak działa ta funkcja biblioteki, i napisz przykład.",
        ],
        "together": ("Pilnowanie ceny", "Gotowy wzór planu codziennie o 09:00 sprawdza cenę produktu, zapisuje ją z datą w pliku ceny.md i porównuje z poprzednimi wpisami."),
        "start": [
            "Włącz w LumoBocie narzędzie Przeglądarka Playwright, a przy pracy z kodem także Dokumentację Context7.",
            "Gdy strona wymaga logowania, zaloguj się sam w przeglądarce agenta.",
            "Napisz zadanie w czacie, na przykład: „Porównaj ceny tego produktu w trzech sklepach”.",
        ],
        "links": [("Playwright", "https://playwright.dev"), ("Context7", "https://context7.com")],
        "related": ["github-figma", "wzory"],
        "faq": [
            ("Czy agent zna hasła do stron, na których się loguje?", "Nie. Logujesz się sam, a agent korzysta z gotowej sesji. Hasła nie zna i nie prosi o nie w czacie."),
            ("Czy agent kliknie Zapłać bez pytania?", "Nie. Przed płatnością, wysyłką albo publikacją pokazuje, co zrobi, i czeka na twoją zgodę."),
            ("Czy przeglądarka agenta przeszkadza mi w pracy?", "Nie. Działa w tle, osobno od twojej przeglądarki. Ty dalej pracujesz na swoim ekranie."),
            ("Po co agentowi dokumentacja?", "Modele uczą się na starszych danych. Context7 daje agentowi aktualną dokumentację, więc kod pasuje do wersji biblioteki, której używasz."),
            ("Ile to kosztuje?", "LumoBot kosztuje 0 zł, a narzędzia są w cenie. Przeglądarka pobiera się sama przy pierwszym użyciu."),
        ],
    },
    {
        "slug": "slack-discord", "pal": "violet", "seed": 34,
        "logos": [("polaczenia/slack.svg", "Slack"), ("polaczenia/discord.svg", "Discord")],
        "title": "Slack i Discord",
        "lead": "Agent czyta kanały i prywatne wiadomości, mówi ci, na co trzeba odpowiedzieć, i przygotowuje odpowiedzi. Nic nie wyśle bez twojej zgody.",
        "services": [
            ("Slack", "Agent przegląda kanały zespołu i wiadomości prywatne na twojej sesji. Zbiera pytania bez odpowiedzi, streszcza długie wątki i przygotowuje szkice odpowiedzi."),
            ("Discord", "Agent czyta serwery i prywatne wiadomości, wyłapuje to, co dotyczy ciebie, i pisze zapowiedzi oraz odpowiedzi do zatwierdzenia. Na Discord LumoBot może też wysyłać ci powiadomienia o skończonych zadaniach."),
        ],
        "tasks": [
            "Przejrzyj nieprzeczytane wiadomości na Slacku i wypisz, na co muszę dziś odpowiedzieć.",
            "Streść najdłuższy wątek z kanału projektu w pięciu zdaniach.",
            "Przygotuj szkice odpowiedzi na prywatne wiadomości na Discordzie.",
            "Napisz zapowiedź nowej wersji na serwer Discord i pokaż mi ją przed publikacją.",
        ],
        "together": ("Odpowiedzi na wiadomości", "Gotowy wzór planu zbiera wiadomości z Gmaila, prywatnych rozmów na Discordzie i Messengera, a potem przygotowuje odpowiedzi. Każdą widzisz przed wysłaniem."),
        "start": [
            "Otwórz Ustawienia, potem Połączenia, i kliknij Połącz przy Slacku, a potem przy Discordzie.",
            "Zaloguj się sam w przeglądarce agenta.",
            "Napisz zadanie w czacie, na przykład: „Przejrzyj Slacka i powiedz, na co muszę dziś odpowiedzieć”.",
        ],
        "links": [("Slack", "https://slack.com"), ("Discord", "https://discord.com")],
        "related": ["google", "wzory"],
        "faq": [
            ("Czy agent wyśle wiadomość za mnie?", "Przygotuje treść, ale najpierw pokaże ją tobie i zapyta o zgodę. Bez twojego „tak” nic nie trafia do rozmówcy."),
            ("Czy agent widzi moje hasło do Discorda?", "Nie. Logujesz się sam w przeglądarce agenta, a agent korzysta z gotowej sesji."),
            ("Jakie inne komunikatory mogę podłączyć?", "Messenger, WhatsApp, Telegram i Skype. Razem ze Slackiem i Discordem to 6 komunikatorów."),
            ("Czy mogę zlecić zadanie wiadomością na Slacku?", "Jeszcze nie. Dziś zadanie zaczynasz w aplikacji, a LumoBot pisze do ciebie, gdy skończy. Zlecanie pracy z komunikatora jest w naszych planach."),
            ("Ile to kosztuje?", "LumoBot kosztuje 0 zł, a połączenia są w cenie."),
        ],
    },
    {
        "slug": "github-figma", "pal": "forest", "seed": 35,
        "logos": [("polaczenia/github.svg", "GitHub"), ("polaczenia/figma.svg", "Figma")],
        "title": "GitHub i Figma",
        "lead": "Agent zna twoje repozytoria i projekty. Porządkuje zgłoszenia, opisuje zmiany i buduje strony, które wyglądają jak makieta w Figmie.",
        "services": [
            ("GitHub", "Zgłoszenia, pull requesty i repozytoria. Agent czyta otwarte zgłoszenia, opisuje zmiany i przygotowuje pull requesty. Łączysz go osobistym tokenem GitHub, który wpisujesz sam w ustawieniach."),
            ("Figma", "Odczyt projektów: układ, kolory i komponenty. Agent bierze wartości prosto z makiety, więc strona trzyma odstępy i kolory projektanta. Figmę łączysz, logując się w przeglądarce."),
        ],
        "tasks": [
            "Przejrzyj otwarte zgłoszenia w repozytorium i wypisz trzy najpilniejsze.",
            "Opisz zmiany z tej gałęzi i przygotuj pull request, ale go nie publikuj.",
            "Odczytaj z Figmy kolory i odstępy i zbuduj stronę zgodną z makietą.",
            "Porównaj stronę z projektem w Figmie i wypisz różnice.",
        ],
        "together": ("Praca do skutku", "Przy kodzie zadanie kończy się dopiero, gdy przejdzie sprawdzenie, na przykład testy. Każda zmiana idzie na osobnej gałęzi git, więc główna gałąź zostaje nietknięta."),
        "start": [
            "Włącz w LumoBocie narzędzie GitHub i wpisz sam swój osobisty token GitHub.",
            "Włącz narzędzie Figma i zaloguj się do Figmy w przeglądarce agenta.",
            "Napisz zadanie w czacie, na przykład: „Wypisz pilne zgłoszenia w moim repozytorium”.",
        ],
        "links": [("Tokeny GitHub", "https://github.com/settings/tokens"), ("Figma", "https://www.figma.com")],
        "related": ["przegladarka", "notion-dysk"],
        "faq": [
            ("Czy agent zna mój token GitHub?", "Token wpisujesz sam w ustawieniach LumoBota. Agent z niego korzysta, ale nie prosi o niego w czacie i nie pokazuje go w rozmowie."),
            ("Czy agent opublikuje pull request bez mojej zgody?", "Nie. Przed publikacją pokazuje treść i czeka na twoje zatwierdzenie. LumoBot niczego nie publikuje sam."),
            ("Czy agent zmieni mój projekt w Figmie?", "Nie. Połączenie z Figmą służy do odczytu: układu, kolorów i komponentów. Twoja makieta zostaje bez zmian."),
            ("Co, jeśli agent zepsuje kod?", "Każde zadanie idzie na osobnej gałęzi git, a po każdej rundzie powstaje punkt powrotu. Zawsze możesz do niego wrócić."),
            ("Ile to kosztuje?", "LumoBot kosztuje 0 zł, a narzędzia są w cenie. Płacisz tylko za plan AI, który już masz."),
        ],
    },
    {
        "slug": "wzory", "pal": "ocean", "seed": 36,
        "logos": [("pasek/wzory.svg", "Gotowe wzory planu")],
        "title": "Gotowe wzory planu",
        "lead": "Sprawdzone przebiegi pracy z kilku kroków. Wybierasz wzór, ustawiasz godzinę, a agent łączy potrzebne wtyczki w jeden ciąg zadań.",
        "services": [
            ("Poranny przegląd, 08:00", "Skrzynka Gmail, dzisiejsze spotkania z Kalendarza Google i plan dnia w pięciu punktach."),
            ("Publikacja w mediach społecznościowych", "Post w wersji na X, LinkedIn i Facebooka, potem publikacja na każdej platformie po twojej zgodzie."),
            ("Odpowiedzi na wiadomości", "Wiadomości z Gmaila, prywatne rozmowy na Discordzie i Messenger. Każda odpowiedź czeka na zatwierdzenie."),
            ("Pilnowanie ceny, 09:00", "Cena produktu zapisywana z datą w pliku ceny.md i porównanie z poprzednimi wpisami."),
            ("Tygodniowy porządek", "Folder Pobrane, raport z projektu i zapis raportu na Dysku Google."),
            ("Film na YouTube", "Tytuł, opis i tagi, pomysł na miniaturę oraz zapowiedź na X i Discordzie."),
        ],
        "services_title": "Sześć gotowych wzorów",
        "tasks": [
            "Włącz Poranny przegląd codziennie o 08:00.",
            "Użyj wzoru Publikacja i przygotuj post o nowej wersji na trzy platformy.",
            "Dodaj do Pilnowania ceny drugi produkt i porównuj oba.",
            "Zmień Tygodniowy porządek tak, żeby raport szedł do innego folderu.",
        ],
        "together": None,
        "start": [
            "Otwórz plan w LumoBocie i wybierz gotowy wzór, na przykład Poranny przegląd.",
            "Ustaw godzinę i to, jak często wzór ma ruszać. Możesz dopisać własne kroki.",
            "Podłącz konta, których wzór potrzebuje, i potwierdź.",
        ],
        "links": [],
        "related": ["google", "slack-discord"],
        "faq": [
            ("Czy wzór sam coś opublikuje o zadanej godzinie?", "Nie. Godzina uruchamia przygotowanie, a nie wysyłkę. Przed wysłaniem albo publikacją agent pokazuje gotową treść i czeka na wyraźną zgodę."),
            ("Czy mogę zmienić wzór na swój?", "Tak. Wzór to punkt startu: dopisujesz kroki, zmieniasz godzinę i konta."),
            ("Co, jeśli komputer będzie wtedy wyłączony?", "Plan działa na twoim komputerze, więc komputer musi być włączony. LumoBot pilnuje, żeby nie zasnął w trakcie zadania."),
            ("Jak pilnowanie ceny pokazuje zmiany?", "Każdy pomiar trafia z datą do pliku ceny.md, a agent porównuje go z poprzednimi. Od razu widzisz, kiedy cena spadła."),
            ("Ile to kosztuje?", "LumoBot kosztuje 0 zł, a wzory są w cenie."),
        ],
    },
]

TITLES = {p["slug"]: p["title"] for p in PAGES}


def faq(items):
    out = []
    for q, a in items:
        out.append(f'          <details class="fq-item">\n            <summary class="fq-q"><span>{escape(q)}</span>{CHEV}</summary>\n'
                    f'            <div class="fq-a"><p>{escape(a)}</p></div>\n          </details>')
    return "\n".join(out)


def page(p):
    logos = "\n".join(f'      <span class="pj-me"><img src="img/{src}" alt="{escape(alt)}"></span>' for src, alt in p["logos"])
    services = "\n".join(f'        <h3>{escape(n)}</h3>\n        <p>{escape(t)}</p>' for n, t in p["services"])
    tasks = "\n".join(f"          <li>„{escape(t)}”</li>" for t in p["tasks"])
    start = "\n".join(f"          <li>{escape(t)}</li>" for t in p["start"])
    safe = "\n".join(f'        <h3>{escape(n)}</h3>\n        <p>{escape(t)}</p>' for n, t in SAFE)
    together = ""
    if p["together"]:
        n, t = p["together"]
        together = f'\n      <section class="wt-sec">\n        <h2>Działa razem: {escape(n)}</h2>\n        <p>{escape(t)}</p>\n      </section>\n'
    links = [f'<a href="wtyczka-{s}.html">{escape(TITLES[s])}</a>' for s in p["related"]]
    links += ['<a href="wtyczki.html">Wszystkie 64 połączenia</a>']
    ext = "".join(f'\n          <li><a href="{u}" target="_blank" rel="noopener noreferrer">{escape(n)}</a><span> strona usługi</span></li>' for n, u in p["links"])
    inner = "".join(f"\n          <li>{l}</li>" for l in links)
    return f'''<section class="dark spo-section vs-page wt-page">
  <div class="wrap spo-wrap">
    <div class="vs-hero-art pj-art" data-pal="{p["pal"]}" data-seed="{p["seed"]}">
{logos}
    </div>
    <div class="vs-top">
      <a class="vs-crumb" href="wtyczki.html"><span aria-hidden="true">‹ </span>Wszystkie wtyczki</a>
      <div class="pg-head">
        <h1 class="display vs-title">{escape(p["title"])}</h1>
      </div>
      <p class="vs-lead">{escape(p["lead"])}</p>
    </div>
    <article class="wt-doc">

      <section class="wt-sec">
        <h2>{escape(p.get("services_title", "Co potrafi"))}</h2>
{services}
      </section>

      <section class="wt-sec">
        <h2>Przykładowe zadania</h2>
        <p>Piszesz zwykłym zdaniem w czacie LumoBota, na przykład:</p>
        <ul class="wt-dash">
{tasks}
        </ul>
      </section>
{together}
      <section class="wt-sec">
        <h2>Bezpieczeństwo</h2>
{safe}
      </section>

      <section class="wt-sec">
        <h2>Jak zacząć</h2>
        <ol class="wt-num">
{start}
        </ol>
      </section>

      <section class="wt-sec">
        <h2>Linki</h2>
        <ul class="wt-links">{inner}{ext}
        </ul>
      </section>
    </article>

    <section class="wt-faq" id="pytania">
      <div class="fq-grid">
        <div class="fq-head">
          <h2 class="title fq-title">Pytania</h2>
          <p class="fq-lead">Logujesz się sam, agent nie zna hasła i pyta o zgodę, zanim cokolwiek wyśle.</p>
          <a class="fq-all" href="wtyczki.html">Wszystkie wtyczki ›</a>
        </div>
        <div class="fq-list">
{faq(p["faq"])}
        </div>
      </div>
    </section>
  </div>
</section>
<script>
(function(){{
  const run = () => {{ if(!window.lumoGrain) return;
    document.querySelectorAll('.pj-art').forEach(box => {{ let seen = false;
      new IntersectionObserver(es => {{ seen = es[0].isIntersecting; if(seen) window.lumoGrain.wake(); }}).observe(box);
      window.lumoGrain.add(box, () => seen, +box.dataset.seed, box.dataset.pal); }}); }};
  document.readyState === 'complete' ? run() : addEventListener('load', run);
}})();
</script>
'''


def main():
    for p in PAGES:
        f = OUT / f"strona-wtyczka-{p['slug']}.html"
        f.write_text(page(p), encoding="utf-8", newline="\n")
        print("zapisano", f.name)


if __name__ == "__main__":
    main()
