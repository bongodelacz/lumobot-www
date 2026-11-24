"""Wycina elementy z wyrenderowanego DOM-u aplikacji LumoBot (zrzut z przeglądarki bez głowy)."""
import re

VOID = {"img", "input", "br", "hr", "meta", "link", "source", "wbr", "area", "col", "embed", "track", "base"}
TAG = re.compile(r"<(/?)([a-zA-Z][\w-]*)([^>]*?)(/?)>|<!--[\s\S]*?-->")


def element(html: str, start: int) -> str:
    """Zwraca cały element HTML zaczynający się na pozycji start (znak '<')."""
    depth = 0
    for m in TAG.finditer(html, start):
        if m.group(0).startswith("<!--"):
            continue
        close, name, selfclose = m.group(1), m.group(2).lower(), m.group(4)
        if close:
            depth -= 1
        elif name not in VOID and not selfclose:
            depth += 1
        if depth == 0:
            return html[start:m.end()]
    raise ValueError("niedomknięty element")


def by(html: str, needle: str) -> str:
    """Element, którego znacznik otwierający zawiera needle (np. 'id="chat"')."""
    i = html.index(needle)
    return element(html, html.rindex("<", 0, i))


def compact(h: str) -> str:
    h = re.sub(r"<svg[\s\S]*?</svg>", "<svg/>", h)
    h = re.sub(r'<span class="face[\s\S]*?</i></i></span>', "<FACE/>", h)
    return h
