<div align="center">
  <h1>⚒️ ModelForge AI Studio</h1>
  <p>An advanced, browser-based Edge AI platform for dataset preprocessing, training, and zero-latency inference.</p>
</div>

<br>

## 📚 Overview

**ModelForge AI Studio** is an end-to-end Machine Learning environment built entirely in the browser. It democratizes AI development by allowing data scientists, developers, and researchers to curate datasets, preprocess images, train custom Neural Networks, and test predictions without needing expensive cloud GPUs or complex Python environments.

By bringing neural network computation directly to the client's device using `TensorFlow.js` and `MobileNet v1`, ModelForge ensures:
* **Zero-Latency Inferences:** Processing happens natively via WebGL directly on the device.
* **Privacy by Design:** No user datasets or images are sent to external servers for processing.
* **Rapid Prototyping:** Go from raw data to a deployable model in minutes.

---

## 🏗️ Core Platform Features

### 1️⃣ Advanced Dataset Labeling & Augmentation Studio
Data quality defines AI accuracy. ModelForge features a built-in, professional-grade preprocessing suite:
* **Visual Transformations:** Adjust brightness, contrast, and saturation on the fly.
* **Spatial Cropping:** Drag-and-drop crop boxes to remove background noise and focus the model on the subject.
* **Granular 3-Tier Auto-Augmentation:** A procedural data-synthesis engine that combats model overfitting by instantly generating robust image variations (flips, brightness shifts, blurs). Features three levels of control:
  1. **Global:** 1-click massive synthetic expansion of the entire dataset.
  2. **Class-Level:** Augment specific target classes to fix dataset imbalances.
  3. **Image-Level:** A visual, interactive Studio UI to preview, accept, or reject AI-generated variants of a single target image.

### 2️⃣ Explainable AI (XAI) Heatmap Engine
ModelForge natively integrates algorithmic transparency, a crucial feature for enterprise AI compliance.
* **Occlusion Sensitivity Mapping:** The client-side XAI engine slides a masking window across the live inference stream, mathematically calculating which precise pixel clusters trigger the neural network's decision.
* **High-Fidelity Visual Overlays:** Generates a real-time, color-coded heatmap over the webcam feed or uploaded image, proving *why* the AI made its prediction.

### 3️⃣ Zero-Config Edge Training
* **Transfer Learning:** Train a custom Dense layer atop the frozen MobileNet baseline directly in your browser.
* **Real-time Monitoring:** Watch loss and accuracy metrics converge in real-time via interactive charts.
* **Model Export:** Export the resulting Weights and JSON Topology directly to your local file system for deployment in any JS/Node environment.

### 3️⃣ Live Inference & Testing
* Test your newly trained model instantly using webcam feeds or file uploads.
* View class confidence distribution arrays and embedding distances in real-time.

---

## 🚀 How to Run the Project (Locally)

Because this application utilizes strict WebRTC APIs (`getUserMedia`) and Fetch APIs for the model weights, **it cannot be run by simply double-clicking the HTML files**. It must be served over a local HTTP web server.

### Execution Steps
1. **Clone or Download** this directory.
2. Open your terminal inside the project folder.
3. Start a local server utilizing `npx`:
   ```bash
   npx serve .
   ```
4. **Access the application URLs** in your browser:
   * **Main Studio:** `http://localhost:3000/index.html`

---

## 🛠️ Tech Stack & Constraints

* **Core Frameworks:** Vanilla HTML5, CSS3, JavaScript (ES6+).
* **Machine Learning Engine:** `TensorFlow.js` v4.14, `@tensorflow-models/mobilenet`.
* **State Management:** In-browser `localStorage` engine and contextual JS closures.
* **Limitations:** Relies on modern browsers supporting WebRTC and WebGL hardware acceleration.
