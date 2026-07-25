#!/usr/bin/env python3
"""Zet reports/nieuwe-projecten.json om in een markdown-tabel voor het GitHub-issue.
Los script (geen heredoc in de workflow-YAML — die breekt op indentatie)."""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DREMPEL = 60

def main():
    pad = os.path.join(ROOT, "reports", "nieuwe-projecten.json")
    if not os.path.exists(pad):
        print("_Geen rapport gevonden._"); return
    r = json.load(open(pad, encoding="utf-8"))
    k = [x for x in r.get("kandidaten", []) if x.get("score", 0) >= DREMPEL]
    if not k:
        print(f"_{r.get('nieuw', 0)} nieuwe projecten gevonden, maar geen enkele haalde "
              f"de drempel van {DREMPEL} — te weinig eigen substantie voor een pagina._")
        return
    print("| Score | Project | Plaats | Woningen | Status | Oplevering |")
    print("|---|---|---|---|---|---|")
    for x in k[:25]:
        print(f"| {x['score']} | [{x['naam']}]({x['url']}) | {x['plaats']} | "
              f"{x.get('woningen') or '?'} | {x.get('status') or '?'} | {x.get('oplevering') or '?'} |")
    if len(k) > 25:
        print(f"\n_…en {len(k) - 25} meer (zie het rapport-artifact)._")

if __name__ == "__main__":
    main()
