# 🏗️ ConstructAI Monitor - Next-Gen AI Construction Dashboard

**ConstructAI Monitor** is an advanced "Digital Twin" application designed to bridge the gap between architectural design (BIM) and on-site reality. Powered by **Google Gemini 2.5**, it utilizes drone photogrammetry, live camera feeds, and AI vision to monitor construction progress, audit inventory, and ensure regulatory compliance in real-time.

![App Screenshot Placeholder](https://via.placeholder.com/1200x600?text=ConstructAI+Dashboard+Preview)

## 🚀 Key Features

### 1. 🌐 Master 3D Digital Twin
*   **Immersive Visualization:** A centralized 3D environment that aggregates data from Lidar, BIM models, and Drone Photogrammetry.
*   **Layer Management:** Toggle visibility for Structural, MEP, Electrical, and Facade layers.
*   **Visual Progress Tracking:**
    *   🔴 **Red Lines:** Planned work (from BIM).
    *   🔵 **Blue Lines:** Work In-Progress (Live AI detection).
    *   🟢 **Green Lines:** Verified/Completed work.

### 2. 📹 Multi-Camera Live Network
*   **Centralized Monitoring:** Connect and switch between multiple video feeds (Fixed Cranes, Drones, Rovers).
*   **PIP Mode:** View specific camera feeds alongside the Master 3D Twin in a "Picture-in-Picture" layout.
*   **AI Overlay:** Live heads-up display (HUD) showing object detection confidence and safety zone monitoring.

### 3. 📝 Project Progress & BOQ (Bill of Quantities)
*   **Automated Time-Stamping:** Tracks start/end times for tasks like Excavation and Foundation pouring.
*   **Cost Analysis:** Real-time calculation of material costs and labor hours.
*   **Detailed BOQ:** Breakdown of materials used per task with options to export data to Excel/Google Sheets.

### 4. 📦 Smart Inventory & AI Auditing
*   **Invoice Scanning:** Uses **Gemini 2.5 Flash** to parse uploaded invoices and cross-reference them with current stock levels.
*   **Anomaly Detection:** automatically flags discrepancies between ordered materials and delivered quantities.
*   **Restock Alerts:** Visual indicators for low-stock items with one-click reorder requests.

### 5. 🤖 AI Regulatory Assistant
*   **Context-Aware Chat:** Built-in AI assistant trained on **Indian Construction Codes (IS Codes)** and International Safety Standards.
*   **Instant Advice:** Engineers can ask questions like *"What is the minimum curing time for M25 concrete?"* and get instant answers.

## 🛠️ Tech Stack

*   **Frontend:** React 19 (TypeScript)
*   **Styling:** Tailwind CSS (Dark Mode / Technical Dashboard Aesthetic)
*   **Icons:** Lucide React
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
    *   *Model:* Gemini 2.5 Flash (for Image Analysis & JSON Reasoning)
*   **State Management:** React Hooks
*   **Build Tool:** Vite

## 🧠 AI Workflow

1.  **Input:** The app accepts inputs from Site Cameras, Drones, and PDF Invoices.
2.  **Processing:**
    *   **Vision:** Photogrammetry algorithms stitch drone shots into 3D meshes.
    *   **Gemini AI:** Analyzes visual data to generate JSON status reports and safety alerts.
3.  **Output:** The dashboard renders a synchronized "Digital Twin" where the virtual model updates to reflect the physical site reality.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/constructai-monitor.git

# Navigate to project directory
cd constructai-monitor

# Install dependencies
npm install

# Set up API Key
# Create a .env file and add your Google Gemini API Key
echo "API_KEY=your_google_genai_api_key" > .env

# Run the development server
npm run dev
```

## 🔮 Future Roadmap

*   **Lidar Point Cloud Streaming:** Direct integration with `.las` files for sub-millimeter accuracy.
*   **Predictive Scheduling:** Using AI to predict delays based on weather and supply chain data.
*   **VR Walkthroughs:** Oculus/Vision Pro integration for remote site visits.

---

**License:** MIT
**Author:** [Your Name/Organization]