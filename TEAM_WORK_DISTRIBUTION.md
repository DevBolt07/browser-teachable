# 🤝 Team Work Distribution & Project Review

*ModelForge AI Studio - Browser-based Edge AI Platform*

---

## 👤 Member 1: Core AI Engine & Admin Training Lab
**Role Summary:** Member 1 is the "Lead Machine Learning Engineer." They built the core application that loads the baseline AI (TensorFlow MobileNet) and created the administrative interface (`index.html`) that allows users to create classification classes and collect training datasets.

### 📂 Code Related Files
* `js/ml/mobilenet.js` & `js/ml/dataset.js`
* `js/ui/classes.js` & `js/ml/training.js`
* `index.html` (Admin Layout)

### ⚙️ Functionality Explained Simply
* **`loadMobileNet()` & Training Loop:** Initializes the 1024-Dimension neural network. They wrote the code that trains a custom classification layer using the Adam optimizer across user-defined epochs.
* **`buildClassifier()`:** Builds the dynamic dense-layer "mini-brain" on top of MobileNet to categorize custom images.
* **Data Quality Dashboard:** Built the variance safety checks and thumbnail previews so that bad data doesn't corrupt the training cycle.

---

## 👤 Member 2: Dataset Labeling Studio & Augmentation Engine
**Role Summary:** Member 2 is the "Data Engineering Specialist." They were responsible for developing the built-in Dataset Labeling Studio, empowering users to clean and augment data before training.

### 📂 Code Related Files
* `js/ui/labeling-studio.js`
* `index.html` (Dataset Studio UI)
* `css/styles.css` (Grid layouts & Flexbox)

### ⚙️ Functionality Explained Simply
* **Advanced Visual Filters:** Integrated sliders for Brightness, Contrast, Grayscale, Blur, and Binarization using CSS hardware-accelerated rendering.
* **Spatial Transforms:** Wrote the Canvas geometry logic for drag-and-drop bounding box cropping and image rotation.
* **Data Augmentation:** Developed the "Save as Copy" workflow, allowing synthetic dataset multiplication directly in the browser to prevent model overfitting.

---

## 👤 Member 3: Field Portals & Inference Logic
**Role Summary:** Member 3 is the "Full-Stack Deployment Engineer." They developed the field/testing portals (`agent.html` and `customer-link.html`) stripping away complex ML controls for a clean, operational UI.

### 📂 Code Related Files
* `agent.html` & `customer-link.html`
* Inline field logic and stream handling

### ⚙️ Functionality Explained Simply
* **WebRTC Live Stream:** Created the logic that hooks into mobile/tablet cameras seamlessly via HTML5.
* **Real-time Inference Loop:** Managed the `requestAnimationFrame` loop that constantly pings the newly trained AI model for predictions.
* **Confidence Progress Bars:** Implemented the UI loops to parse the raw array of probabilities and generate real-time visual progress bars.

---

## 👤 Member 4: Model Persistence & Storage
**Role Summary:** Member 4 is the "Database Architect." They built the critical bridge between the ModelForge Studio and external deployments by creating a file-based sharing mechanism.

### 📂 Code Related Files
* `js/ml/persistence.js`
* Model import logic

### ⚙️ Functionality Explained Simply
* **`exportModel()`:** Intercepts the completed training weights and topological layout and forces the browser to serialize them into `.json` and `.bin` physical files.
* **Metadata Construction:** Zips up the user-created Class names into a `metadata.json` file so the neural network remembers what text to output.
* **File Upload Reader:** Built the logic to read multiple files simultaneously, parse the weights, and re-hydrate the TensorFlow layers seamlessly.

---

## 👤 Member 5: Security, UI/UX, & Deep Visualizations
**Role Summary:** Member 5 is the "Frontend & Analytics Lead." They handled authentication routing and built the deep visual inspectors for debugging the AI.

### 📂 Code Related Files
* `login.html`
* `js/visuals/inspector.js`
* `js/visuals/internals.js`

### ⚙️ Functionality Explained Simply
* **Enterprise Login Gateway:** Designed the secure `login.html` wall that routes users to different workspaces based on their credentials.
* **Live Pipeline Inspector:** Created the 5-panel X-Ray view in the Studio so the team could debug *why* the AI made a decision, drawing heatmaps and tensor graphs.
* **Activation Attention Mapping:** Developed the logic that paints a glowing "heat" map over images to show which physical area the computer was focusing on during prediction.

---

### 🎓 Summary for Presentation
> *"Our project transitioned from a basic tech-demo into **ModelForge AI Studio**, a professional, zero-latency Edge AI platform. We divided the work functionally: The Core ML Engine (Training), The Preprocessing Pipeline (Labeling Studio & Augmentation), Field Deployment (Agent Portals), Model Persistence (Export/Import), and Analytics/UX. This architecture strictly separates the backend mathematics from data engineering and frontend usability, perfectly replicating a real-world MLOps software lifecycle."*
