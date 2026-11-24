"""Nagrywa odpowiedzi GET z działającego LumoBota (http://127.0.0.1:8770) do folderu tymczasowego.
Surowe dane zostają poza stroną: na stronę trafiają dopiero po wyczyszczeniu (narzedzia/zbuduj_app.py)."""
import json
import os
import sys
import urllib.request
from pathlib import Path

BASE = "http://127.0.0.1:8770"
OUT = Path(os.environ["TEMP"]) / "lumo-dump" / "api"
GET = ["agents", "models", "super", "settings", "teamconfig", "queue", "plugins", "inbox", "report", "drafts", "update",
       "servers", "memory", "packs", "teamfeed", "schedule", "neuro", "voice/status", "profile", "usage", "orders", "templates", "keys"]


def get(path: str):
    with urllib.request.urlopen(BASE + path, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name in GET:
        try:
            data = get("/api/" + name)
        except Exception as e:  # noqa: BLE001
            print("brak", name, e)
            continue
        (OUT / (name.replace("/", "_") + ".json")).write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print("ok", name, len(json.dumps(data)))
    agents = json.loads((OUT / "agents.json").read_text(encoding="utf-8"))
    agents = agents.get("agents", agents) if isinstance(agents, dict) else agents
    for a in agents:
        try:
            th = get("/api/agents/thread?id=" + a["id"])
            (OUT / f"thread_{a['name']}.json").write_text(json.dumps(th, ensure_ascii=False, indent=1), encoding="utf-8")
            print("ok thread", a["name"], len(json.dumps(th)))
        except Exception as e:  # noqa: BLE001
            print("brak thread", a.get("name"), e)


if __name__ == "__main__":
    sys.exit(main())
