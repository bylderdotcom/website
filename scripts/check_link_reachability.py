#!/usr/bin/env python3
"""
Crawl-simulatie: BFS vanaf de homepage over interne links in web/out.
Meet per cluster: bereikbaarheid, klikdiepte-verdeling, aantal wees-pagina's.
Lazy parsing: alleen bezochte pagina's worden gelezen (geheugen-licht).
"""
import re, sys
from collections import deque, defaultdict
from pathlib import Path

OUT = Path("/Users/danielpaaij/Documents/GitHub/website/web/out")
HREF = re.compile(r'href="(/[^"#?]*)["#?]')

def norm(path: str) -> str | None:
    """Normaliseer een interne href naar een bestaands-relatief pad ('' = home)."""
    p = path.strip()
    if not p.startswith("/"):
        return None
    p = p.strip("/")
    if p.endswith(".html"):
        p = p[:-len("index.html")].strip("/") if p.endswith("index.html") else None
        if p is None:
            return None
    elif "." in p.split("/")[-1]:
        return None  # assets, xml, txt
    return p

def page_file(slug: str) -> Path:
    return OUT / slug / "index.html" if slug else OUT / "index.html"

# Alle bestaande pagina's inventariseren
all_pages = set()
for f in OUT.rglob("index.html"):
    all_pages.add(str(f.parent.relative_to(OUT)).replace("\\", "/").strip("./") if f.parent != OUT else "")
all_pages = {p if p != "." else "" for p in all_pages}
print(f"pagina's op schijf: {len(all_pages)}", file=sys.stderr)

depth = {"": 0}
q = deque([""])
while q:
    slug = q.popleft()
    d = depth[slug]
    try:
        html = page_file(slug).read_text(errors="ignore")
    except OSError:
        continue
    for m in HREF.finditer(html):
        t = norm(m.group(1))
        if t is None or t in depth or t not in all_pages:
            continue
        depth[t] = d + 1
        q.append(t)

def cluster_of(slug: str) -> str:
    return slug.split("/")[0] if slug else "(home)"

stats = defaultdict(lambda: {"total": 0, "reach": 0, "depths": defaultdict(int), "maxd": 0, "sumd": 0})
for p in all_pages:
    c = cluster_of(p)
    s = stats[c]
    s["total"] += 1
    if p in depth:
        d = depth[p]
        s["reach"] += 1
        s["depths"][d] += 1
        s["sumd"] += d
        s["maxd"] = max(s["maxd"], d)

print(f"\nBFS-bereikbaar vanaf homepage: {len(depth)} van {len(all_pages)} ({len(depth)/len(all_pages)*100:.1f}%)")
print(f"\n{'cluster':<24}{'totaal':>8}{'bereikb':>9}{'wees':>8}{'gem.diepte':>11}{'max':>5}   diepte-histogram (d:n)")
for c, s in sorted(stats.items(), key=lambda kv: -(kv[1]['total'] - kv[1]['reach'])):
    if s["total"] < 10 and s["total"] - s["reach"] == 0:
        continue
    orphan = s["total"] - s["reach"]
    avg = s["sumd"] / s["reach"] if s["reach"] else 0
    hist = " ".join(f"{d}:{n}" for d, n in sorted(s["depths"].items()))
    print(f"{c:<24}{s['total']:>8}{s['reach']:>9}{orphan:>8}{avg:>11.1f}{s['maxd']:>5}   {hist[:70]}")

# Voorbeelden van wezen per groot cluster
print("\n--- voorbeeld-wezen per cluster (max 3) ---")
by_cluster_orphans = defaultdict(list)
for p in all_pages - set(depth):
    by_cluster_orphans[cluster_of(p)].append(p)
for c, lst in sorted(by_cluster_orphans.items(), key=lambda kv: -len(kv[1]))[:12]:
    print(f"{c} ({len(lst)}): {sorted(lst)[:3]}")
