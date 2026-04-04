import { store } from '../store.js';
import { setStatus } from '../utils.js';
import { drawArchDiagram } from '../visuals/architecture.js';
import { buildClassifier } from './training.js';
import { addNewClass } from '../ui/classes.js';

export async function exportModel() {
  if (!store.classifier) return setStatus('No trained model found to export.', 'error');
  setStatus('💾 Preparing model files for export...', 'ready');
  await store.classifier.save('downloads://model');
  
  const metadata = {
    classes: store.classes.map(c => c.name),
    version: '1.0',
    date: new Date().toISOString()
  };
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metadata));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "metadata.json");
  document.body.appendChild(a);
  a.click();
  a.remove();
  
  setStatus('✅ Model exported successfully.', 'ready');
}

export async function handleModelImport(e) {
  const files = e.target.files;
  if (!files || files.length < 3) return setStatus('⚠️ Select model.json, model.weights.bin, and metadata.json', 'error');

  let jsonFile, weightsFile, metaFile;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (f.name.endsWith('.bin')) weightsFile = f;
    else if (f.name.includes('metadata')) metaFile = f;
    else if (f.name.endsWith('.json')) jsonFile = f;
  }

  if (!jsonFile || !weightsFile || !metaFile) return setStatus('⚠️ Missing required files.', 'error');
  setStatus('📂 Loading model weights...', 'ready');

  try {
    if (store.classifier) store.classifier.dispose();
    store.classifier = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, weightsFile]));
    store.classifier.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const meta = JSON.parse(e.target.result);
      store.classes.forEach(c => c.embeddings.forEach(t => t.dispose()));
      store.classes = [];
      store.nextClassId = 0;
      
      meta.classes.forEach(className => addNewClass(className));

      store.modelTrained = true;
      document.getElementById('predictImgBtn').disabled = false;
      document.getElementById('startLiveBtn').disabled = false;
      document.getElementById('exportBtn').disabled = false;
      
      drawArchDiagram();
      setStatus('🎉 Model loaded successfully!', 'ready');
    };
    reader.readAsText(metaFile);

  } catch (err) {
    setStatus('❌ Error loading model: ' + err.message, 'error');
  }
}
