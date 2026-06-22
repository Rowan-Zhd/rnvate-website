#!/usr/bin/env python3
"""Regenerate sitemap.xml with accurate <lastmod> dates.

lastmod for each page is the most recent of:
  - the file's last git commit date (what is actually live once pushed), and
  - the file's working-tree modification date (so freshly edited, not-yet-committed
    pages show today).

Run this before each deploy (or wire it into your build/CI) so lastmod stays honest:
    python3 generate-sitemap.py
"""
import os, subprocess, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE = "https://rnvate.com"

# (url path, source file, changefreq, priority)
PAGES = [
    ("/",                                              "index.html",                                        "weekly",  "1.0"),
    ("/about.html",                                    "about.html",                                        "monthly", "0.8"),
    ("/services/",                                     "services/index.html",                               "monthly", "0.9"),
    ("/services/customer-experience-strategy.html",    "services/customer-experience-strategy.html",        "monthly", "0.8"),
    ("/services/process-automation.html",              "services/process-automation.html",                  "monthly", "0.8"),
    ("/services/release-qa-governance.html",           "services/release-qa-governance.html",               "monthly", "0.8"),
    ("/services/service-product-design.html",          "services/service-product-design.html",              "monthly", "0.8"),
    ("/work/",                                         "work/index.html",                                   "monthly", "0.9"),
    ("/work/enterprise-digital-platform-delivery.html","work/enterprise-digital-platform-delivery.html",    "monthly", "0.7"),
    ("/work/digital-banking-cx-transformation.html",   "work/digital-banking-cx-transformation.html",       "monthly", "0.7"),
    ("/work/product-strategy-design-systems.html",     "work/product-strategy-design-systems.html",         "monthly", "0.7"),
    ("/work/bpo-platform-transformation.html",         "work/bpo-platform-transformation.html",             "monthly", "0.7"),
    ("/contact.html",                                  "contact.html",                                      "monthly", "0.9"),
    ("/privacy.html",                                  "privacy.html",                                      "yearly",  "0.3"),
    ("/terms.html",                                    "terms.html",                                        "yearly",  "0.3"),
    ("/cookies.html",                                  "cookies.html",                                      "yearly",  "0.3"),
]


def lastmod(rel):
    dates = []
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%cs", "--", rel],
            cwd=ROOT, stderr=subprocess.DEVNULL).decode().strip()
        if out:
            dates.append(out)
    except Exception:
        pass
    path = os.path.join(ROOT, rel)
    if os.path.exists(path):
        dates.append(datetime.date.fromtimestamp(os.path.getmtime(path)).isoformat())
    return max(dates) if dates else datetime.date.today().isoformat()


def main():
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, src, freq, prio in PAGES:
        lines += [
            "  <url>",
            f"    <loc>{BASE}{path}</loc>",
            f"    <lastmod>{lastmod(src)}</lastmod>",
            f"    <changefreq>{freq}</changefreq>",
            f"    <priority>{prio}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"sitemap.xml regenerated with {len(PAGES)} URLs")


if __name__ == "__main__":
    main()
