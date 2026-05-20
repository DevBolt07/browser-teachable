// ═══════════════════════════════════════════════════════════════
//  Teachable Machine v1.5
//  Clean v1 base + dynamic classes (up to 5) +
//  training charts + architecture diagram +
//  embedding distance meter + confidence timeline
// ═══════════════════════════════════════════════════════════════

import { store, THUMB_MAX } from '../store.js';
import { cosineSim } from '../utils.js';
import { updateDistancePanel } from '../visuals/distance.js';

// ── Global Stats & Readiness ─────────────────────────────────────

export function updateStats() {
  const statSamples = document.getElementById('statSamples');
  const statClasses = document.getElementById('statClasses');
  const total = store.classes.reduce((s,c) => s + c.embeddings.length, 0);
  if (statSamples) statSamples.textContent = total;
  if (statClasses) statClasses.textContent = store.classes.length;

  const autoAugmentBtn = document.getElementById('autoAugmentBtn');
  if (autoAugmentBtn) {
    autoAugmentBtn.disabled = total === 0;
  }
}

export function checkTrainReady() {
  const trainBtn = document.getElementById('trainBtn');
  if (trainBtn) trainBtn.disabled = !(store.classes.length >= 2 && store.classes.every(c => c.embeddings.length >= 2));
}

let qualityTimer = null;
export function scheduleQualityUpdate() {
  clearTimeout(qualityTimer);
  qualityTimer = setTimeout(renderQualityDashboard, 800);
}

export function updateDistancePanelWrap() {
  updateDistancePanel();
}

// ── Quality Dashboard Rendering ──────────────────────────────────

export async function renderQualityDashboard() {
  const body = document.getElementById('qualityBody');
  if (!body) return;

  const hasAnySamples = store.classes.some(c => c.embeddings.length > 0);
  if (!hasAnySamples) {
    body.innerHTML = '<div class="qd-empty">Collect samples to see quality analysis here.</div>';
    return;
  }

  body.innerHTML = '';

  const perPage = window.__classesPerPage || 6;
  const offset = window.__classesVisibleOffset || 0;
  const visible = store.classes.slice(offset, offset + perPage);
  for (const cls of visible) {
    const n = cls.embeddings.length;
    if (n === 0) continue;

    let diversityScore = 0;   
    let similarFlags   = new Set();  

    if (n >= 2) {
      const embArrays = await Promise.all(cls.embeddings.map(t => t.data()));
      let pairCount = 0, distSum = 0;
      const limit = Math.min(n, 20);

      for (let i = 0; i < limit; i++) {
        for (let j = i + 1; j < limit; j++) {
          const sim  = cosineSim(embArrays[i], embArrays[j]);
          const dist = 1 - sim;   
          distSum += dist;
          pairCount++;
          if (sim > 0.985) { similarFlags.add(i); similarFlags.add(j); }
        }
      }
      diversityScore = pairCount > 0
        ? Math.min(100, Math.round((distSum / pairCount) * 500))
        : 0;
    }

    const scoreLabel = diversityScore >= 60 ? 'Diverse'
                     : diversityScore >= 30 ? 'Moderate'
                     : 'Low variety';
    const scoreClass = diversityScore >= 60 ? 'good'
                     : diversityScore >= 30 ? 'medium'
                     : 'poor';

    let rec = '', recClass = '';
    if (n < 5) {
      rec = `⚠️ Only ${n} sample${n>1?'s':''}. Add at least 10–20 for reliable training.`;
      recClass = 'warn';
    } else if (diversityScore < 30) {
      rec = `⚠️ Samples look too similar. Try different distances, angles, and lighting conditions.`;
      recClass = 'warn';
    } else if (diversityScore < 60) {
      rec = `🟡 Decent variety. Adding samples from different backgrounds or distances would help.`;
      recClass = '';
    } else {
      rec = `✅ Great variety! The model should learn this class reliably.`;
      recClass = 'good';
    }

    const block = document.createElement('div');
    block.className = 'qd-class-block';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'qd-class-header';
    headerDiv.innerHTML = `
      <span style="width:10px;height:10px;border-radius:50%;background:${cls.pal.color};display:inline-block;flex-shrink:0;"></span>
      <span class="qd-class-name" style="color:${cls.pal.text}">${cls.name}</span>
      <span style="font-size:0.72rem;color:#718096;">${n} samples</span>
      <span class="qd-score-badge ${scoreClass}">${scoreLabel}</span>
    `;
    block.appendChild(headerDiv);

    const divRow = document.createElement('div');
    divRow.className = 'qd-div-row';
    const barColor = diversityScore >= 60 ? '#48bb78' : diversityScore >= 30 ? '#f6ad55' : '#f56565';
    divRow.innerHTML = `
      <span class="qd-div-label">Variety</span>
      <div class="qd-div-track">
        <div class="qd-div-fill" style="width:${diversityScore}%;background:${barColor};"></div>
      </div>
      <span class="qd-div-pct">${diversityScore}%</span>
    `;
    block.appendChild(divRow);

    const thumbsDiv = document.createElement('div');
    thumbsDiv.className = 'qd-thumbs';

    const shown = cls.thumbs.slice(0, THUMB_MAX);
    shown.forEach((dataUrl, ti) => {
      const wrap = document.createElement('div');
      wrap.className = 'qd-thumb-wrap';
      const img = document.createElement('img');
      img.className = 'qd-thumb' + (similarFlags.has(ti * 5) ? ' similar-flag' : '');
      img.src = dataUrl;
      img.title = similarFlags.has(ti * 5) ? 'Very similar to another sample — try a different angle' : `Sample ${ti + 1}`;
      wrap.appendChild(img);
      const idx = document.createElement('span');
      idx.className = 'qd-thumb-idx';
      idx.textContent = ti + 1;
      wrap.appendChild(idx);
      thumbsDiv.appendChild(wrap);
    });

    if (cls.thumbs.length > THUMB_MAX) {
      const more = document.createElement('div');
      more.className = 'qd-thumbs-more';
      more.textContent = `+${cls.thumbs.length - THUMB_MAX}`;
      thumbsDiv.appendChild(more);
    } else if (cls.thumbs.length === 0 && n > 0) {
      const ph = document.createElement('div');
      ph.className = 'qd-thumbs-more';
      ph.textContent = `${n}×`;
      thumbsDiv.appendChild(ph);
    }

    block.appendChild(thumbsDiv);

    if (rec) {
      const recDiv = document.createElement('div');
      recDiv.className = `qd-rec ${recClass}`;
      recDiv.innerHTML = rec;
      block.appendChild(recDiv);
    }

    if (cls !== visible[visible.length - 1]) {
      const hr = document.createElement('hr');
      hr.style.cssText = 'border:none;border-top:1px solid #e2e8f0;margin:12px 0 0;';
      block.appendChild(hr);
    }

    body.appendChild(block);
  }
  // Pagination controls for quality view
  const total = store.classes.length;
  if (total > perPage) {
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:8px;margin-top:10px;align-items:center;';
    if (offset > 0) {
      const prev = document.createElement('button'); prev.className='btn btn-sm'; prev.textContent = `◀ Prev ${perPage}`;
      prev.addEventListener('click', () => { window.__classesVisibleOffset = Math.max(0, offset - perPage); renderQualityDashboard(); });
      controls.appendChild(prev);
    }
    if (offset + perPage < total) {
      const next = document.createElement('button'); next.className='btn btn-sm'; next.textContent = `Next ${perPage} ▶`;
      next.addEventListener('click', () => { window.__classesVisibleOffset = offset + perPage; renderQualityDashboard(); });
      controls.appendChild(next);
    }
    if (offset !== 0) {
      const first = document.createElement('button'); first.className='btn btn-sm'; first.textContent='Show first';
      first.addEventListener('click', () => { window.__classesVisibleOffset = 0; renderQualityDashboard(); });
      controls.appendChild(first);
    }
    const info = document.createElement('div'); info.style.marginLeft='auto'; info.style.color='#64748b'; info.textContent = `Showing ${Math.min(total, offset+1)}–${Math.min(total, offset+perPage)} of ${total} classes`;
    controls.appendChild(info);
    body.appendChild(controls);
  }
}
