#!/usr/bin/env python3
"""Check publication evidence, generated pages and public-package boundaries."""
from collections import Counter
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import hashlib
import json
import re
import subprocess
import unicodedata

from package_site import ROOT, ENTRYPOINTS, public_files


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text).lower() if c.isalpha())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site-only', action='store_true', help='Validate the public checkout without local PDF/CV source bundles')
    args = parser.parse_args()
    metadata = json.loads((ROOT / 'papers/metadata.json').read_text())
    manifest = {'files': []} if args.site_only else json.loads((ROOT / 'raw/manifest.json').read_text())
    assert len({p['doi'].lower() for p in metadata}) == len(metadata), 'Duplicate DOI'
    for record in manifest['files']:
        raw = ROOT / record['raw_path']
        if record.get('optional_local') and not raw.exists():
            continue  # Local-only CV sources are intentionally absent from a public checkout.
        assert digest(raw) == record['sha256'], f'Changed raw source: {raw}'
    for asset in json.loads((ROOT / 'data/assets.json').read_text()):
        assert digest(ROOT / asset['path']) == asset['sha256'], f'Changed derived image: {asset["path"]}'
        source = ROOT / asset['source']
        if not args.site_only and (source.exists() or not asset.get('optional_local_source')):
            assert digest(source) == asset['source_sha256'], f'Changed image source: {asset["source"]}'
    for paper in metadata:
        if args.site_only:
            continue
        pdf = ROOT / 'papers' / paper['filename']
        source = next(r for r in manifest['files'] if r.get('doi') == paper['doi'])
        assert digest(pdf) == paper['source_sha256'] == source['sha256'], f'PDF/source mismatch: {pdf}'
        text = subprocess.run(['pdftotext', '-f', '1', '-l', '1', str(pdf), '-'],
                              check=True, capture_output=True, text=True).stdout
        assert paper['doi'].lower() in text.lower(), f'DOI not found in PDF: {pdf}'
        assert normalized(paper['title']) in normalized(text), f'Title not found in PDF: {pdf}'
        for author in paper['authors']:
            assert normalized(author['name']) in normalized(text), f'Author not found: {pdf}: {author}'
    pages = {p: Page((ROOT / p).read_text()) for p in ENTRYPOINTS}
    refs = 0
    for name, page in pages.items():
        ids = Counter(a['id'] for _, a in page.tags if 'id' in a)
        assert all(v == 1 for v in ids.values()), f'Duplicate IDs: {name}'
        assert sum(t == 'main' for t, _ in page.tags) == 1, f'Main landmark: {name}'
        text = (ROOT / name).read_text()
        assert '{{' not in text and 'cdn.tailwindcss.com' not in text, f'Unbuilt page: {name}'
        for tag, attrs in page.tags:
            for attr in ('href', 'src'):
                value = attrs.get(attr, '')
                url = urlsplit(value)
                assert not url.path.lower().endswith('.pdf'), f'PDF link is not permitted: {name}: {value}'
                if url.scheme or url.netloc or not value:
                    continue
                target = unquote(url.path) or name
                assert (ROOT / target).is_file(), f'Broken local reference: {name}: {value}'
                if url.fragment:
                    target_page = pages.get(target)
                    if target_page:
                        assert unquote(url.fragment) in {a.get('id') for _, a in target_page.tags}, f'Broken anchor: {name}: {value}'
                refs += 1
    pubs = [a for t, a in pages['publications.html'].tags if 'pub-item' in a.get('class', '').split()]
    assert len(pubs) == len(metadata), 'Publication count mismatch'
    years = {str(p['year']) for p in metadata}
    filters = {a['data-year-filter'] for _, a in pages['publications.html'].tags if 'data-year-filter' in a}
    assert filters == years | {'all'}, 'Incomplete year filters'
    assert f'논문 {len(metadata)}편 보기' in (ROOT / 'index.html').read_text(), 'Home count mismatch'
    paths = public_files()
    assert not any(p.suffix.lower() == '.pdf' or p.parts[0] == 'papers' for p in paths), 'PDFs must remain outside the public package'
    assert not any(p.parts[0] in ('raw', 'workshop', '.git', 'templates') for p in paths)
    if (ROOT / 'dist').exists():
        actual = {str(p.relative_to(ROOT / 'dist')) for p in (ROOT / 'dist').rglob('*') if p.is_file()}
        assert actual == {str(p) for p in paths} | {'.nojekyll', 'manifest.json'}, 'Unexpected dist file'
        for path in paths:
            assert digest(ROOT / path) == digest(ROOT / 'dist' / path), f'Stale dist: {path}'
    evidence = 'publication records' if args.site_only else 'PDF titles/authors/DOIs/hashes'
    print(f'PASS: {len(metadata)} {evidence}, {len(pages)} pages, {refs} local references, year filters, counts, and public package.')


if __name__ == '__main__':
    main()
