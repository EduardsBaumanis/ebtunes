import { test, expect } from '@playwright/test';

// Measure real Web Audio samples. A green transport indicator alone is insufficient.
const probe = () => {
  const connect = AudioNode.prototype.connect;
  const destinations = new WeakMap();
  window.__audioProbes = [];
  AudioNode.prototype.connect = function(destination, ...ports) {
    if (destination instanceof AudioDestinationNode) {
      let analyser = destinations.get(destination);
      if (!analyser) {
        analyser = this.context.createAnalyser();
        analyser.fftSize = 2048;
        destinations.set(destination, analyser);
        window.__audioProbes.push(analyser);
        connect.call(analyser, destination);
      }
      return connect.call(this, analyser, ...ports);
    }
    return connect.call(this, destination, ...ports);
  };
};
async function energy(frame) {
  return frame.evaluate(async () => {
    let peak = 0;
    const buffer = new Float32Array(2048);
    for (let i = 0; i < 25; i++) {
      for (const analyser of window.__audioProbes) {
        analyser.getFloatTimeDomainData(buffer);
        for (const value of buffer) peak = Math.max(peak, Math.abs(value));
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return peak;
  });
}

test('real synth playback, cancellation, errors and recovery', async ({ page }) => {
  await page.addInitScript(probe);
  await page.goto('/ebtunes/player/?mode=build');
  await expect(page.locator('#play')).toBeEnabled({ timeout: 40000 });
  const frame = page.frames().find(frame => frame.url().endsWith('/engine.html'));
  await frame.evaluate(() => document.querySelector('strudel-editor').editor.setCode('setcpm(120/4)\nnote("c4 e4 g4").s("sine").gain(0.3)'));
  await page.locator('#play').click();
  await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'playing');
  expect(await energy(frame)).toBeGreaterThan(0.001);
  await page.locator('#stop').click();
  await expect.poll(() => frame.evaluate(() => getAudioContext().state)).toBe('suspended');
  await frame.evaluate(() => document.querySelector('strudel-editor').editor.setCode('notARealFunction()'));
  await page.locator('#play').click();
  await expect(page.locator('#error-banner')).toContainText('notARealFunction');
  await frame.evaluate(() => document.querySelector('strudel-editor').editor.setCode('note("c4").s("sine").gain(0.2)'));
  await page.locator('#play').click();
  await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'playing');
  expect(await energy(frame)).toBeGreaterThan(0.001);
  // Stop while evaluation is awaiting user code must prevent delayed auto-start.
  await frame.evaluate(() => document.querySelector('strudel-editor').editor.setCode('await new Promise(r => setTimeout(r, 1200));\nnote("c4").s("sine")'));
  await page.locator('#play').click();
  await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'evaluating');
  await page.locator('#stop').click();
  await page.waitForTimeout(1500);
  await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'stopped');
  expect(await frame.evaluate(() => document.querySelector('strudel-editor').editor.repl.scheduler.started)).toBe(false);
});

test('repository drums, synths and sliders produce audio through the deployed engine', async ({ page }) => {
  await page.addInitScript(probe);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/ebtunes/player/?album=fog-techno&song=01-fog-bank-rising.strudel');
  await expect(page.locator('#play')).toBeEnabled({ timeout: 40000 });
  await page.locator('#play').click();
  await expect(page.locator('#playback-status')).toHaveAttribute('data-state', 'playing');
  const frame = page.frames().find(frame => frame.url().endsWith('/engine.html'));
  await expect(frame.locator('input[type="range"]').first()).toBeVisible();
  expect(await energy(frame)).toBeGreaterThan(0.001);
  expect(errors).toEqual([]);
  await page.locator('#stop').click();
});
