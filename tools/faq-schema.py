#!/usr/bin/env python3
"""Regenerate the FAQPage JSON-LD on a page from its own visible Q&A markup.

The HTML stays the source of truth, so the schema can never drift from what a
reader actually sees. Re-run this after editing any FAQ copy:

    python3 tools/faq-schema.py faq.html pricing.html support.html

Recognises both Q&A shapes used on the site:
  - <div class="qa"><h3>Q</h3><p>A</p>...</div>          (faq.html)
  - <div class="faq-item"><button class="faq-q">Q</button>
        <div class="faq-a">A</div></div>                  (accordions)
  - <details><summary>Q</summary><p>A</p></details>       (pricing.html)

The generated block is tagged data-faq-schema so this script owns it and
replaces it in place, leaving every other JSON-LD block untouched.
"""
import html as htmllib
import json
import re
import sys

MARKER = 'data-faq-schema'


def text_of(fragment):
    """Visible text of an HTML fragment, entities decoded, whitespace collapsed."""
    t = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', fragment, flags=re.S | re.I)
    t = re.sub(r'<br\s*/?>', ' ', t, flags=re.I)
    t = re.sub(r'</p\s*>', ' \n', t, flags=re.I)
    t = re.sub(r'<[^>]+>', '', t)
    t = htmllib.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()


def pairs(src):
    """Every (question, answer) on the page, in document order."""
    found = []

    for m in re.finditer(r'<div class="qa">(.*?)</div>\s*(?=<div|</section|<hr|$)', src, re.S):
        block = m.group(1)
        q = re.search(r'<h3[^>]*>(.*?)</h3>', block, re.S)
        if not q:
            continue
        answer = block[q.end():]
        found.append((m.start(), text_of(q.group(1)), text_of(answer)))

    for m in re.finditer(
            r'<button class="faq-q"[^>]*>(.*?)</button>\s*<div class="faq-a">(.*?)</div>\s*</div>',
            src, re.S):
        found.append((m.start(), text_of(m.group(1)), text_of(m.group(2))))

    for m in re.finditer(r'<details[^>]*>\s*<summary[^>]*>(.*?)</summary>(.*?)</details>',
                         src, re.S):
        found.append((m.start(), text_of(m.group(1)), text_of(m.group(2))))

    found.sort()
    return [(q, a) for _, q, a in found]


def schema(url, qas):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "url": url,
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in qas
        ],
    }


def canonical(src):
    m = re.search(r'<link rel="canonical" href="([^"]+)"', src)
    return m.group(1) if m else None


def apply(path):
    src = open(path).read()
    qas = pairs(src)
    if not qas:
        print(f"{path}: no Q&A markup found, skipped")
        return
    url = canonical(src)
    if not url:
        print(f"{path}: no canonical link, skipped")
        return

    block = ('<script type="application/ld+json" ' + MARKER + '>'
             + json.dumps(schema(url, qas), separators=(",", ":"), ensure_ascii=False)
             + '</script>')

    existing = re.search(r'<script type="application/ld\+json" ' + MARKER + r'>.*?</script>',
                         src, re.S)
    if existing:
        src = src[:existing.start()] + block + src[existing.end():]
        how = "replaced"
    else:
        i = src.index('</head>')
        src = src[:i] + block + '\n' + src[i:]
        how = "added"

    open(path, "w").write(src)
    short = min(len(a) for _, a in qas)
    print(f"{path}: {how} FAQPage, {len(qas)} questions (shortest answer {short} chars)")


if __name__ == "__main__":
    targets = sys.argv[1:] or ["faq.html", "pricing.html", "support.html"]
    for t in targets:
        apply(t)
