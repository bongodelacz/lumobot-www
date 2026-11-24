"""Wyrównuje tło grafik do koloru strony #0a0a0a: ciemne piksele tła i cienia dostają dokładnie kolor strony,
z łagodnym przejściem, żeby obiekty się nie postrzępiły. Uruchom: python narzedzia/wyrownaj_tlo.py strona/img/funkcje/*.png"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

BG = np.array([10, 10, 10], dtype=np.float32)
LO, HI = 36.0, 58.0   # poniżej LO: czyste tło; między LO a HI: płynne przejście; powyżej HI: obiekt bez zmian

for name in sys.argv[1:]:
    for f in Path().glob(name) if any(c in name for c in "*?") else [Path(name)]:
        im = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
        v = im.max(axis=2, keepdims=True)
        t = np.clip((v - LO) / (HI - LO), 0, 1)
        out = BG * (1 - t) + im * t
        Image.fromarray(out.round().astype(np.uint8)).save(f)
        print("wyrównano", f)
