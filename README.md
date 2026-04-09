<div align="center">
  <h1>🛡️ ClaimLens AI <span>— InsurTech Triage Suite</span></h1>
  <p>A B2B browser-based edge AI solution for zero-trust vehicle damage classification.</p>
</div>

<br>

## 📚 Overview

**ClaimLens AI** is an end-to-end, privacy-friendly InsurTech web application designed to solve the two biggest bottlenecks in modern auto insurance: **Field Scalability** and **Upload Fraud**. 

By bringing neural network computation directly to the client's device using `TensorFlow.js` and `MobileNet v1`, ClaimLens removes the need for physical surveyor dispatches for minor claims, while strictly preventing users from uploading older/fraudulent images. 

### Why Browser-Based Edge AI?
Traditional solutions require uploading heavy video feeds to expensive cloud GPUs. By processing live camera streams natively via WebGL in the user's browser, ClaimLens achieves:
* **Zero-Latency Inferences:** Processing every ~150ms directly on the device.
* **Privacy by Design:** No customer images are sent to the server for processing.
* **High Fraud Resistance:** Mandatory live hardware access prevents gallery spoofing.

---

## 🏗️ The 3-Tier Architecture Flow

The system acts as a complete lifecycle, connecting three distinct organizational roles inside a unified database-free mock environment (powered by `localStorage` for demo capabilities).

### 1️⃣ The Underwriter (Admin Lab)
* **Goal:** Create and export a localized AI Model.
* **Flow:** The Lead Admin uses `index.html` to collect visual examples of local vehicular damage (e.g., dents, scratches) vs. clean vehicles. They train a custom Dense layer atop the frozen MobileNet baseline, and export the resulting Weights and JSON Topology into the central `/model/` directory.

### 2️⃣ The Claimant (Zero-Trust Link)
* **Goal:** Scale data gathering securely without agent dispatch.
* **Flow:** A unique `customer-link.html` URL is sent to the claimant. The app disables file managers entirely and locks onto the environment camera. The claimant walks around the damaged vehicle. Once the AI hits a **>85% confidence threshold**, it *auto-captures* the frame, injects a simulated Deep-Learning Heatmap and a GPS geolocation-stamp, auto-submits the claim to the surveyor inbox, and still lets the claimant download a PDF copy.

### 3️⃣ The Surveyor (Agent Portal)
* **Goal:** Human-in-the-loop validation & Enterprise Reporting.
* **Flow:** The field agent logs into `agent.html`, checks the unified **Claim Inbox**, and reviews the autonomous submissions. They review the visual Heatmap array, GPS verification, reject/approve the claim, and can instantly generate an official **A4 PDF Risk Assessment Document**.

---

## 🚀 How to Run the Project (Locally)

Because this app utilizes strict WebRTC APIs (`getUserMedia`) and Fetch APIs for the model weights, **it cannot be run by simply double-clicking the HTML files**. It must be run over a local web server (HTTP).

### Prerequisites
* You need **Node.js** installed on your system.
* Optionally, your trained AI models inside the `/model/` directory.

### Execution Steps
1. **Clone or Download** this directory.
2. Open your terminal inside the project folder (`glassbox-ai`).
3. Start a local server utilizing `npx`:
   ```bash
   npx serve .
   ```
4. **Access the application URLs** in your browser:
   * **Login Gateway:** `http://localhost:3000/login.html`

### 🔑 Demo Login Credentials
| Role | User ID | Password | Access Portal |
| --- | --- | --- | --- |
| Data Scientist | `admin` | `admin` | `index.html` (Admin Lab) |
| Surveyor | `agent` | `agent` | `agent.html` (Agent Portal) |
| Customer | `customer` | `customer` | `customer-link.html` (Intake Link) |

---

## 🛠️ Tech Stack & Constraints

* **Core Frameworks:** 100% Vanilla HTML, CSS, JavaScript.
* **Machine Learning:** `TensorFlow.js` v4.14, `@tensorflow-models/mobilenet`.
* **State Management:** In-browser `localStorage` engine (simulating a PostgreSQL/Mongo Backend for seamless cross-tab claimant evaluations).
* **Limitations:** Relies on modern browsers supporting WebRTC and WebGL processing.

---

<div align="center">
  <i>Developed for Enterprise Insurance Hackathon Evaluation.</i>
</div>
