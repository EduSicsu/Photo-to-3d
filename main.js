import { createGarden } from './scene/garden.js';

const viewer = document.querySelector('.viewer');
const canvas = document.querySelector('#garden');
const tools = document.querySelector('.zoom-controls');
const hint = document.querySelector('.hint');
const zoomIn = document.querySelector('#zoom-in');
const zoomOut = document.querySelector('#zoom-out');
const zoomValue = document.querySelector('#zoom-value');
const reset = document.querySelector('#reset');
const fullscreen = document.querySelector('#fullscreen');
const announcement = document.querySelector('#announcement');
let garden;

function showLive(available) {
  viewer.toggleAttribute('data-live', available);
  viewer.toggleAttribute('data-fallback', !available);
  canvas.tabIndex = available ? 0 : -1;
  canvas.setAttribute('aria-hidden', String(!available));
  tools.hidden = hint.hidden = !available;
}

function updateControls({ zoom }) {
  const percent = Math.round(zoom * 100) + '%';
  if (zoomValue.value !== percent) zoomValue.value = percent;
  zoomOut.disabled = zoom <= 1.0001;
  zoomIn.disabled = zoom >= 1.2399;
}

// Keep the focus outline available to keyboard users after a touch or drag.
viewer.addEventListener('pointerdown', () => { viewer.dataset.pointerInput = ''; }, true);
window.addEventListener('keydown', () => { delete viewer.dataset.pointerInput; }, true);

zoomOut.addEventListener('click', () => garden?.zoomBy(-0.04));
zoomIn.addEventListener('click', () => garden?.zoomBy(0.04));
reset.addEventListener('click', () => {
  garden?.reset();
  announcement.textContent = 'Original view restored.';
});
if (document.fullscreenEnabled) {
  fullscreen.hidden = false;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewer.requestFullscreen();
    } catch {
      announcement.textContent = 'Fullscreen is unavailable in this window.';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen';
    fullscreen.title = label;
    fullscreen.setAttribute('aria-label', label);
  });
}

try {
  garden = await createGarden(canvas, {
    onChange: updateControls,
    onAvailability: showLive,
    onError: () => showLive(false),
  });
  showLive(true);
} catch (error) {
  showLive(false);
  console.info('Showing the still render of the garden.', error.message);
}
window.addEventListener('pagehide', event => {
  if (!event.persisted) garden?.dispose();
});
