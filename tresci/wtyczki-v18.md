# Wtyczki LumoBota: teksty podstron

## wtyczka-google: Gmail i Kalendarz Google

Lead: LumoBot czyta Twoją pocztę Gmail i Kalendarz Google. Może przygotować plan dnia albo odpowiedzi, ale wysyła je dopiero po Twojej zgodzie.

Jak LumoBot ich używa:
- Przejrzyj pocztę z rana i zrób listę spraw na dziś.
- Sprawdź, czy w tym tygodniu nie masz dwóch spotkań w tym samym czasie.
- Napisz szkic odpowiedzi na maila od klienta i pokaż mi go przed wysłaniem.
- Znajdź w kalendarzu termin z wiadomości, którą dostałem wczoraj.

Jak zacząć:
1. Otwórz Ustawienia > Połączenia i kliknij Połącz przy Gmailu oraz Kalendarzu Google.
2. Zaloguj się sam w przeglądarce agenta. LumoBot nie zna Twojego hasła.
3. Napisz w czacie zadanie, na przykład: "Przejrzyj pocztę z dzisiaj i zrób listę spraw".

Pytania:

### Pytanie: Czy LumoBot widzi moje hasło do Gmaila?
Nie. Logujesz się sam w przeglądarce agenta, a LumoBot pracuje na gotowej sesji. Hasła nie zna i nie zapisuje go w swoich ustawieniach.

### Pytanie: Czy LumoBot wyśle maila bez mojej wiedzy?
Nie. Przed wysłaniem pokazuje gotową treść i pyta o zgodę. Dopiero po Twoim "tak" wiadomość idzie dalej.

### Pytanie: Czy mogę poprosić o przegląd skrzynki każdego dnia rano?
Tak. Możesz ustawić gotowy wzór "Poranny przegląd" o 08:00. LumoBot przejrzy pocztę i dzisiejsze spotkania, a potem ułoży plan dnia w pięciu punktach.

### Pytanie: Czy LumoBot działa na moim komputerze, a nie na obcym serwerze?
LumoBot pracuje lokalnie, na Twoim komputerze. Połączenie z kontem Google zakładasz sam, w swojej przeglądarce.

### Pytanie: Ile kosztuje korzystanie z tej wtyczki?
Aplikacja LumoBot kosztuje 0 zł. Połączenie z Gmailem i Kalendarzem Google też jest w niej bez dodatkowej opłaty.

## wtyczka-notion-dysk: Notion i Dysk Google

Lead: LumoBot zagląda do Twoich notatek w Notion i plików na Dysku Google. Może zapisać raport w dokumencie albo zrobić porządek w folderach.

Jak LumoBot ich używa:
- Znajdź w Notion notatki z ostatniego tygodnia i zrób z nich krótkie podsumowanie.
- Zapisz gotowy raport z projektu na Dysku Google w wybranym folderze.
- Przejrzyj pliki w Dysku i wypisz te, które są stare i zajmują dużo miejsca.
- Przejrzyj stronę z planem w Notion i powiedz, co jest zaległe.

Jak zacząć:
1. Otwórz Ustawienia > Połączenia i kliknij Połącz przy Notion, a potem przy Dysku Google.
2. Zaloguj się sam w przeglądarce agenta. Hasła nie podajesz LumoBotowi.
3. Napisz zadanie w czacie, na przykład: "Zapisz podsumowanie tygodnia w Notion".

Pytania:

### Pytanie: Czy LumoBot może sam zmienić coś w moich plikach?
Przed wysłaniem albo publikacją pokazuje gotową treść i czeka na Twoją zgodę. Ostatnie słowo zawsze należy do Ciebie.

### Pytanie: Co się stanie z moim hasłem do Notion?
Nic, bo LumoBot go nie zna. Logujesz się sam w przeglądarce agenta, a agent korzysta z tej gotowej sesji.

### Pytanie: Czy mogę zapisywać wyniki pracy agenta w Notion?
Tak. Agent może przygotować treść i zapisać ją w Notion albo na Dysku Google, po Twojej akceptacji. Gotowy wzór "Tygodniowy porządek" robi to co tydzień.

### Pytanie: Czy LumoBot wysyła moje pliki do obcego serwera?
LumoBot pracuje lokalnie, na Twoim komputerze. Dane z Dysku i Notion trafiają do agenta tylko wtedy, gdy o nie prosisz.

### Pytanie: Ile kosztuje ta wtyczka?
Aplikacja LumoBot kosztuje 0 zł. Połączenia z Notion i Dyskiem Google też nie wymagają opłaty w LumoBocie.

## wtyczka-przegladarka: Przeglądarka Playwright (i dokumentacja, Context7)

Lead: LumoBot potrafi sam obsłużyć prawdziwą przeglądarkę: wejść na stronę, wypełnić formularz, otworzyć kilka kart. Potrafi też sprawdzić aktualną dokumentację bibliotek, żeby nie pisał kodu z pamięci.

Jak LumoBot ich używa:
- Wejdź na stronę zamówień, sprawdź status paczki i zapisz go w notatce.
- Wypełnij formularz zgłoszenia według mojego opisu, ale nie wysyłaj go bez mojego "tak".
- Sprawdź w aktualnej dokumentacji, jak działa dana funkcja biblioteki, zanim napiszesz kod.
- Otwórz kilka stron naraz i porównaj ich treść.

Jak zacząć:
1. Włącz wtyczkę Przeglądarka Playwright. Przy pierwszym użyciu LumoBot pobierze ją sam.
2. Jeśli strona wymaga logowania, zaloguj się sam w przeglądarce agenta.
3. Napisz zadanie w czacie, na przykład: "Sprawdź w dokumentacji, jak działa ta funkcja, i napisz przykład".

Pytania:

### Pytanie: Czy LumoBot zna moje hasła do stron, na których się loguje?
Nie. Logujesz się sam, a LumoBot korzysta z gotowej sesji. Hasła nie zna i nie prosi o nie w czacie.

### Pytanie: Czy LumoBot kliknie "Zapłać" bez pytania?
Nie. Przed płatnością, wysyłką albo publikacją pokazuje, co zrobi, i czeka na Twoją zgodę.

### Pytanie: Po co mi dokumentacja, skoro mam LumoBota?
LumoBot sprawdza aktualne dokumentacje bibliotek i frameworków, więc kod nie jest oparty na starej wiedzy. Dzięki temu rzadziej dostajesz przestarzałe przykłady.

### Pytanie: Czy przeglądarka działa na moim komputerze?
Tak. LumoBot pracuje lokalnie, a przeglądarka uruchamia się na Twoim komputerze, nie na zewnętrznym serwerze.

### Pytanie: Ile kosztuje używanie przeglądarki w LumoBocie?
Aplikacja LumoBot kosztuje 0 zł. Przeglądarka Playwright pobiera się sama przy pierwszym użyciu.

## wtyczka-slack-discord: Slack i Discord

Lead: LumoBot łączy się z Twoimi komunikatorami, Slackiem i Discordem. Może przejrzeć wiadomości i przygotować odpowiedź, ale nic nie wyśle bez Twojej zgody.

Jak LumoBot ich używa:
- Przejrzyj nieprzeczytane wiadomości w Slacku i zrób listę tego, co wymaga odpowiedzi.
- Przeczytaj prywatne wiadomości na Discordzie i przygotuj szkice odpowiedzi.
- Przejrzyj wiadomości z ostatniego tygodnia i wypisz pytania, na które nikt jeszcze nie odpowiedział.
- Napisz krótką zapowiedź na Discordzie, a przed publikacją pokaż mi tekst.

Jak zacząć:
1. Otwórz Ustawienia > Połączenia i kliknij Połącz przy Slacku, a potem przy Discordzie.
2. Zaloguj się sam w przeglądarce agenta. LumoBot nie zna hasła.
3. Napisz zadanie w czacie, na przykład: "Przejrzyj Slacka i powiedz, na co muszę dziś odpowiedzieć".

Pytania:

### Pytanie: Czy LumoBot może wysłać wiadomość na Slacku za mnie?
Może przygotować treść, ale najpierw pokazuje ją Tobie i pyta o zgodę. Bez Twojego "tak" nic nie idzie do rozmówcy.

### Pytanie: Czy LumoBot widzi moje hasło do Discorda?
Nie. Logujesz się sam w przeglądarce agenta, a agent korzysta z gotowej sesji.

### Pytanie: Czy mogę odpowiadać na wiadomości z gotowego wzoru planu?
Tak. Wzór "Odpowiedzi na wiadomości" zbiera wiadomości z Gmaila, prywatnych rozmów na Discordzie i Messengera. Każdą odpowiedź pokazuje Tobie przed wysłaniem.

### Pytanie: Czy LumoBot działa lokalnie, a nie na cudzym serwerze?
Tak. LumoBot pracuje na Twoim komputerze. Połączenie z kontem zakładasz sam, w swojej przeglądarce.

### Pytanie: Ile kosztuje ta wtyczka?
Aplikacja LumoBot kosztuje 0 zł. Połączenia ze Slackiem i Discordem też są w niej bez opłaty.

## wtyczka-github-figma: GitHub i Figma

Lead: LumoBot pomaga w pracy nad kodem i projektem. Czyta repozytoria, zgłoszenia i pull requesty na GitHubie oraz układy, kolory i komponenty z Figmy.

Jak LumoBot ich używa:
- Przejrzyj otwarte zgłoszenia w repozytorium i wypisz te, które są pilne.
- Przygotuj opis pull requesta na podstawie zmian, a publikację zostaw mnie do zatwierdzenia.
- Odczytaj z Figmy kolory i odstępy z projektu, żeby strona wyglądała tak jak makieta.
- Przeczytaj w Figmie układ strony i powiedz, jakie kolory w niej użyto.

Jak zacząć:
1. W Ustawieniach > Połączenia kliknij Połącz przy GitHubie i przy Figmie. Figma wymaga logowania w przeglądarce.
2. Dla GitHuba wpisz osobisty token sam. LumoBot go od Ciebie nie wyciąga.
3. Napisz zadanie w czacie, na przykład: "Wypisz pilne zgłoszenia w moim repozytorium".

Pytania:

### Pytanie: Czy LumoBot zna mój token GitHub?
Token wpisujesz sam, w swoich ustawieniach. LumoBot z niego korzysta, ale nie prosi o niego w czacie.

### Pytanie: Czy LumoBot opublikuje pull request bez mojej zgody?
Nie. Przed publikacją pokazuje treść i czeka na Twoje zatwierdzenie.

### Pytanie: Czy LumoBot zmieni mój projekt w Figmie?
LumoBot czyta projekt z Figmy: układ, kolory i komponenty. Pracuje na odczycie, więc nie edytuje Twojej makiety.

### Pytanie: Czy moje repozytoria zostają na moim komputerze?
LumoBot pracuje lokalnie. Dane z GitHuba i Figmy trafiają do agenta tylko wtedy, gdy o nie prosisz.

### Pytanie: Ile kosztuje ta wtyczka?
Aplikacja LumoBot kosztuje 0 zł. Połączenia z GitHubem i Figmą też są w niej bez opłaty w LumoBocie.

## wtyczka-wzory: Gotowe wzory planu

Lead: Wzory to gotowe plany z kilku kroków, które uruchamiasz o wybranej godzinie. Każdy wzór łączy kilka wtyczek w jeden ciąg zadań.

Jak LumoBot ich używa:
- Poranny przegląd o 08:00: skrzynka Gmail, dzisiejsze spotkania z Kalendarza Google i plan dnia w pięciu punktach.
- Publikacja w mediach społecznościowych: post w wersji na X, LinkedIn i Facebooka, a potem publikacja, po Twojej zgodzie.
- Pilnowanie ceny o 09:00: cena produktu zapisana z datą w pliku ceny.md i porównanie z poprzednimi.
- Film na YouTube: tytuł, opis, tagi i zapowiedź na X oraz Discordzie.

Jak zacząć:
1. Otwórz plan i wybierz gotowy wzór, na przykład "Poranny przegląd".
2. Ustaw godzinę, o której wzór ma ruszyć.
3. Potwierdź. Przy każdej czynności widocznej dla innych LumoBot najpierw czeka na Twoją zgodę.

Pytania:

### Pytanie: Czy wzór sam coś opublikuje o zadanej godzinie?
Nie. Przed wysłaniem albo publikacją agent pokazuje gotową treść i czeka na wyraźną zgodę. Godzina uruchamia przygotowanie, a nie wysyłkę.

### Pytanie: Czy mogę zmienić gotowy wzór na swój?
Tak. Wzór to dobry punkt startu. Możesz dopisać własne kroki i zmienić godzinę.

### Pytanie: Jak LumoBot pilnuje ceny produktu?
Zapisuje cenę z datą w pliku ceny.md i za każdym razem porównuje ją z poprzednimi wpisami. Dzięki temu widzisz, kiedy cena spadła albo wzrosła.

### Pytanie: Czy wzory działają na moim komputerze?
Tak. LumoBot pracuje lokalnie, więc plan z godziną uruchamia się na Twoim komputerze.

### Pytanie: Ile kosztuje korzystanie z gotowych wzorów?
Aplikacja LumoBot kosztuje 0 zł. Wzory są w niej bez dodatkowej opłaty.
