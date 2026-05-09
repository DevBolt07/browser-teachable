import { store } from '../store.js';
import { setStatus } from '../utils.js';
import { extractEmbedding } from './dataset.js';
import { updateCountEl, finalizeSampleUpdates } from '../ui/classes.js';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Applies a transformation to an image and returns a canvas
export function transformImage(img, transformType) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (transformType === 'flip') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else if (transformType === 'brighten') {
    ctx.filter = 'brightness(140%)';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else if (transformType === 'darken') {
    ctx.filter = 'brightness(60%)';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else if (transformType === 'blur') {
    ctx.filter = 'blur(2px)';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  return canvas;
}

export function generateAugmentedVariants(img) {
  const transforms = ['flip', 'brighten', 'darken', 'blur'];
  return transforms.map(t => {
    const canvas = transformImage(img, t);
    return canvas.toDataURL('image/jpeg', 0.8);
  });
}

export async function runAutoAugment(classId = null, imageIndex = null) {
  // If called directly from an event listener, the first argument is an Event
  if (classId instanceof Event) {
    classId = null;
    imageIndex = null;
  }

  const autoAugmentBtn = document.getElementById('autoAugmentBtn');
  if (autoAugmentBtn) autoAugmentBtn.disabled = true;

  setStatus('🪄 Auto-Augmentation started. Please wait...', 'ready');
  
  let totalNew = 0;
  const targetClasses = classId !== null ? store.classes.filter(c => c.id === classId) : store.classes;
  
  for (const cls of targetClasses) {
    if (cls.embeddings.length === 0) continue;

    // Capture the current length to avoid an infinite loop 
    const originalCount = cls.thumbs.length;
    let addedToClass = 0;

    for (let i = 0; i < originalCount; i++) {
      if (imageIndex !== null && i !== imageIndex) continue;
      
      // Only augment original images
      if (cls.isAugmented[i]) continue;

      const src = cls.thumbs[i];
      if (!src) continue;

      // Load image into DOM memory
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Skip on error
        img.src = src;
      });

      if (!img.complete || img.naturalWidth === 0) continue;

      // Define 4 robust transformations
      const transforms = ['flip', 'brighten', 'darken', 'blur'];

      for (const t of transforms) {
        const canvas = transformImage(img, t);
        
        // Extract embedding using MobileNet
        const emb = extractEmbedding(canvas);
        if (emb) {
          cls.embeddings.push(emb);
          cls.thumbs.push(canvas.toDataURL('image/jpeg', 0.8));
          cls.isAugmented.push(true); // Mark as augmented
          addedToClass++;
          totalNew++;
        }
      }

      // Yield to main thread every few images to prevent UI freeze
      if (i % 5 === 0) {
        setStatus(`🪄 Augmenting "${cls.name}": Processed ${i}/${originalCount} originals`, 'ready');
        updateCountEl(cls.id);
        await delay(10); 
      }
    }
    
    if (addedToClass > 0) {
      updateCountEl(cls.id);
    }
  }

  if (totalNew > 0) {
    finalizeSampleUpdates(`✨ Magic complete! Added ${totalNew} augmented samples.`);
  } else {
    setStatus('No original samples found to augment.', 'ready');
  }

  if (autoAugmentBtn) autoAugmentBtn.disabled = false;
}
