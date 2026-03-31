# 🌱 AGRINOVA

**The Complete Smart Farming Assistant** - A next-generation intelligent platform that empowers farmers with location-aware data, real-time market trends, generative AI disease detection, and crop recommendations.

## 🚀 Features
- **Personalized Dashboard:** Centralized metrics adapting to your localized farm acreage and soil type.
- **Smart AI Disease Detection:** Upload or snap pictures of your crops for instant disease analysis powered by Gemini Vision.
- **Interactive Weather Forecasting:** Hourly fluid timelines and 7-day rainfall graphs driven by live Open-Meteo satellite arrays.
- **Market Intelligence:** Track real-time localized commodity prices, trends, and supply vs. demand differentials.
- **AGRINOVA AI Chatbot:** Your dedicated smart farming conversational agent available 24/7.
- **Modern UI Edge:** Native slide-out navigation routing and instant Light/Dark mode transitions.

## ⚙️ Tech Stack
* **Frontend UI:** React.js, React Router, Tailwind-inspired Vanilla, Lucide Icons, Axios.
* **Backend API & ML Engine:** Python, FastAPI, Uvicorn, Scikit-learn, Google GenerativeAI.

---

## 🛠️ System Installation & Quick-Start Guide

Running AGRINOVA requires two terminal windows—one for the Backend API, and one for the Frontend UI.

### 1. Boot up the Backend Server

Open your terminal and navigate to the backend folder:
```bash
cd backend
```

Generate a secure virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment (Windows Powershell):
```bash
.\venv\Scripts\activate
```
*(Mac/Linux developers: `source venv/bin/activate`)*

Install the intelligence core dependencies:
```bash
pip install fastapi uvicorn requests scikit-learn numpy google-generativeai pydantic
```

Spin up the Uvicorn host server:
```bash
uvicorn main:app --reload
```
✅ *Your API should now actively report online at `http://localhost:8000`*

---

### 2. Launch the Web Platform

Open a **new, separate terminal** tab or window and navigate to the frontend folder:
```bash
cd frontend
```

Download and install rendering dependencies:
```bash
npm install
```

Start the React user interface development daemon:
```bash
npm start
```
🌟 *AGRINOVA will automatically fire up inside your default browser at `http://localhost:3000`*

---

## 🔑 Customizations & Deployment Note
Currently, the prototype uses an integrated Gemini API configuration. To securely scale the conversational intelligence and disease detection, consider creating an `.env` wrapper around `genai.configure(api_key="YOUR_KEY")` in `main.py`!
