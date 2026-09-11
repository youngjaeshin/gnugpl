/* Browser regression checks against dist/. Requires an installed Chromium/Chrome. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

(async () => {
  const puppeteer = await import('puppeteer-core');
  const root = path.resolve(__dirname, '..');
  const dist = path.join(root, 'dist');
  const output = path.join(root, 'output/review');
  fs.mkdirSync(output, { recursive: true });
  const executablePath = process.env.CHROME_PATH || [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].find(p => fs.existsSync(p));
  assert(executablePath, 'Set CHROME_PATH to your Chrome/Chromium executable.');
  const fixture = '<!doctype html><html lang="ko"><head><link rel="icon" href="images/logo-192.png"><link rel="stylesheet" href="css/custom.css"></head><body><button class="gallery-item" data-caption="테스트 사진"><img src="images/logo-192.png" alt="테스트 로고"></button><script src="js/main.js"></script></body></html>';
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/gallery-test.html') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fixture); return; }
    const filename = path.resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(dist + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) { res.writeHead(404); res.end(); return; }
    const type = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.pdf': 'application/pdf' }[path.extname(filename)] || 'application/octet-stream';
    res.setHeader('Content-Type', type);
    fs.createReadStream(filename).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const report = { checked: new Date().toISOString(), pages: [], tests: [] };
  try {
    browser = await puppeteer.launch({ executablePath, headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    // Avoid loading the third-party map; this suite checks our UI, not Google Maps availability.
    await page.setRequestInterception(true);
    page.on('request', request => /maps\.google\.com/.test(request.url()) ? request.abort() : request.continue());
    const names = ['index', 'research', 'members', 'publications', 'gallery', 'contact'];
    for (const name of names) {
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewport({ width, height: 1000 });
        await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle0' });
        const layout = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).length,
          mainCount: document.querySelectorAll('main').length,
        }));
        assert(!layout.overflow, `${name} overflows at ${width}px`);
        assert.equal(layout.brokenImages, 0, `${name} broken image`);
        assert.equal(layout.mainCount, 1);
        if (width === 1440 || width === 390) await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
        report.pages.push({ name, width, ...layout });
      }
    }
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${base}/index.html`);
    await page.keyboard.press('Tab');
    assert.equal(await page.$eval(':focus', e => e.className), 'skip-link');
    await page.keyboard.press('Enter');
    assert.equal(await page.$eval(':focus', e => e.id), 'main-content');
    await page.click('#hamburger');
    assert.equal(await page.$eval('#hamburger', e => e.getAttribute('aria-expanded')), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval(':focus', e => e.id), 'hamburger');
    assert.equal(await page.$eval('#hamburger', e => e.getAttribute('aria-expanded')), 'false');
    await page.click('#hamburger');
    await page.setViewport({ width: 1440, height: 1000 });
    await page.waitForFunction(() => getComputedStyle(document.getElementById('mobile-menu')).display === 'none');
    report.tests.push('Keyboard skip link, mobile menu Escape/focus, desktop resize');

    await page.goto(`${base}/publications.html`);
    const papers = JSON.parse(fs.readFileSync(path.join(root, 'papers/metadata.json')));
    for (const year of ['all', ...new Set(papers.map(p => String(p.year)))]) {
      await page.click(`[data-year-filter="${year}"]`);
      const count = await page.$$eval('.pub-item:not([hidden])', items => items.length);
      assert.equal(count, papers.filter(p => year === 'all' || String(p.year) === year).length);
      assert.equal(await page.$eval(`[data-year-filter="${year}"]`, e => e.getAttribute('aria-pressed')), 'true');
    }
    await page.evaluate(() => { location.hash = 'paper-Shin_2026_CoupledFEM_JSE'; });
    await page.waitForFunction(expected => document.querySelectorAll('.pub-item:not([hidden])').length === expected, {}, papers.length);
    report.tests.push('All publication filters/counts/pressed states and hidden-year anchor recovery');

    await page.goto(`${base}/gallery-test.html`);
    await page.click('.gallery-item');
    assert.equal(await page.$eval('dialog', e => e.open), true);
    assert.equal(await page.$eval('dialog img', e => e.alt), '테스트 로고');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog img').hasAttribute('src'));
    assert.equal(await page.$eval('dialog', e => e.open), false);
    assert.equal(await page.$eval(':focus', e => e.className), 'gallery-item');
    assert.equal(await page.$eval('dialog img', e => e.hasAttribute('src')), false);
    report.tests.push('Gallery fixture: open, alt text, native Escape, focus restoration, cleared image source');

    const noJS = await browser.newPage();
    await noJS.setJavaScriptEnabled(false);
    await noJS.setViewport({ width: 390, height: 844 });
    await noJS.setRequestInterception(true);
    noJS.on('request', request => request.url().startsWith(base) ? request.continue() : request.abort());
    for (const name of names) {
      await noJS.goto(`${base}/${name}.html`, { waitUntil: 'load' });
      const state = await noJS.evaluate(() => ({
        menuVisible: getComputedStyle(document.getElementById('mobile-menu')).display !== 'none',
        hiddenContent: [...document.querySelectorAll('main .reveal')].some(e => getComputedStyle(e).opacity === '0'),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }));
      assert(state.menuVisible && !state.hiddenContent && !state.overflow, `${name} without JS/external network: ${JSON.stringify(state)}`);
    }
    report.tests.push('Six pages without JavaScript or external network: content, navigation, mobile layout');
    await noJS.close();
    assert.deepEqual(errors, []);
    report.tests.push('No page JavaScript errors or local HTTP errors');
    report.status = 'PASS';
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(report, null, 2));
    console.log(`PASS: ${report.pages.length} page/viewport checks, ${report.tests.length} behavior groups, 12 screenshots. See output/review/.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
