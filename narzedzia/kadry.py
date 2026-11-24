"""Wycina kadry z prawdziwego okna LumoBota (zrzuty z strona/app) do strona/img/kadry/.
Uruchom: python narzedzia/kadry.py <zrzut_pracy> <zrzut_koniec> <zrzut_neuro> <zrzut_ai> <zrzut_limity> <zrzut_umiejetnosci>"""
import sys
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "strona" / "img" / "kadry"
# nazwa: (indeks zrzutu z argumentów, ramka x0, y0, x1, y1) w zrzucie 1344x880
CUTS = {
    "zespol": (0, 470, 168, 1160, 770),
    "skutek": (1, 450, 205, 1170, 765),
    "neuro": (2, 455, 40, 1165, 776),
    "modele": (3, 202, 100, 1143, 780),
    "bezpieczniki": (4, 202, 100, 1143, 780),
    "umiejetnosci": (5, 202, 100, 1143, 780),
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    src = sys.argv[1:]
    for name, (i, *box) in CUTS.items():
        Image.open(src[i]).convert("RGB").crop(tuple(box)).save(OUT / f"{name}.png", optimize=True)
        print("zapisano", name)
