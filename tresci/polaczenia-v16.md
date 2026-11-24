# Połączenia LumoBota: prawdziwe dane z aplikacji (wyciąg Lidera z lumobot/supervisor.py, plugins.py i site/app.js, 19 listopada 2026)

Jak to działa: w Ustawieniach > Połączenia klikasz Połącz, logujesz się SAM w przeglądarce agenta. Agent pracuje na gotowej sesji i nie zna hasła. Przed wysłaniem wiadomości albo publikacją agent pokazuje treść i pyta o zgodę.
Liczba połączeń: 64. Ikony marek (kolor + kształt z aplikacji): strona/img/polaczenia/<id>.svg (56 plików).

## Poczta i kalendarz (6)
- Gmail (id: gmail)
- Outlook (id: outlook)
- Kalendarz Google (id: gcal)
- Microsoft Teams (id: teams)
- Zoom (id: zoom)
- Calendly (id: calendly)

## Pliki i dokumenty (15)
- Dysk Google (id: gdrive)
- Dokumenty Google (id: gdocs)
- Arkusze Google (id: gsheets)
- Dropbox (id: dropbox)
- Notion (id: notion, bez ikony)
- Trello (id: trello)
- GitHub (id: github, bez ikony)
- Figma (id: figma)
- Canva (id: canva)
- OneDrive (id: onedrive)
- Microsoft 365 (id: office)
- Zdjęcia Google (id: gphotos)
- Airtable (id: airtable)
- WordPress (id: wordpress)
- Medium (id: medium, bez ikony)

## Społecznościowe (15)
- X (id: x, bez ikony)
- Facebook (id: facebook)
- Instagram (id: instagram)
- Threads (id: threads, bez ikony)
- LinkedIn (id: linkedin)
- TikTok (id: tiktok, bez ikony)
- YouTube (id: youtube)
- Reddit (id: reddit)
- Pinterest (id: pinterest)
- Twitch (id: twitch)
- Bluesky (id: bluesky)
- Tumblr (id: tumblr)
- Quora (id: quora)
- Substack (id: substack)
- Snapchat (id: snapchat)

## Komunikatory (6)
- Discord (id: discord)
- Slack (id: slack)
- Messenger (id: messenger)
- WhatsApp (id: whatsapp)
- Telegram (id: telegram)
- Skype (id: skype)

## Zakupy i rozrywka (12)
- Allegro (id: allegro)
- Shopify (id: shopify)
- Spotify (id: spotify)
- Steam (id: steam, bez ikony)
- SoundCloud (id: soundcloud)
- Amazon (id: amazon)
- eBay (id: ebay)
- Vinted (id: vinted)
- Booking.com (id: booking)
- Airbnb (id: airbnb)
- Netflix (id: netflix)
- AliExpress (id: aliexpress)

## Praca zespołowa (10)
- Jira i Atlassian (id: jira)
- Asana (id: asana)
- ClickUp (id: clickup)
- Linear (id: linear)
- GitLab (id: gitlab)
- Vercel (id: vercel, bez ikony)
- Netlify (id: netlify)
- Cloudflare (id: cloudflare)
- HubSpot (id: hubspot)
- Mailchimp (id: mailchimp)

## Narzędzia MCP (plugins.py, katalog)
- Higgsfield: obrazy, filmy i reklamy tworzone przez AI. Wymaga konta Higgsfield i logowania w przeglądarce.
- Przeglądarka Playwright: pełne sterowanie prawdziwą przeglądarką: logowanie, formularze, wiele kart. Przy pierwszym użyciu pobiera się sama.
- Dokumentacja Context7: aktualna dokumentacja bibliotek i frameworków, żeby agent nie pisał z pamięci nieaktualnego kodu.
- GitHub: zgłoszenia, pull requesty i repozytoria. Wymaga osobistego tokenu GitHub, który wpisujesz sam.
- Figma: odczyt projektów z Figmy: układ, kolory, komponenty. Wymaga logowania w przeglądarce.

## Umiejętności (plugins.py): Strony i interfejsy, Animacje i ruch, Czysty kod, Testy, Bezpieczeństwo, Teksty po polsku, Szybko i oszczędnie. Przypinasz je agentom, możesz dopisać własne.

## Gotowe wzory planu (supervisor.py, BOARD_TEMPLATES): kilka boxów w ciągu, z godziną
- Poranny przegląd (08:00): przegląd skrzynki Gmail, dzisiejsze spotkania z Kalendarza Google, plan dnia w pięciu punktach.
- Publikacja w mediach społecznościowych: post w wersji na X, LinkedIn i Facebooka, potem publikacja na każdej platformie.
- Odpowiedzi na wiadomości: Gmail, prywatne wiadomości na Discordzie, Messenger.
- Pilnowanie ceny (09:00): cena produktu zapisywana z datą w ceny.md i porównanie z poprzednimi.
- Tygodniowy porządek: folder Pobrane, raport z projektu, zapis raportu na Dysku Google.
- Film na YouTube: tytuł, opis i tagi, pomysł na miniaturę, zapowiedź na X i Discorda.
Zasada stała wzorów: przed wysłaniem, publikacją albo inną czynnością widoczną dla innych agent pokazuje gotową treść i czeka na wyraźną zgodę.
