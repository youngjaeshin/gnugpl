#!/usr/bin/env python3
"""Generate standalone HTML from reviewed data and shared templates (stdlib only)."""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = [('index', '홈'), ('research', '연구'), ('members', '구성원'),
         ('publications', '논문'), ('gallery', '갤러리'), ('contact', '연락처')]


def read_json(path):
    return json.loads((ROOT / path).read_text())


def fill(text, values):
    for key, value in values.items():
        text = text.replace('{{' + key + '}}', str(value))
    if re.search(r'{{[A-Z_]+}}', text):
        raise ValueError('Unfilled template token: ' + re.search(r'{{[A-Z_]+}}', text)[0])
    return text


def paper_id(paper):
    return 'paper-' + Path(paper['filename']).stem


def citation(paper):
    volume = paper['volume'] + (f"({paper['issue']})" if paper['issue'] else '')
    details = ', '.join(str(v) for v in [volume, paper['pages'], paper['year']] if v)
    return f"<em>{escape(paper['journal'])}</em>, {escape(details)}."


def paper_links(paper):
    return (f'<a class="pub-doi" href="https://doi.org/{escape(paper["doi"])}" target="_blank" rel="noopener">'
            f'DOI: {escape(paper["doi"])}</a>')


def paper_html(paper):
    authors = ', '.join('<strong>' + escape(a['name']) + '</strong>'
                        if a['name'] in ['Youngjae Shin', '신영재'] else escape(a['name'])
                        for a in paper['authors'])
    return f'''<article class="pub-item" id="{paper_id(paper)}" data-year="{paper['year']}">
      <div class="pub-year">{paper['year']}</div><div class="pub-content">
      <h3 class="pub-title">{escape(paper['title'])}</h3>
      <p class="pub-authors">{authors}</p><p class="pub-journal">{citation(paper)}</p>
      <div class="pub-links">{paper_links(paper)}</div></div>
    </article>'''


def gallery_html(items):
    if not items:
        return '''<div class="gallery-empty"><h2>연구실의 일상을 준비하고 있습니다</h2>
        <p>현장 조사와 연구실 활동 사진을 정리하고 있습니다.<br>진행하는 연구는 연구 분야와 논문 목록에서 살펴보실 수 있습니다.</p>
        <a class="btn-primary" href="research.html">연구 분야 보기</a></div>'''
    cards = []
    for item in items:
        src = item['src']
        if not src.startswith('images/') or '..' in Path(src).parts or not (ROOT / src).is_file():
            raise ValueError('Gallery requires a local image: ' + src)
        cards.append(f'''<button type="button" class="gallery-item" data-caption="{escape(item['caption'])}">
        <img src="{escape(src)}" alt="{escape(item['alt'])}" loading="lazy">
        <span class="gallery-overlay"><span class="gallery-overlay-text">{escape(item['caption'])}</span></span></button>''')
    return '<div class="gallery-grid">' + '\n'.join(cards) + '</div>'


def profile_history(items, kind):
    rows = []
    for item in items:
        period = item['start'] + '–' + (item['end'] or '현재')
        detail = (item['degree'] + ' · ' + item['field']) if kind == 'education' else item['position']
        rows.append(f'<li><span class="profile-period">{escape(period)}</span>'
                    f'<p><strong>{escape(item["institution"])}</strong> {escape(item["department"])} · {escape(detail)}</p></li>')
    return '<ol class="profile-timeline">' + ''.join(rows) + '</ol>'


def main():
    site = read_json('data/site.json')
    profile = read_json('data/profile.json')
    papers = read_json('papers/metadata.json')
    papers = sorted(papers, key=lambda p: p['year'], reverse=True)
    assert len({p['doi'].lower() for p in papers}) == len(papers), 'Duplicate DOI'
    by_doi = {p['doi']: p for p in papers}
    research = read_json('data/research.json')
    research_home = []
    research_sections = []
    for area in research:
        assert all(doi in by_doi for doi in area['supporting_dois']), 'Unknown research evidence DOI'
        research_home.append(f'<article><h3>{escape(area["title"])}</h3><p>{escape(area["summary"])}</p>'
                             f'<a href="research.html#{escape(area["id"])}">분야 소개</a></article>')
        paragraphs = ''.join('<p>' + escape(text) + '</p>' for text in area['description'])
        topics = ''.join('<li>' + escape(text) + '</li>' for text in area['topics'])
        research_sections.append(f'<section id="{escape(area["id"])}" class="research-area">'
                                 f'<div><h2>{escape(area["title"])}</h2><p class="area-english">{escape(area["english"])}</p></div>'
                                 f'<div class="area-content">{paragraphs}<ul>{topics}</ul></div></section>')
    news = []
    for item in read_json('data/news.json'):
        href = 'publications.html#' + paper_id(by_doi[item['doi']]) if 'doi' in item else item['href']
        news.append(f'''<article class="news-item"><time datetime="{escape(item['date'].replace('.', '-'))}">{escape(item['date'])}</time>
        <div><span class="news-category">{escape(item['type'])}</span><a href="{escape(href)}">{escape(item['text'])}</a></div></article>''')
    years = sorted({p['year'] for p in papers}, reverse=True)
    filters = '<button class="filter-btn active" type="button" data-year-filter="all" aria-pressed="true">전체</button>'
    filters += ''.join(f'<button class="filter-btn" type="button" data-year-filter="{y}" aria-pressed="false">{y}</button>' for y in years)
    assert profile['career'][0]['position'] == site['rank_ko'], 'Profile/site rank mismatch'
    assert profile['career'][0]['start'] == site['promotion_date'], 'Profile/site promotion date mismatch'
    assert profile['career'][1]['start'] == site['appointment_date'], 'Profile/site appointment date mismatch'
    career = profile_history(profile['career'], 'career')
    photo = profile['photo']
    featured = papers[0]
    date = featured.get('published_online')
    featured_date = f'{date[:4]}년 {int(date[5:7])}월' if date else f'{featured["year"]}년'
    members = site['members']
    member_summary = (f'현재 연구실은 {escape(members[0]["name_ko"])} 교수 1인으로 구성되어 있습니다.'
                      if len(members) == 1 and members[0]['kind'] == 'faculty'
                      else f'현재 연구실은 총 {len(members)}명으로 구성되어 있습니다.')
    common = dict(EMAIL=escape(site['email']), RANK=escape(site['rank_ko'] + ' / ' + site['rank_en']),
                  INTRO=escape(site['intro']),
                  PROFILE_NAME_KO=escape(profile['name_ko']), PROFILE_NAME_EN=escape(profile['name_en']),
                  PROFILE_PHOTO=f'<img class="profile-photo" src="{escape(photo["src"])}" width="{photo["width"]}" height="{photo["height"]}" alt="신영재 교수 사진">',
                  PROFILE_SPECIALIZATION=escape(profile['specialization']),
                  PROFILE_RESEARCH=escape(', '.join(a['title'] for a in research) + '.'),
                  EDUCATION=profile_history(profile['education'], 'education'),
                  RANK_KO=escape(site['rank_ko']), CAREER=career, PUB_COUNT=len(papers),
                  YEAR=site['updated'][:4], UPDATED=site['updated'].replace('-', '.'),
                  PUBLICATIONS='\n'.join(map(paper_html, papers)), YEAR_FILTERS=filters,
                  NEWS='\n'.join(news), GALLERY=gallery_html(read_json('data/gallery.json')),
                  FEATURED_DATE=featured_date,
                  MEMBER_SUMMARY=member_summary,
                  RESEARCH_HOME='\n'.join(research_home), RESEARCH_SECTIONS='\n'.join(research_sections),
                  FEATURED_PAPER=f'<h2>{escape(featured["title"])}</h2><p>{citation(featured)}</p><div class="pub-links">{paper_links(featured)}</div>')
    for slug, label in PAGES:
        links = ''
        for p, text in PAGES:
            active = ' active' if p == slug else ''
            current = ' aria-current="page"' if p == slug else ''
            links += f'<a href="{p}.html" class="nav-link{active}"{current}>{text}</a>'
        values = dict(common, NAV_LINKS=links, FOOTER_LINKS=links)
        values['IMAGE_CREDIT'] = ('<p class="container image-credit">대표 이미지: '
                                 '<a href="https://commons.wikimedia.org/wiki/File:가좌_캠퍼스_항공촬영.jpg" target="_blank" rel="noopener">GNU 사진</a> 기반 AI 재구성 · '
                                 '<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a></p>'
                                 if slug == 'index' else '')
        values['NAV'] = fill((ROOT / 'templates/partials/nav.html').read_text(), values)
        values['FOOTER'] = fill((ROOT / 'templates/partials/footer.html').read_text(), values)
        html = fill((ROOT / 'templates/pages' / (slug + '.html')).read_text(), values)
        html = html.replace('<head>', '<head>\n  <!-- Generated by scripts/build_site.py; edit templates/pages/' + slug + '.html -->')
        (ROOT / (slug + '.html')).write_text(html)
    print(f'Generated {len(PAGES)} pages with {len(papers)} published papers.')


if __name__ == '__main__':
    main()
