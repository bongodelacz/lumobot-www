"""Scala porcje tłumaczeń od agentów (.lumobot/tl-<język>[-n].json) do strona/i18n/<język>.json.
Istniejące wpisy zostają, nowe dochodzą; zapis zawsze jako poprawny JSON. Na koniec liczy braki względem pl.json.
Uruchom: python narzedzia/scal_tlumaczenia.py"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "strona" / "i18n"
PARTS = ROOT / ".lumobot"


def main():
    keys = json.loads((I18N / "pl.json").read_text(encoding="utf-8"))
    for lang in ("en", "es", "ru"):
        target = I18N / f"{lang}.json"
        data = json.loads(target.read_text(encoding="utf-8"))
        added = 0
        for part in sorted(PARTS.glob(f"tl-{lang}*.json")):
            try:
                chunk = json.loads(part.read_text(encoding="utf-8"))
            except json.JSONDecodeError as e:
                # agent mógł zostawić przecinek na końcu: spróbuj go zdjąć, inaczej pomiń plik
                try:
                    chunk = json.loads(re.sub(r",\s*\}\s*$", "}", part.read_text(encoding="utf-8")))
                except json.JSONDecodeError:
                    print(f"pomijam {part.name}: zły JSON ({e})")
                    continue
            for k, v in chunk.items():
                if isinstance(v, str) and v.strip() and data.get(k) != v:
                    added += k not in data
                    data[k] = v
        target.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
        print(f"{lang}: dodano {added}, brakuje {sum(1 for k in keys if k not in data)} z {len(keys)}")


if __name__ == "__main__":
    main()
