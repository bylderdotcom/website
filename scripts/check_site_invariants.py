#!/usr/bin/env python3
"""Invarianten-checksuite voor de gegenereerde bylder.com-site.

Checks:
  1. sitemap_files      — elke URL in sitemap.xml / en-us-sitemap.xml / vakgebied-sitemaps
                          heeft een bestaand HTML-bestand in de repo.
  2. noindex_in_sitemap — geen pagina met robots-noindex staat in een sitemap.
  3. canonical          — canonical wijst naar https://www.bylder.com + eigen pad.
  4. lang_attr          — <html lang=...> aanwezig; en-us/ = en(-US), rest = nl(-NL).
  5. jsonld             — elk application/ld+json-blok is geldige JSON.
  6. internal_links     — interne hrefs wijzen naar bestaande bestanden
                          (steekproef: homepage + index.html van elke top-level clustermap).

Alleen stdlib. Exit-code 1 bij overtredingen in check 1, 2 of 5 (harde invarianten).
Volledig rapport: reports/site-invariants.json
"""

import json
import os
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from urllib.parse import unquote, urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "https://www.bylder.com"
REPORT_PATH = os.path.join(ROOT, "reports", "site-invariants.json")
EXAMPLES_SHOWN = 20

# Mappen die geen publieke site-content zijn.
EXCLUDE_DIRS = {
    ".git", ".claude", ".github", ".vercel", "node_modules", "__pycache__",
    "output", "_audits", "_og-templates", "_scripts", "data", "scripts",
    "reports", "api", "templates",
}

# Losse template-bestanden in de root (placeholders zoals [Canonical_URL]).
EXCLUDE_FILES = {"template_v2.html"}

RE_LOC = re.compile(r"<loc>\s*(.*?)\s*</loc>", re.I | re.S)
RE_SITEMAP_TAG = re.compile(r"<sitemap>", re.I)
RE_ROBOTS_META = re.compile(
    r"<meta[^>]+name\s*=\s*[\"'](?:robots|googlebot)[\"'][^>]*>", re.I)
RE_CONTENT_ATTR = re.compile(r"content\s*=\s*[\"']([^\"']*)[\"']", re.I)
RE_CANONICAL = re.compile(
    r"<link[^>]+rel\s*=\s*[\"']canonical[\"'][^>]*>", re.I)
RE_HREF_ATTR = re.compile(r"href\s*=\s*[\"']([^\"']*)[\"']", re.I)
RE_HTML_LANG = re.compile(r"<html\b[^>]*\blang\s*=\s*[\"']?([A-Za-z_-]+)", re.I)
RE_JSONLD = re.compile(
    r"<script[^>]+type\s*=\s*[\"']application/ld\+json[\"'][^>]*>(.*?)</script>",
    re.I | re.S)
RE_A_HREF = re.compile(r"<a\b[^>]+href\s*=\s*[\"']([^\"'#]+)[^\"']*[\"']", re.I)


def url_to_candidates(url):
    """Sitemap/href-URL -> mogelijke bestandspaden (relatief aan ROOT)."""
    path = unquote(urlsplit(url).path)
    path = path.lstrip("/")
    if not path:
        return ["index.html"]
    if path.endswith("/"):
        return [path + "index.html"]
    if path.endswith(".html"):
        return [path]
    # /foo zonder slash: zowel foo.html als foo/index.html toestaan
    return [path + "/index.html", path + ".html"]


def resolve_url(url):
    for cand in url_to_candidates(url):
        if os.path.isfile(os.path.join(ROOT, cand)):
            return cand
    return None


def file_to_url_paths(relpath):
    """Bestandspad -> geaccepteerde canonical-paden (trailing-slash-varianten)."""
    rel = relpath.replace(os.sep, "/")
    if rel == "index.html":
        return {"/", ""}
    if rel.endswith("/index.html"):
        base = "/" + rel[: -len("/index.html")]
        return {base, base + "/"}
    base = "/" + rel[: -len(".html")]
    return {"/" + rel, base, base + "/"}


def collect_sitemaps():
    """robots.txt-Sitemap-regels + alle *sitemap*.xml in de root (unie)."""
    names = []
    robots = os.path.join(ROOT, "robots.txt")
    robots_refs = []
    if os.path.isfile(robots):
        with open(robots, encoding="utf-8", errors="replace") as f:
            for line in f:
                if line.lower().startswith("sitemap:"):
                    u = line.split(":", 1)[1].strip()
                    robots_refs.append(os.path.basename(urlsplit(u).path))
    disk = sorted(n for n in os.listdir(ROOT)
                  if n.endswith(".xml") and "sitemap" in n.lower())
    for n in robots_refs + disk:
        if n not in names:
            names.append(n)
    return names, robots_refs, disk


def parse_sitemap(name, seen=None):
    """Geeft lijst (sitemap_naam, url) terug; volgt sitemap-indexen 1 niveau diep."""
    seen = seen or set()
    if name in seen:
        return [], [name + " (cyclisch)"]
    seen.add(name)
    path = os.path.join(ROOT, name)
    if not os.path.isfile(path):
        return [], [name + " (bestand ontbreekt)"]
    with open(path, encoding="utf-8", errors="replace") as f:
        text = f.read()
    locs = RE_LOC.findall(text)
    if RE_SITEMAP_TAG.search(text):  # sitemap-index
        urls, missing = [], []
        for loc in locs:
            sub = os.path.basename(urlsplit(loc).path)
            u, m = parse_sitemap(sub, seen)
            urls.extend(u)
            missing.extend(m)
        return urls, missing
    return [(name, loc) for loc in locs], []


def collect_site_html():
    files = []
    for dirpath, dirs, fs in os.walk(ROOT):
        rel = os.path.relpath(dirpath, ROOT)
        if rel == ".":
            dirs[:] = [d for d in dirs
                       if d not in EXCLUDE_DIRS and not d.startswith(".")]
        else:
            dirs[:] = [d for d in dirs if not d.startswith(".")]
        for f in fs:
            if f.endswith(".html") and not (rel == "." and f in EXCLUDE_FILES):
                p = os.path.join(dirpath, f)
                files.append(os.path.relpath(p, ROOT))
    return files


def scan_file(relpath):
    """Per-bestand: noindex / canonical / lang / json-ld. Draait in worker-proces."""
    out = {"path": relpath, "noindex": False, "canonical": None,
           "lang": None, "jsonld_errors": [], "jsonld_count": 0}
    try:
        with open(os.path.join(ROOT, relpath), encoding="utf-8",
                  errors="replace") as f:
            text = f.read()
    except OSError as e:
        out["read_error"] = str(e)
        return out

    for m in RE_ROBOTS_META.finditer(text):
        c = RE_CONTENT_ATTR.search(m.group(0))
        if c and "noindex" in c.group(1).lower():
            out["noindex"] = True
            break

    m = RE_CANONICAL.search(text)
    if m:
        h = RE_HREF_ATTR.search(m.group(0))
        out["canonical"] = h.group(1).strip() if h else ""

    m = RE_HTML_LANG.search(text)
    if m:
        out["lang"] = m.group(1)
    elif "<html" not in text[:2000].lower() and "<html" not in text.lower():
        out["lang"] = "__fragment__"  # geen <html>-tag: fragment/partial

    for i, block in enumerate(RE_JSONLD.findall(text)):
        out["jsonld_count"] += 1
        try:
            json.loads(block)
        except ValueError as e:
            out["jsonld_errors"].append("blok %d: %s" % (i + 1, str(e)[:120]))
    return out


def is_internal_href(href):
    href = href.strip()
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:",
                                    "data:", "whatsapp:")):
        return None
    if href.startswith("//"):
        return None
    if href.startswith("http"):
        sp = urlsplit(href)
        if sp.netloc.lower() in ("www.bylder.com", "bylder.com"):
            return sp.path or "/"
        return None
    if href.startswith("/"):
        return urlsplit(href).path
    return None  # relatieve links overslaan (steekproef houdt het simpel)


def check_internal_links(sample_files):
    violations = []
    checked_links = 0
    for rel in sample_files:
        try:
            with open(os.path.join(ROOT, rel), encoding="utf-8",
                      errors="replace") as f:
                text = f.read()
        except OSError:
            continue
        seen = set()
        for href in RE_A_HREF.findall(text):
            path = is_internal_href(href)
            if path is None or path in seen:
                continue
            seen.add(path)
            checked_links += 1
            p = unquote(path).lstrip("/")
            if not p:
                continue
            # niet-HTML-assets: direct bestaan checken
            if re.search(r"\.(?!html?)[a-z0-9]{2,5}$", p, re.I):
                if not os.path.isfile(os.path.join(ROOT, p)):
                    violations.append({"page": rel, "href": href})
                continue
            if resolve_url(path) is None:
                violations.append({"page": rel, "href": href})
    return checked_links, violations


def main():
    t0 = time.time()
    report = {"generated": time.strftime("%Y-%m-%dT%H:%M:%S"),
              "root": ROOT, "checks": {}}

    # ---- Check 1: sitemap <-> bestand -------------------------------------
    sitemap_names, robots_refs, disk_sitemaps = collect_sitemaps()
    all_urls, sm_missing_files = [], []
    for name in sitemap_names:
        urls, missing = parse_sitemap(name)
        all_urls.extend(urls)
        sm_missing_files.extend(missing)

    sitemap_url_set = set()
    c1_violations = []
    url_to_file = {}
    for sm_name, url in all_urls:
        sitemap_url_set.add(url.rstrip("/") if url.endswith("/") and
                            urlsplit(url).path != "/" else url)
        sitemap_url_set.add(url)
        f = resolve_url(url)
        if f is None:
            c1_violations.append({"sitemap": sm_name, "url": url})
        else:
            url_to_file[url] = f
    report["checks"]["1_sitemap_files"] = {
        "sitemaps": sitemap_names,
        "sitemaps_in_robots": robots_refs,
        "sitemaps_on_disk_not_in_robots":
            sorted(set(disk_sitemaps) - set(robots_refs)),
        "sitemap_files_missing": sm_missing_files,
        "urls_checked": len(all_urls),
        "violations": len(c1_violations),
        "examples": c1_violations,
    }

    # ---- Site-HTML scannen (basis voor check 2-5) --------------------------
    site_files = collect_site_html()
    workers = max(2, (os.cpu_count() or 4))
    results = []
    with ProcessPoolExecutor(max_workers=workers) as ex:
        for r in ex.map(scan_file, site_files, chunksize=256):
            results.append(r)

    # ---- Check 2: noindex in sitemap ---------------------------------------
    c2 = []
    for r in results:
        if r["noindex"]:
            for p in file_to_url_paths(r["path"]):
                if HOST + p in sitemap_url_set:
                    c2.append({"path": r["path"], "url": HOST + p})
                    break
    report["checks"]["2_noindex_in_sitemap"] = {
        "pages_scanned": len(results),
        "noindex_pages": sum(1 for r in results if r["noindex"]),
        "violations": len(c2),
        "examples": c2,
    }

    # ---- Check 3: canonical -------------------------------------------------
    c3 = []
    with_canonical = 0
    for r in results:
        can = r["canonical"]
        if can is None:
            continue
        with_canonical += 1
        ok_paths = file_to_url_paths(r["path"])
        accepted = {HOST + p for p in ok_paths}
        accepted.add(HOST)  # https://www.bylder.com zonder slash voor root
        if can.rstrip() not in accepted:
            c3.append({"path": r["path"], "canonical": can})
    report["checks"]["3_canonical"] = {
        "pages_with_canonical": with_canonical,
        "violations": len(c3),
        "examples": c3,
    }

    # ---- Check 4: lang-attribuut --------------------------------------------
    c4 = []
    lang_checked = 0
    for r in results:
        lang = r["lang"]
        if lang == "__fragment__":
            continue
        lang_checked += 1
        is_enus = r["path"].replace(os.sep, "/").startswith("en-us/")
        want = "en" if is_enus else "nl"
        if lang is None:
            c4.append({"path": r["path"], "lang": None,
                       "expected": "en-US" if is_enus else "nl-NL"})
        elif not lang.lower().replace("_", "-").startswith(want):
            c4.append({"path": r["path"], "lang": lang,
                       "expected": "en-US" if is_enus else "nl-NL"})
    report["checks"]["4_lang_attr"] = {
        "pages_checked": lang_checked,
        "violations": len(c4),
        "examples": c4,
    }

    # ---- Check 5: JSON-LD ----------------------------------------------------
    c5 = []
    blocks_total = 0
    for r in results:
        blocks_total += r["jsonld_count"]
        for err in r["jsonld_errors"]:
            c5.append({"path": r["path"], "error": err})
    report["checks"]["5_jsonld"] = {
        "blocks_checked": blocks_total,
        "violations": len(c5),
        "examples": c5,
    }

    # ---- Check 6: interne links (steekproef) ---------------------------------
    sample = ["index.html"]
    for d in sorted(os.listdir(ROOT)):
        if d in EXCLUDE_DIRS or d.startswith((".", "_")):
            continue
        idx = os.path.join(d, "index.html")
        if os.path.isfile(os.path.join(ROOT, idx)):
            sample.append(idx)
    links_checked, c6 = check_internal_links(sample)
    report["checks"]["6_internal_links"] = {
        "mode": "steekproef: homepage + index.html van elke top-level clustermap",
        "pages_sampled": len(sample),
        "links_checked": links_checked,
        "violations": len(c6),
        "examples": c6,
    }

    report["runtime_seconds"] = round(time.time() - t0, 1)

    # ---- Rapport wegschrijven + samenvatting ----------------------------------
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    hard_fail = False
    labels = {
        "1_sitemap_files": ("Sitemap <-> bestand", "urls_checked", True),
        "2_noindex_in_sitemap": ("Noindex in sitemap", "pages_scanned", True),
        "3_canonical": ("Canonical", "pages_with_canonical", False),
        "4_lang_attr": ("Lang-attribuut", "pages_checked", False),
        "5_jsonld": ("JSON-LD parsebaar", "blocks_checked", True),
        "6_internal_links": ("Interne links", "links_checked", False),
    }
    print("=" * 72)
    print("SITE-INVARIANTEN  (%s)" % ROOT)
    print("=" * 72)
    for key, (label, count_key, hard) in labels.items():
        c = report["checks"][key]
        n_viol = c["violations"]
        status = "OK " if n_viol == 0 else "FAIL" if hard else "WARN"
        print("[%s] %-22s gecheckt: %-7d overtredingen: %d"
              % (status, label, c[count_key], n_viol))
        if hard and n_viol:
            hard_fail = True
        for ex_item in c["examples"][:EXAMPLES_SHOWN]:
            print("       - %s" % json.dumps(ex_item, ensure_ascii=False)[:160])
        if n_viol > EXAMPLES_SHOWN:
            print("       ... nog %d meer (zie %s)"
                  % (n_viol - EXAMPLES_SHOWN, REPORT_PATH))
    extra = report["checks"]["1_sitemap_files"]
    if extra["sitemaps_on_disk_not_in_robots"]:
        print("\nInfo: sitemap-bestanden op disk maar NIET in robots.txt: %s"
              % ", ".join(extra["sitemaps_on_disk_not_in_robots"]))
    if extra["sitemap_files_missing"]:
        print("Info: gerefereerde sitemaps zonder bestand: %s"
              % ", ".join(extra["sitemap_files_missing"]))
    print("\nRuntime: %ss — volledig rapport: %s"
          % (report["runtime_seconds"], REPORT_PATH))
    sys.exit(1 if hard_fail else 0)


if __name__ == "__main__":
    main()
