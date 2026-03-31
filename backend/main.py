from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from datetime import datetime, timedelta

app = FastAPI(title="AGRINOVA API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy ML Setup
dummy_model = RandomForestClassifier(n_estimators=10, random_state=42)
# Create some dummy training data
# Features: N, P, K, temperature, humidity, ph, rainfall
X_dummy = np.random.rand(100, 7) * 100
# Labels classes
crops = ['Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 'Mothbeans', 'Mungbean', 
         'Blackgram', 'Lentil', 'Pomegranate', 'Banana', 'Mango', 'Grapes', 'Watermelon', 
         'Muskmelon', 'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee']
y_dummy = [random.choice(crops) for _ in range(100)]
dummy_model.fit(X_dummy, y_dummy)

class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class OptionalImage(BaseModel):
    image_url: str = None

@app.get("/")
def read_root():
    return {"message": "Welcome to AGRINOVA API"}

@app.post("/predict-crop")
def predict_crop(data: CropInput):
    # Predict using the dummy model
    features = np.array([[data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]])
    prediction = dummy_model.predict(features)[0]
    
    # Generate list of mixed crop types
    other_crops = random.sample([c for c in crops if c != prediction], 3)
    
    recommendations = []
    recommendations.append({
        "crop": prediction,
        "type": random.choice(["Vegetable", "Cereal", "Fruit", "Legume"]),
        "success_rate": random.randint(88, 98),
        "duration": f"{random.randint(45, 60)}-{random.randint(65, 90)} days",
        "difficulty": "Easy"
    })
    
    for c in other_crops:
        recommendations.append({
            "crop": c,
            "type": random.choice(["Vegetable", "Cereal", "Fruit", "Legume"]),
            "success_rate": random.randint(65, 87),
            "duration": f"{random.randint(45, 60)}-{random.randint(65, 90)} days",
            "difficulty": random.choice(["Easy", "Medium", "Hard"])
        })
    return recommendations
        
import requests
import google.generativeai as genai

genai.configure(api_key="AIzaSyDTg8mzRqggkvDqhmzO7c6FURT7inpIyl4")
# Use the correct model series available to this API key in 2026
gemini_model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"temperature": 0.7, "max_output_tokens": 800})

class ChatInput(BaseModel):
    message: str
    history: list = []

@app.post("/chat")
def handle_chat(data: ChatInput):
    # Constructing a conversation string with System context
    prompt = "You are AgriovaA AI, an expert smartest crop and smart-farming assistant. When asked about crops, try formatting your data elegantly using markdown tables (e.g. | Crop | Duration | Difficulty |). Keep answers concise and helpful.\n\n"
    
    for h in data.history[-6:]:
        role = "AI" if h.get('sender') == 'ai' else "User"
        prompt += f"{role}: {h.get('text')}\n"
        
    prompt += f"User: {data.message}\nAI:"
    
    try:
        res = gemini_model.generate_content(prompt)
        return {"response": res.text}
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print("Gemini Error:", error_details)
        return {"response": f"Sorry, I am having trouble connecting to my AI brain at the moment. Error: {str(e)}"}


@app.get("/weather")
def get_weather(lat: float = 17.385, lon: float = 78.4867):
    # Fetch real data from completely free Open-Meteo API (No Key Required!)
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # Helper to convert WMO weather code to icon/condition
        def get_condition(code):
            if code == 0: return "Clear Sky", "sun"
            elif code in [1, 2, 3]: return "Partly Cloudy", "cloud"
            elif code in [45, 48]: return "Fog", "cloud"
            elif code in [51, 53, 55, 61, 63, 65, 80, 81, 82]: return "Rain", "cloud-rain"
            elif code in [71, 73, 75, 77, 85, 86]: return "Snow", "cloud-snow"
            elif code in [95, 96, 99]: return "Thunderstorm", "cloud-lightning"
            return "Unknown", "cloud"

        current_cond, _ = get_condition(data['current']['weather_code'])
        
        # Build hourly
        now = datetime.now()
        current_hour_idx = next((i for i, t in enumerate(data['hourly']['time']) if datetime.fromisoformat(t) > now), 0)
        
        hourly = []
        for i in range(5):
            idx = current_hour_idx + i
            if idx < len(data['hourly']['time']):
                time_obj = datetime.fromisoformat(data['hourly']['time'][idx])
                cond_text, icon = get_condition(data['hourly']['weather_code'][idx])
                hourly.append({
                    "time": time_obj.strftime("%H:00"),
                    "temp": round(data['hourly']['temperature_2m'][idx]),
                    "pop": data['hourly']['precipitation_probability'][idx],
                    "icon": icon,
                    "condition": cond_text,
                    "humidity": round(data['hourly']['relative_humidity_2m'][idx]),
                    "wind": round(data['hourly']['wind_speed_10m'][idx])
                })
                
        # Build daily
        daily = []
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for i in range(7):
            date_obj = datetime.fromisoformat(data['daily']['time'][i])
            day_str = "Today" if i == 0 else days[date_obj.weekday()]
            daily.append({
                "day": day_str,
                "high": round(data['daily']['temperature_2m_max'][i]),
                "low": round(data['daily']['temperature_2m_min'][i]),
                "rain_prob": data['daily']['precipitation_probability_max'][i]
            })
            
        return {
            "current": {
                "temp": round(data['current']['temperature_2m']),
                "condition": current_cond,
                "feels_like": round(data['current']['apparent_temperature']),
                "humidity": data['current']['relative_humidity_2m'],
                "wind": round(data['current']['wind_speed_10m']),
                "uv": 6, # Open meteo requires extra params for UV, hardcoding standard
                "visibility": 10
            },
            "hourly": hourly,
            "daily": daily
        }
    except Exception as e:
        print(f"Weather API Error: {e}")
        # Fallback to dummy data gracefully
        return {
            "current": {"temp": 28, "condition": "Partly Cloudy", "feels_like": 31, "humidity": 65, "wind": 12},
            "hourly": [{"time": "12:00", "temp": 28, "pop": 10, "icon": "sun"}],
            "daily": [{"day": "Today", "high": 31, "low": 24, "rain_prob": 10}]
        }

@app.post("/disease-detect")
def detect_disease(data: OptionalImage = None):
    if not data or not data.image_url:
        return {"disease": "Unknown", "confidence": 0, "status": "Error"}
        
    try:
        import re
        import base64
        import json
        
        # Strip data URL scheme prefix
        b64_data = re.sub('^data:image/.+;base64,', '', data.image_url)
        img_bytes = base64.b64decode(b64_data)
        
        prompt = "You are an expert plant pathologist AI. Analyze this plant/leaf image. Identify any visible diseases, pests, or nutrient deficiencies. Reply ONLY with a valid JSON format EXACTLY like this: {\"disease\": \"Name of disease or Healthy\", \"confidence\": 95, \"status\": \"Infected\" (if diseased) or \"Healthy\"}. Return absolutely no markdown strings, just the raw JSON braces."
        
        # Using the same gemini_model initialized for Chat, as gemini-2.5-flash natively supports multimodal
        res = gemini_model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": img_bytes}
        ])
        
        # Clean response 
        clean_json_str = res.text.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean_json_str)
        
        # Enforce basic constraints
        if 'disease' not in result: result['disease'] = "Unknown"
        if 'confidence' not in result: result['confidence'] = 80
        if 'status' not in result: result['status'] = "Error"
            
        return result
        
    except Exception as e:
        import traceback
        print("Vision AI Error:", traceback.format_exc())
        return {
            "disease": "Unable to verify. Move closer or ensure it's a plant.",
            "confidence": 0,
            "status": "Healthy" 
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
