#!/usr/bin/env python3
# ============================================================================
# UTM-TAGGING van cluster-links naar app.bylder.com.
#
# De app-kant is live (AttributionTracker, first-touch capture, bron per
# betaling in /admin/payments). Zonder tags valt de app terug op de referrer:
# dan is "bylder.com" zichtbaar maar niet het cluster. Deze pass geeft elke
# registratie-link in de cluster-templates en hub-fragmenten
# `utm_source=bylder-site&utm_campaign=<cluster>` mee.
#
# Bewust NIET getagd: Inloggen-links (bestaande gebruikers ≠ acquisitie) en
# claim-links (merchant-funnel, aparte beslissing). Idempotent.
# ============================================================================
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = "https://app.bylder.com/registreer"


def tag(cluster: str) -> int:
    utm = f"?utm_source=bylder-site&amp;utm_campaign={cluster}"
    n = 0
    for base in (ROOT / "templates" / "clusters" / cluster,
                 ROOT / "data" / "clusters" / cluster / "content"):
        if not base.exists():
            continue
        for f in base.rglob("*.html"):
            h = f.read_text()
            if TARGET not in h:
                continue
            h2, count = re.subn(
                rf'{re.escape(TARGET)}(?=["?])', TARGET + utm, h.replace(TARGET + utm, TARGET)
            )
            # her-replace beschermt idempotentie: bestaande tags eerst strippen
            if h2 != h:
                f.write_text(h2)
                n += count
    return n


def main():
    total = 0
    for c in sorted(p.name for p in (ROOT / "templates" / "clusters").iterdir() if p.is_dir()):
        n = tag(c)
        if n:
            print(f"{c}: {n} registratie-links getagd")
        total += n
    print(f"totaal: {total} links")


if __name__ == "__main__":
    main()
