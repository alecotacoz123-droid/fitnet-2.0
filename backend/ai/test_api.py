import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction="Eres FitNet Coach"
    )
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message("hola")
    print(response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
