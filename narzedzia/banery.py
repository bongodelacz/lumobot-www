"""Banery 1:1 (jak na stronach vs) dla stron, które ich nie miały: /ai/, /cennik/, /funkcje/ i 4 artykuły.

Pisze strona/czesci/baner-<strona>.html. Uruchom:  python narzedzia/banery.py, potem narzedzia/zloz.py
"""
from html import escape
from pathlib import Path

C = Path(__file__).resolve().parent.parent / "strona" / "czesci"

BANERY = {
    "ai": ("lagoon", 51, "index.html", "Strona główna", "Świat AI",
           "Teksty o zasadach, na których stoi LumoBot: co obiecujemy, co z tego wynika i gdzie są uczciwe granice."),
    "cennik": ("ember", 52, "index.html", "Strona główna", "Cennik",
               "Prywatnie LumoBot kosztuje 0 zł. W firmie jest za darmo do 30 grudnia 2026, potem praca komercyjna wymaga licencji."),
    "funkcje": ("rose", 53, "index.html", "Strona główna", "Osiem sposobów, żeby dowieźć cel",
                "LumoBot pracuje w twoim folderze, korzysta z własnych narzędzi i wraca dopiero wtedy, gdy wynik przejdzie sprawdzenie."),
    "nowosc-gotowe-znaczy-sprawdzone": ("lagoon", 41, "ai.html", "Świat AI", "Gotowe znaczy sprawdzone",
        "Agent AI potrafi napisać „zrobione” po każdym zadaniu. LumoBot nie pisze tego słowa, dopóki ktoś inny niż autor nie sprawdzi wyniku."),
    "nowosc-haslo-zostaje-u-ciebie": ("rose", 42, "ai.html", "Świat AI", "Agent nie musi znać twojego hasła",
        "Żeby agent coś zrobił na twoim koncie, nie musi wiedzieć, jak się do niego logujesz. W LumoBocie hasło wpisujesz ty, a agent pracuje dopiero na gotowej sesji."),
    "nowosc-zespol-nie-solista": ("forest", 43, "ai.html", "Świat AI", "Jeden agent to za mało",
        "Jeden model, który planuje, pisze, buduje i sam się ocenia, przypomina firmę zatrudniającą jedną osobę. LumoBot dzieli tę pracę na role."),
    "nowosc-twoj-plan-nasz-program": ("ember", 44, "ai.html", "Świat AI", "Płacisz za AI raz, nie dwa razy",
        "Masz już plan Claude albo ChatGPT. LumoBot nie dokłada do niego drugiego abonamentu, tylko pracuje na tym, za co już płacisz."),
    "firmy": ("forest", 61, "index.html", "Strona główna", "LumoBot dla firm",
              "Do 30 grudnia 2026 LumoBot jest za darmo także w pracy. Od 31 grudnia 2026 praca komercyjna wymaga licencji."),
    "status": ("ocean", 62, "index.html", "Strona główna", "Status",
               "LumoBot działa na twoim komputerze, więc nie ma serwerów, które mogłyby paść. Tu sprawdzisz wersję i usługi, z których korzysta."),
    "dokumentacja": ("violet", 63, "index.html", "Strona główna", "Dokumentacja",
                     "Wszystko, co trzeba wiedzieć, żeby zacząć: instalacja, pierwsze zadanie, zespół, modele, wtyczki i bezpieczeństwo."),
    "o-nas": ("rose", 64, "index.html", "Strona główna", "O nas",
              "Budujemy LumoBota: zespół agentów AI, który pracuje na twoim komputerze i oddaje wynik dopiero po sprawdzeniu."),
}


def baner(name, pal, seed, back, back_txt, title, lead):
    return f'''<section class="dark spo-section vs-page bn-page" aria-labelledby="bn-{name}-h1">
  <div class="wrap spo-wrap">
    <div class="vs-hero-art pj-art" data-pal="{pal}" data-seed="{seed}">
      <span class="pj-me"><img src="img/logo.png" alt="LumoBot"></span>
    </div>
    <div class="vs-top">
      <a class="vs-crumb" href="{back}"><span aria-hidden="true">‹ </span>{escape(back_txt)}</a>
      <div class="pg-head">
        <h1 class="display vs-title" id="bn-{name}-h1">{escape(title)}</h1>
      </div>
      <p class="vs-lead">{escape(lead)}</p>
    </div>
  </div>
</section>
'''


def main():
    for name, args in BANERY.items():
        (C / f"baner-{name}.html").write_text(baner(name, *args), encoding="utf-8", newline="\n")
    print("zapisano banery:", ", ".join(BANERY))


if __name__ == "__main__":
    main()
