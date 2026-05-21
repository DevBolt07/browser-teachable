// ═══════════════════════════════════════════════════════════════
//  Guided Workflow Engine
//  Manages step-based UI transitions, state management, and
//  progressive disclosure of features
// ═══════════════════════════════════════════════════════════════

export class WorkflowEngine {
  constructor() {
    this.currentStep = 1;
    this.completedSteps = new Set();
    this.stepStates = {
      1: { active: true, completed: false, locked: false },
      2: { active: false, completed: false, locked: true },
      3: { active: false, completed: false, locked: true },
      4: { active: false, completed: false, locked: true },
      5: { active: false, completed: false, locked: true },
      6: { active: false, completed: false, locked: true },
      7: { active: false, completed: false, locked: true },
    };
    this.listeners = [];
  }

  // Register callback for state changes
  onChange(callback) {
    this.listeners.push(callback);
  }

  // Notify all listeners of state change
  notifyChange() {
    this.listeners.forEach(cb => cb({
      currentStep: this.currentStep,
      completedSteps: Array.from(this.completedSteps),
      stepStates: { ...this.stepStates }
    }));
  }

  // Navigate to a specific step
  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 7) return;
    if (this.stepStates[stepNum].locked) {
      console.warn(`Step ${stepNum} is locked`);
      return;
    }
    
    this.currentStep = stepNum;
    this.stepStates[stepNum].active = true;
    
    // Deactivate other steps
    for (let i = 1; i <= 7; i++) {
      if (i !== stepNum) {
        this.stepStates[i].active = false;
      }
    }
    
    this.notifyChange();
  }

  // Mark a step as completed
  completeStep(stepNum) {
    if (this.stepStates[stepNum]) {
      this.stepStates[stepNum].completed = true;
      this.completedSteps.add(stepNum);
      
      // Unlock next step
      if (stepNum < 7) {
        this.stepStates[stepNum + 1].locked = false;
      }
      
      this.notifyChange();
    }
  }

  // Check if current step can proceed
  canProceed() {
    switch (this.currentStep) {
      case 1: return true; // Project creation always allowed
      case 2: return this.completedSteps.has(1); // Need project
      case 3: return this.completedSteps.has(2); // Need classes
      case 4: return this.completedSteps.has(3); // Need dataset
      case 5: return this.completedSteps.has(4); // Need config
      case 6: return this.completedSteps.has(5); // Need training
      case 7: return this.completedSteps.has(6); // Need predictions
      default: return false;
    }
  }

  // Auto-advance to next step
  nextStep() {
    if (this.currentStep < 7) {
      this.completeStep(this.currentStep);
      this.goToStep(this.currentStep + 1);
    }
  }

  // Go back to previous step
  previousStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  // Reset workflow
  reset() {
    this.currentStep = 1;
    this.completedSteps.clear();
    this.stepStates = {
      1: { active: true, completed: false, locked: false },
      2: { active: false, completed: false, locked: true },
      3: { active: false, completed: false, locked: true },
      4: { active: false, completed: false, locked: true },
      5: { active: false, completed: false, locked: true },
      6: { active: false, completed: false, locked: true },
      7: { active: false, completed: false, locked: true },
    };
    this.notifyChange();
  }

  // Get current step info
  getStepInfo(stepNum) {
    return {
      number: stepNum,
      state: this.stepStates[stepNum],
      isActive: this.currentStep === stepNum,
      isCompleted: this.completedSteps.has(stepNum),
    };
  }

  // Get progress percentage
  getProgress() {
    return (this.completedSteps.size / 7) * 100;
  }
}

// Initialize and export singleton
export const workflowEngine = new WorkflowEngine();

// UI renderer for workflow steps
export function renderWorkflowUI() {
  const container = document.getElementById('workflow-container');
  if (!container) return;

  workflowEngine.onChange(state => {
    updateProgressBar(state.currentStep, state.completedSteps.length);
    updateStepPanels(state.currentStep, state.stepStates);
  });
}

function updateProgressBar(currentStep, completedCount) {
  const progressBar = document.getElementById('workflow-progress-bar');
  if (progressBar) {
    const progress = (completedCount / 7) * 100;
    progressBar.style.width = progress + '%';
  }

  const stepCounter = document.getElementById('workflow-step-counter');
  if (stepCounter) {
    stepCounter.textContent = `${currentStep} / 7`;
  }
}

function updateStepPanels(currentStep, stepStates) {
  for (let i = 1; i <= 7; i++) {
    const panel = document.querySelector(`[data-step-panel="${i}"]`);
    if (!panel) continue;

    const state = stepStates[i];
    panel.classList.toggle('active', currentStep === i);
    panel.classList.toggle('completed', state.completed);
    panel.classList.toggle('locked', state.locked);

    // Update button states
    const stepBtn = document.querySelector(`[data-step-btn="${i}"]`);
    if (stepBtn) {
      stepBtn.disabled = state.locked;
      stepBtn.classList.toggle('active', currentStep === i);
      stepBtn.classList.toggle('completed', state.completed);
    }
  }
}
