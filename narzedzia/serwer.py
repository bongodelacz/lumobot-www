"""Serwer podglądu strony LumoBota: http://127.0.0.1:8790 (folder strona/).
Wielowątkowy, z długą kolejką połączeń, bo stronę naraz otwiera kilku agentów i przeglądarka ładuje dziesiątki buziek."""
import functools
import http.server
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "strona"


class Serwer(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True


class Obsluga(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):  # cisza w konsoli
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    Serwer(("127.0.0.1", 8790), functools.partial(Obsluga, directory=str(ROOT))).serve_forever()
