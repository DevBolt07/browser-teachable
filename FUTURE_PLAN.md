# 🚀 ClaimLens AI — Platform Evolution & Future Plan

This document outlines the strategic roadmap for transitioning **ClaimLens AI** from a prototype InsurTech application into a fully-fledged, modular **Edge AI B2B Platform**.

The following milestones are designed for future sprints to enhance neural network explainability (XAI), boost deep-learning accuracy through automated dataset augmentation, and seamlessly decouple the core engine from a single industry.

---

## 📅 Milestone 1: True Explainable AI (XAI) Engine
**Objective:** Replace UI-based heuristic heatmaps with mathematically verifiable algorithmic transparency.

### The Problem
Currently, the customer-facing portal generates simulated radial heatmaps to visually ground the AI's logic. As per strict enterprise compliance standards, underwriters require mathematical proof of *why* the AI flagged a specific region as "Damage" before approving payouts.

### The Implementation Strategy (Occlusion Sensitivity Mapping)
We will introduce a purely client-side XAI Engine inside the **Agent Portal**:
* **Mechanism:** The internal algorithm will iteratively mask (occlude) small sections of the captured evidence image (`32x32 pixel patches`) using a sliding window loop, parsing each occluded frame through the loaded `MobileNet` model.
* **Math Trigger:** If blocking a specific coordinate chunk causes the model's damage-confidence score to suddenly crash (e.g., dropping from `92%` to `31%`), that exact coordinate is mathematically verified as the *critical feature point* (the actual dent or scratch).
* **Delivery:** A color-coded, high-fidelity matrix will map these drops in confidence, generating a 100% genuine, data-driven analytical Heatmap for Surveyor PDF Reports.

---

## 📅 Milestone 2: Automated Edge Data Augmentation
**Objective:** Maximize Edge AI accuracy without demanding massive, manual datasets from Data Scientists.

### The Problem
Building robust models via the Admin Lab (`index.html`) requires dozens of high-quality, diverse images per classification class. However, Field Agents often lack sufficient training data when rapidly prototyping new risk categories.

### The Implementation Strategy (Client-side Multiplication)
We will integrate an automated pre-processing Augmentation Engine leveraging HTML5 WebGL and `<canvas>` operations prior to the `TFJS` embedding extraction. 
* **Mechanism:** When an administrator uploads a single training image, the JavaScript engine will synchronously generate 4 hidden synthetic variations:
  1. Horizontal Flip (`ctx.scale(-1, 1)`)
  2. Diagonal Rotation (`±15 degrees skew`)
  3. Gamma/Brightness Shift (Simulating night-time / harsh sunlight glare)
  4. Slight Gaussian Blur (Simulating low-quality customer smartphone cameras)
* **Result:** A baseline of 10 uploaded images will be synthetically expanded to 50 diverse tensors. This exponentially reduces *Model Overfitting*, creating an incredibly resilient logic engine.

---

## 📅 Milestone 3: Dynamic Multi-Industry Architecture
**Objective:** Systematically abstract the specific "Automotive Insurance" logic, proving the application can be white-labeled for immense adjacent enterprise markets.

### The Problem
The current frontend hardcodes specific terminology like "Vehicle Inspection", "Surveyor", and "Rescan Car". To scale the B2B SaaS pitch, the core Neural Engine needs to demonstrate that it is mathematically agnostic to the domain it operates in.

### The Implementation Strategy (JSON Config Driven Matrix)
Integration of a **Platform Bootloader** drop-down on the Login Gateway (`login.html`), pivoting the deployment across multiple sectors:

1. **InsurTech Mode (Default):** Auto Claims, Dents, Agent Field Dispatch.
2. **AgriTech Mode:** Crop Disease Scanning, Leaf Discoloration, Harvest Quality Assessment.
3. **Manufacturing Mode:** Assembly line defect detection, PCB flaw spotting.

* **Mechanism:** Upon selection, a universal `themeConfig` state object injects a new dictionary of strings and CSS token overrides into the central DOM. The underlying `TensorFlow.js` pipeline computationally performs the exact same mathematical operations. This perfectly illustrates the massive scalability and valuation of our underlying Edge AI processing core.
