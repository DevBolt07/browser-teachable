// ═══════════════════════════════════════════════════════════════
//  Teachable Machine v1.5
//  Clean v1 base + dynamic classes (up to 5) +
//  training charts + architecture diagram +
//  embedding distance meter + confidence timeline
// ═══════════════════════════════════════════════════════════════

import { store, THUMB_SIZE } from '../store.js';
import { setStatus, setPipe } from '../utils.js';
import { updateAllButtons, updateCountEl, scheduleDistanceUpdate } from './classes.js';
import { updateStats, checkTrainReady, scheduleQualityUpdate } from './dashboard.js';
import { extractEmbedding } from '../ml/dataset.js';
import { syncReplayButtons } from './replay.js';

let _thumbCanvas = null;
let _thumbCtx = null;

// ── Thumbnail Generation ─────────────────────────────────────────

export function captureThumbnail(src) {
  if (!_thumbCanvas) {
    _thumbCanvas = document.createElement('canvas');
    _thumbCanvas.width = _thumbCanvas.height = THUMB_SIZE;
    _thumbCtx = _thumbCanvas.getContext('2d');
  }
  _thumbCtx.clearRect(0, 0, THUMB_SIZE, THUMB_SIZE);
  _thumbCtx.drawImage(src, 0, 0, THUMB_SIZE, THUMB_SIZE);
  return _thumbCanvas.toDataURL('image/jpeg', 0.6);
}

// ── Webcam Hardware Initialization ───────────────────────────────

export async function startWebcam() {
  const webcamEl = document.getElementById('webcam');
  const startWebcamBtn = document.getElementById('startWebcamBtn');
  const predictStartCameraBtn = document.getElementById('predictStartCameraBtn');
  if (!webcamEl) return setStatus('Webcam preview is missing from the page.', 'error');
  if (!navigator.mediaDevices?.getUserMedia) {
    return setStatus('Camera requires a secure browser context. Open the app from http://localhost or HTTPS.', 'error');
  }
  if (store.webcamReady && store.webcamStream) {
    setStatus('📷 Webcam is already running.', 'ready');
    return;
  }
  try {
    if (startWebcamBtn) startWebcamBtn.disabled = true;
    if (predictStartCameraBtn) predictStartCameraBtn.disabled = true;
    const stream = await navigator.mediaDevices.getUserMedia({ video:{ width:640, height:480 } });
    store.webcamStream = stream;
    webcamEl.srcObject = stream;
    webcamEl.onloadedmetadata = () => {
      webcamEl.play();
      store.webcamReady = true;
      [startWebcamBtn, predictStartCameraBtn].forEach(btn => {
        if (!btn) return;
        btn.textContent = '✅ Camera On';
        btn.disabled = true;
      });
      setStatus('📷 Webcam ready. Collect samples or start live prediction after training.', 'ready');
      updateAllButtons();
      renderCamCollectBtns();
      syncReplayButtons();
    };
  } catch(e) {
    store.webcamReady = false;
    store.webcamStream = null;
    [startWebcamBtn, predictStartCameraBtn].forEach(btn => {
      if (!btn) return;
      btn.textContent = '📷 Start Camera';
      btn.disabled = false;
    });
    setStatus(`❌ Camera unavailable: ${e.message || 'Allow camera access in browser settings.'}`, 'error');
  }
}

export function stopWebcam() {
  stopCollection();
  if (store.webcamStream) {
    store.webcamStream.getTracks().forEach(track => track.stop());
    store.webcamStream = null;
  }
  const webcamEl = document.getElementById('webcam');
  if (webcamEl) {
    webcamEl.pause();
    webcamEl.srcObject = null;
  }
  store.webcamReady = false;
  ['startWebcamBtn', 'predictStartCameraBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.textContent = '📷 Start Camera';
    btn.disabled = false;
  });
  const webcamOverlay = document.getElementById('webcamOverlay');
  if (webcamOverlay) {
    webcamOverlay.removeAttribute('src');
    webcamOverlay.style.display = 'none';
  }
  updateAllButtons();
  syncReplayButtons();
}

function renderCamCollectBtns() {
  const camBtnRow = document.getElementById('camBtnRow');
  if (!camBtnRow) return;
  camBtnRow.querySelectorAll('.cam-collect, #stopCollectBtn').forEach(b => b.remove());
  const stopBtn = document.createElement('button');
  stopBtn.className = 'btn btn-stop btn-sm';
  stopBtn.id = 'stopCollectBtn';
  stopBtn.textContent = '⏹ Stop';
  stopBtn.disabled = true;
  stopBtn.onclick = () => window.stopCollection();
  camBtnRow.appendChild(stopBtn);
}

// ── Image Collection Orchestration ───────────────────────────────

export function startCollection(id) {
  const webcamEl = document.getElementById('webcam');
  const collectStatus = document.getElementById('collectStatus');
  if (!store.webcamReady) return setStatus('Start the webcam first.', 'error');
  stopCollection();
  store.activeCollectId = id;
  const cls = store.classes.find(c => c.id === id);
  if (!cls) return;

  const btn = document.getElementById(`collectBtn-${id}`);
  if (btn) btn.classList.add('collecting');
  const stopBtn = document.getElementById('stopCollectBtn');
  if (stopBtn) stopBtn.disabled = false;

  collectStatus.textContent = `⏺ Collecting for "${cls.name}"…`;
  setPipe('embed');

  let thumbCounter = 0;
  store.collectionInterval = setInterval(() => {
    if (!webcamEl.videoWidth) return;
    const emb = extractEmbedding(webcamEl);
    if (!emb) return;
    const c = store.classes.find(c => c.id === id);
    if (!c) { stopCollection(); return; }
    c.embeddings.push(emb);
    thumbCounter++;
    if (thumbCounter % 5 === 1) {
      c.thumbs.push(captureThumbnail(webcamEl));
      c.isAugmented.push(false);
    }
    updateCountEl(id);
    updateStats();
    checkTrainReady();
    collectStatus.textContent = `⏺ "${c.name}" — ${c.embeddings.length} samples`;
  }, 200);
}

export function stopCollection() {
  const collectStatus = document.getElementById('collectStatus');
  if (store.collectionInterval) { clearInterval(store.collectionInterval); store.collectionInterval = null; }
  document.querySelectorAll('.collecting').forEach(b => b.classList.remove('collecting'));
  const stopBtn = document.getElementById('stopCollectBtn');
  if (stopBtn) stopBtn.disabled = true;
  if (store.activeCollectId !== null) {
    const cls = store.classes.find(c => c.id === store.activeCollectId);
    if (cls && collectStatus) collectStatus.textContent = `✅ Stopped — "${cls.name}": ${cls.embeddings.length} samples`;
    scheduleDistanceUpdate();
    scheduleQualityUpdate();
  }
  store.activeCollectId = null;
}
