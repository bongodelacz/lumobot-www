"""Podmienia logo LumoBota na stronie na podstawie jednego pliku źródłowego.

Uruchom:  python narzedzia/nowe_logo.py [ścieżka do nowego logo PNG z przezroczystością]
Tworzy: img/logo.png (256), img/app.png (512, także ikona karty), kopie w app/ i ui/,
warstwy animacji img/logo-cialo.png (ciało z uśmiechem, bez oczu) i img/logo-oczy.png (same oczy),
oraz podmienia logo na obrazku udostępniania img/og.png. Stare pliki kopiuje do .lumobot/kopie/logo-stare/.
"""
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

PROJ = Path(__file__).resolve().parent.parent
ROOT = PROJ / "strona"
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else PROJ / ".lumobot" / "zalaczniki" / "new.lumobot.logo.png"
BACKUP = PROJ / ".lumobot" / "kopie" / "logo-stare"


def square(im: Image.Image) -> Image.Image:
    """Przycina do treści (kanał alfa) i dopełnia do kwadratu, żeby logo wypełniało kafelek jak stare."""
    im = im.convert("RGBA")
    box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    im = im.crop(box)
    side = max(im.size)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    return out


def layers(im: Image.Image):
    """Rozdziela logo 512 px na ciało (z uśmiechem, oczy zamalowane kolorem ciała) i same oczy."""
    r, g, b, a = im.split()
    white = ImageChops.darker(ImageChops.darker(r, g), b).point(lambda v: 255 if v > 150 else 0)
    white = ImageChops.multiply(white, a.point(lambda v: 255 if v > 200 else 0))
    eyes_zone = Image.new("L", im.size, 0)
    eyes_zone.paste(255, (0, 0, im.width, int(im.height * 0.70)))          # uśmiech leży niżej i zostaje w ciele
    mask = ImageChops.multiply(white, eyes_zone)
    grow = mask.filter(ImageFilter.MaxFilter(9))                           # z zapasem na cień wokół oczu
    soft = grow.filter(ImageFilter.GaussianBlur(1.2))
    # ciało: w miejscu oczu kolor uśredniony z otoczenia (rozmycie liczone tylko z pikseli poza oczami)
    keep = ImageChops.invert(grow)
    rgb = im.convert("RGB")
    num = Image.composite(rgb, Image.new("RGB", im.size, 0), keep).filter(ImageFilter.GaussianBlur(26))
    den = keep.filter(ImageFilter.GaussianBlur(26))
    fill = Image.merge("RGB", [ImageChops.multiply(c, Image.new("L", im.size, 255)).point(lambda v: v) for c in num.split()])
    px_f, px_d = fill.load(), den.load()
    for y in range(im.height):
        for x in range(im.width):
            d = px_d[x, y]
            if d:
                p = px_f[x, y]
                px_f[x, y] = (min(255, p[0] * 255 // d), min(255, p[1] * 255 // d), min(255, p[2] * 255 // d))
    body_rgb = Image.composite(fill, rgb, soft)
    body = body_rgb.convert("RGBA")
    body.putalpha(a)
    eyes = im.copy()
    eyes.putalpha(ImageChops.multiply(soft, a))
    return body, eyes


def save(im: Image.Image, rel: str):
    f = ROOT / rel
    if f.exists():
        BACKUP.mkdir(parents=True, exist_ok=True)
        keep = BACKUP / rel.replace("/", "_")
        if not keep.exists():
            shutil.copy2(f, keep)
    f.parent.mkdir(parents=True, exist_ok=True)
    im.save(f, optimize=True)
    print("zapisano", rel, im.size)


def main():
    if not SRC.is_file():
        sys.exit(f"Nie ma pliku z nowym logo: {SRC}")
    sq = square(Image.open(SRC))
    big = sq.resize((512, 512), Image.LANCZOS)
    small = sq.resize((256, 256), Image.LANCZOS)
    for d in ("img", "app", "ui"):
        if (ROOT / d).is_dir():
            save(small, f"{d}/logo.png")
            save(big, f"{d}/app.png")
    body, eyes = layers(big)
    save(body, "img/logo-cialo.png")
    save(eyes, "img/logo-oczy.png")
    og = ROOT / "img" / "og.png"
    if og.is_file():
        card = Image.open(og).convert("RGB")
        size, cx, cy = 384, 964, 312                                        # miejsce starego logo na karcie 1200x630
        mark = sq.resize((size, size), Image.LANCZOS)
        card.paste(mark, (cx - size // 2, cy - size // 2), mark)
        save(card, "img/og.png")


if __name__ == "__main__":
    main()
