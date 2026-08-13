import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {api_key is not None}")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Hola")
    print(response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
