const STEP_IDS = ['upload', 'label', 'train', 'predict'];

let currentStep = 'upload';
let idleTimer = null;

function el(id) {
  return document.getElementById(id);
}

function stepEl(step) {
  return document.querySelector(`.workflow-step[data-step="${step}"]`);
}

function messageFor(step) {
  if (step === 'upload') return 'Import dataset folder to create classes quickly.';
  if (step === 'label') return 'Open Dataset Studio, edit image, then add labeled sample.';
  if (step === 'train') return 'Collect at least 2 samples per class, then click Train Model.';
  return 'Use Predict Image or Start Live to test your model.';
}

function scrollCard(step) {
  const map = {
    upload: 'uploadCard',
    label: 'labelCard',
    train: 'trainCard',
    predict: 'predictCard'
  };
  const target = el(map[step]);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function triggerPrimary(step) {
  if (step === 'upload') {
    const input = el('datasetFolderInput');
    if (input) input.click();
  }
  if (step === 'label') {
    const openStudioBtn = el('openStudioBtn');
    if (openStudioBtn && !openStudioBtn.disabled) openStudioBtn.click();
  }
}

function clearHints() {
  document.querySelectorAll('.workflow-step').forEach(button => button.classList.remove('current-hint'));
}

function restartIdleHint() {
  if (idleTimer) clearTimeout(idleTimer);
  clearHints();
  idleTimer = setTimeout(() => {
    const target = stepEl(currentStep);
    if (target) target.classList.add('current-hint');
    const hint = el('workflowHint');
    if (hint) hint.textContent = `${messageFor(currentStep)} (Tip: hover the step and click Go)`;
  }, 9000);
}

function renderWorkflow() {
  STEP_IDS.forEach((step, idx) => {
    const btn = stepEl(step);
    if (!btn) return;
    btn.classList.remove('active', 'done');
    const currIndex = STEP_IDS.indexOf(currentStep);
    if (idx < currIndex) btn.classList.add('done');
    if (idx === currIndex) btn.classList.add('active');
  });
  const hint = el('workflowHint');
  if (hint) hint.textContent = messageFor(currentStep);
  restartIdleHint();
}

export function refreshWorkflowStep(step) {
  if (step) currentStep = step;
  renderWorkflow();
}

export function setupGuidedWorkflow() {
  document.querySelectorAll('.workflow-step').forEach(button => {
    button.addEventListener('click', () => {
      const step = button.getAttribute('data-step');
      currentStep = step;
      renderWorkflow();
      scrollCard(step);
      triggerPrimary(step);
    });
  });

  ['click', 'keydown', 'pointerdown'].forEach(name =>
    document.addEventListener(name, () => restartIdleHint(), { passive: true })
  );

  refreshWorkflowStep('upload');
}
