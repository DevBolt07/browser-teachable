(function (global) {
  const cache = new Map();

  function nextFrame() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  function getSourceDimensions(source) {
    return {
      width: source.videoWidth || source.naturalWidth || source.width || 224,
      height: source.videoHeight || source.naturalHeight || source.height || 224
    };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for XAI.'));
      img.src = src;
    });
  }

  function drawCover(ctx, source, width, height) {
    const dims = getSourceDimensions(source);
    const scale = Math.max(width / dims.width, height / dims.height);
    const drawWidth = dims.width * scale;
    const drawHeight = dims.height * scale;
    const dx = (width - drawWidth) / 2;
    const dy = (height - drawHeight) / 2;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, dx, dy, drawWidth, drawHeight);
  }

  async function predictProbabilities(source, mobilenetModel, classifierModel) {
    let activation;
    let predictions;

    try {
      activation = mobilenetModel.infer(source, true);
      predictions = classifierModel.predict(activation);
      return Array.from(await predictions.data());
    } finally {
      if (activation) activation.dispose();
      if (predictions) predictions.dispose();
    }
  }

  function buildPositions(size, patchSize, stride) {
    const positions = [];
    for (let pos = 0; pos <= size - patchSize; pos += stride) positions.push(pos);
    if (positions[positions.length - 1] !== size - patchSize) positions.push(size - patchSize);
    return positions;
  }

  function jetColor(t) {
    const r = Math.round(255 * Math.min(Math.max(1.5 - Math.abs(4 * t - 3), 0), 1));
    const g = Math.round(255 * Math.min(Math.max(1.5 - Math.abs(4 * t - 2), 0), 1));
    const b = Math.round(255 * Math.min(Math.max(1.5 - Math.abs(4 * t - 1), 0), 1));
    return [r, g, b];
  }

  function summariseHeatmap(normDrops, xPositions, yPositions, patchSize, inputSize, className, baseConfidence) {
    const cells = normDrops.map((value, index) => ({
      value,
      row: Math.floor(index / xPositions.length),
      col: index % xPositions.length
    }));

    const sorted = cells.slice().sort((a, b) => b.value - a.value);
    const topZones = sorted
      .filter(cell => cell.value > 0.15)
      .slice(0, 3)
      .map(cell => {
        const centerX = xPositions[cell.col] + patchSize / 2;
        const centerY = yPositions[cell.row] + patchSize / 2;
        return {
          impact: +(cell.value * 100).toFixed(1),
          xPct: +((centerX / inputSize) * 100).toFixed(1),
          yPct: +((centerY / inputSize) * 100).toFixed(1)
        };
      });

    const strongCells = cells.filter(cell => cell.value > 0.6).length;
    const concentration = strongCells / Math.max(cells.length, 1);

    let focusType = 'diffuse';
    if (concentration <= 0.08) focusType = 'highly focused';
    else if (concentration <= 0.2) focusType = 'moderately focused';

    const topZoneText = topZones.length
      ? topZones
          .map((zone, index) => `Zone ${index + 1}: ${zone.impact}% impact near (${zone.xPct}%, ${zone.yPct}%)`)
          .join(' | ')
      : 'No strong focus zone detected';

    const summaryText = `${className} at ${(baseConfidence * 100).toFixed(1)}% confidence. Attention is ${focusType}; ${topZoneText}.`;

    return {
      topZones,
      focusType,
      summaryText
    };
  }

  async function generateOcclusionMap({
    source,
    mobilenetModel,
    classifierModel,
    classNames = [],
    targetClassIndex,
    targetClassName,
    patchSize = 40,
    stride = 24,
    inputSize = 224,
    occlusionColor = 'rgba(128, 128, 128, 0.92)',
    yieldEvery = 4,
    cacheKey,
    onProgress
  }) {
    if (!source) throw new Error('Missing source for XAI generation.');
    if (!mobilenetModel || !classifierModel) throw new Error('Missing model references for XAI generation.');

    if (cacheKey && cache.has(cacheKey)) return cache.get(cacheKey);

    const resolvedSource = typeof source === 'string' ? await loadImage(source) : source;
    const sourceDims = getSourceDimensions(resolvedSource);

    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = inputSize;
    baseCanvas.height = inputSize;
    const baseCtx = baseCanvas.getContext('2d');
    drawCover(baseCtx, resolvedSource, inputSize, inputSize);

    const baseProbabilities = await predictProbabilities(baseCanvas, mobilenetModel, classifierModel);

    let winningIndex = Number.isInteger(targetClassIndex) ? targetClassIndex : -1;
    if (winningIndex < 0 && targetClassName) {
      winningIndex = classNames.indexOf(targetClassName);
    }
    if (winningIndex < 0) {
      winningIndex = baseProbabilities.indexOf(Math.max(...baseProbabilities));
    }

    const winningClassName = classNames[winningIndex] || targetClassName || `Class ${winningIndex + 1}`;
    const baseConfidence = baseProbabilities[winningIndex] || 0;

    const safePatchSize = Math.max(16, Math.min(patchSize, inputSize));
    const xPositions = buildPositions(inputSize, safePatchSize, stride);
    const yPositions = buildPositions(inputSize, safePatchSize, stride);
    const totalSteps = xPositions.length * yPositions.length;
    const drops = new Float32Array(totalSteps);

    const occludedCanvas = document.createElement('canvas');
    occludedCanvas.width = inputSize;
    occludedCanvas.height = inputSize;
    const occludedCtx = occludedCanvas.getContext('2d');

    let index = 0;
    for (let row = 0; row < yPositions.length; row++) {
      for (let col = 0; col < xPositions.length; col++) {
        occludedCtx.drawImage(baseCanvas, 0, 0);
        occludedCtx.fillStyle = occlusionColor;
        occludedCtx.fillRect(xPositions[col], yPositions[row], safePatchSize, safePatchSize);

        const occludedProbabilities = await predictProbabilities(occludedCanvas, mobilenetModel, classifierModel);
        const occludedConfidence = occludedProbabilities[winningIndex] || 0;
        drops[index] = Math.max(0, baseConfidence - occludedConfidence);
        index++;

        if (typeof onProgress === 'function') {
          onProgress({
            completed: index,
            total: totalSteps,
            percent: Math.round((index / totalSteps) * 100)
          });
        }

        if (index % yieldEvery === 0) await nextFrame();
      }
    }

    let maxDrop = 0;
    for (let i = 0; i < drops.length; i++) {
      if (drops[i] > maxDrop) maxDrop = drops[i];
    }

    const normDrops = Array.from(drops, value => (maxDrop > 0 ? value / maxDrop : 0));

    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = xPositions.length;
    heatCanvas.height = yPositions.length;
    const heatCtx = heatCanvas.getContext('2d');
    const heatImage = heatCtx.createImageData(xPositions.length, yPositions.length);

    for (let i = 0; i < normDrops.length; i++) {
      const [r, g, b] = jetColor(normDrops[i]);
      heatImage.data[i * 4] = r;
      heatImage.data[i * 4 + 1] = g;
      heatImage.data[i * 4 + 2] = b;
      heatImage.data[i * 4 + 3] = Math.round(40 + normDrops[i] * 215);
    }
    heatCtx.putImageData(heatImage, 0, 0);

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = sourceDims.width;
    overlayCanvas.height = sourceDims.height;
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx.drawImage(resolvedSource, 0, 0, sourceDims.width, sourceDims.height);
    overlayCtx.globalAlpha = 0.52;
    overlayCtx.imageSmoothingEnabled = true;
    overlayCtx.drawImage(heatCanvas, 0, 0, sourceDims.width, sourceDims.height);
    overlayCtx.globalAlpha = 1;

    const summary = summariseHeatmap(
      normDrops,
      xPositions,
      yPositions,
      safePatchSize,
      inputSize,
      winningClassName,
      baseConfidence
    );

    const result = {
      mode: 'occlusion',
      classIndex: winningIndex,
      className: winningClassName,
      baseConfidence,
      maxDropPercent: +(maxDrop * 100).toFixed(1),
      heatmapDataURL: heatCanvas.toDataURL('image/png'),
      overlayDataURL: overlayCanvas.toDataURL('image/png'),
      summaryText: summary.summaryText,
      focusType: summary.focusType,
      topZones: summary.topZones
    };

    if (cacheKey) cache.set(cacheKey, result);
    return result;
  }

  global.ClaimLensXAI = {
    generateOcclusionMap,
    loadImage,
    clearCache() {
      cache.clear();
    }
  };
})(window);
