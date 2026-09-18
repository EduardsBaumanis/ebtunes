import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const catalog = JSON.parse(await readFile(new URL('../../_site/player/catalog.json', import.meta.url)));
const first = catalog.albums[0];
const urlFor = (album, track = album.tracks[0], prefix = '/ebtunes/player/') => `${prefix}?album=${encodeURIComponent(album.id)}&song=${encodeURIComponent(track.filename)}`;

// Deterministic UI/failure tests; the separate audio tests use the real pinned engine.
async function fakeEngine(page) {
  await page.route('**/engine.html', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><script>
  let code='',notify;
  window.playerEngine={mount:async(c,n)=>{code=c;notify=n;n('ready','Ready')},getCode:()=>code,play:()=>notify('playing','Playing'),stop:()=>notify('stopped','Stopped'),dispose:()=>{}};
  </script>` }));
}

test('all albums display with a single catalog request and no discovery API', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/ebtunes/player/');
  await expect(page.locator('.album-card')).toHaveCount(catalog.albums.length);
  await expect(page.locator('#library-count')).toHaveText(`${catalog.albums.length} albums · ${catalog.trackCount} tracks`);
  expect(requests.some(url => /api.github.com|strudel.cc|supabase.co|\.strudel/.test(url))).toBe(false);
  await page.locator('#search').fill('fog-techno');
  await expect(page.locator('.album-card')).toHaveCount(1);
  await expect(page.locator('.track-link')).toHaveCount(catalog.albums.find(album => album.id === 'fog-techno').tracks.length);
});

for (const prefix of ['/player/', '/renamed-repo/player/', '/ebtunes/docs/player/', '/source/apps/player/']) {
  test(`deep links load exact source at ${prefix}`, async ({ page }) => {
    await fakeEngine(page);
    await page.goto(urlFor(first, first.tracks[0], prefix));
    await expect(page.locator('#play')).toBeEnabled();
    await expect(page.locator('#track-title')).toHaveText(first.tracks[0].title);
    const source = await page.locator('#source').inputValue();
    expect(source).toContain('setcpm');
    await page.locator('#play').click();
    await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'playing');
    await page.locator('#stop').click();
    await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'stopped');
  });
}

test('a slow old selection cannot overwrite the newer track', async ({ page }) => {
  await fakeEngine(page);
  let release;
  const barrier = new Promise(resolve => release = resolve);
  await page.route('**/tracks/**', async route => {
    if (route.request().url().includes(first.tracks[0].filename)) await barrier;
    try { await route.continue(); } catch { /* Expected: old fetch was aborted. */ }
  });
  await page.goto(urlFor(first));
  await expect(page.locator('#track-title')).toHaveText(first.tracks[0].title);
  await page.locator('#next').click();
  await expect(page.locator('#play')).toBeEnabled();
  release();
  await expect(page.locator('#track-title')).toHaveText(first.tracks[1].title);
  await expect(page.locator('#source')).toHaveValue(new RegExp(first.tracks[1].title));
});

test('missing source and HTML fallback show an actionable error; Retry recovers', async ({ page }) => {
  await fakeEngine(page);
  await page.route('**/tracks/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><h1>404</h1>' }));
  await page.goto(urlFor(first));
  await expect(page.locator('#error-banner')).toContainText('HTML');
  await expect(page.locator('#play')).toBeDisabled();
  await page.unroute('**/tracks/**');
  await page.locator('#retry').click();
  await expect(page.locator('#play')).toBeEnabled();
  await expect(page.locator('#error-banner')).toBeHidden();
});

test('catalog failure can retry without reloading the app', async ({ page }) => {
  await page.route('**/catalog.json', route => route.fulfill({ status: 404, body: 'Missing' }));
  await page.goto('/ebtunes/player/');
  await expect(page.locator('#error-banner')).toContainText('HTTP 404');
  await page.unroute('**/catalog.json');
  await page.locator('#retry').click();
  await expect(page.locator('.album-card')).toHaveCount(catalog.albums.length);
});

test('mobile library, keyboard controls, history and unavailable ratings', async ({ page }) => {
  await fakeEngine(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); });
  await page.route('**/*.supabase.co/**', route => route.abort());
  await page.goto('/ebtunes/player/');
  await page.locator('#menu').click();
  await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#search').fill(first.id);
  await page.locator('.track-link').first().click();
  await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#play')).toBeEnabled();
  await page.keyboard.press('Control+Enter');
  await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'playing');
  await page.locator('#next').click();
  await expect(page.locator('#track-title')).toHaveText(first.tracks[1].title);
  await page.goBack();
  await expect(page.locator('#track-title')).toHaveText(first.tracks[0].title);
  await page.locator('#board-tab').click();
  await expect(page.locator('#board-status')).toContainText('Refresh');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
