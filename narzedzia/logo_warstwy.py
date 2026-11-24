import numpy as np
from PIL import Image, ImageFilter
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import nowe_logo as nl

def layers(im):
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    h, w = al.shape
    white = (rgb.min(axis=2) > 150) & (al > 200)
    white[int(h * 0.70):] = False
    wm = Image.fromarray((white * 255).astype(np.uint8))
    eye_mask = np.asarray(wm.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
    cover = np.asarray(wm.filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
    # tekstura futra z czystego czoła, kafelkowana
    py, px, ph, pw = int(h*.06), int(w*.30), int(h*.18), int(w*.40)
    patch = rgb[py:py+ph, px:px+pw]
    row = np.concatenate([patch, patch[:, ::-1]], 1); blk = np.concatenate([row, row[::-1]], 0)
    tile = np.tile(blk, (h // (2*ph) + 1, w // (2*pw) + 1, 1))[:h, :w]
    tile = tile / patch.reshape(-1, 3).mean(0)
    # cieniowanie ciała liczone poza oczami: najmniejszy promień, który ma dość pikseli,
    # większe promienie uzupełniają tylko miejsca bez danych (duży promień zostawia plamy przy oczach)
    keep = 1 - np.asarray(wm.filter(ImageFilter.MaxFilter(41))).astype(np.float32) / 255
    def box(x, r, ax):
        x = np.swapaxes(x, 0, ax); pad = np.pad(x, ((r+1, r), (0, 0)), mode="edge")
        c = np.cumsum(pad, 0); return np.swapaxes((c[2*r+1:] - c[:-2*r-1]) / (2*r+1), 0, ax)
    def blur(x, r=24):
        x = x.astype(np.float64)
        for _ in range(3):
            x = box(box(x, r, 0), r, 1)
        return x
    shade = np.zeros_like(rgb)
    done = np.zeros((h, w), bool)
    for r in (16, 32, 64):
        den = blur(keep, r)
        est = np.stack([blur(rgb[..., c] * keep, r) / np.maximum(den, 1e-6) for c in range(3)], -1)
        ok = den > 0.02
        use = ok & ~done
        shade = np.where(use[..., None], est, shade)
        done |= ok
    base = rgb[keep > 0.5].mean(0)
    shade = np.where((blur(keep, 64) > 0.02)[..., None], shade, base)
    fill = np.clip(tile * shade, 0, 255)
    body_rgb = rgb * (1 - cover[..., None]) + fill * cover[..., None]
    body = np.dstack([body_rgb, al]).astype(np.uint8)
    eyes = np.dstack([rgb, al * eye_mask]).astype(np.uint8)
    return Image.fromarray(body, "RGBA"), Image.fromarray(eyes, "RGBA")

nl.layers = layers
src = Image.open(nl.SRC)
big = nl.square(src).resize((512, 512), Image.LANCZOS)
b, e = layers(big)
b.save(nl.ROOT / "img/logo-cialo.png", optimize=True)
e.save(nl.ROOT / "img/logo-oczy.png", optimize=True)
bg = Image.new("RGBA", (1536, 512), (40, 40, 40, 255))
bg.paste(b, (0, 0), b); bg.paste(e, (512, 0), e); bg.paste(b, (1024, 0), b); bg.paste(e, (1024, 0), e)
out = nl.PROJ / ".lumobot" / "zrzuty"
out.mkdir(parents=True, exist_ok=True)
bg.save(out / "warstwy2.png")
print("ok")
