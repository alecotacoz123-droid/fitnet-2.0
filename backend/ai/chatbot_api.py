import os
from dotenv import load_dotenv
import google.generativeai as genai

# Cargar variables de entorno
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Configurar el modelo con el prompt del sistema
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction="""Eres FitNet Coach, el entrenador personal inteligente y amigable de la plataforma fitness FitNet.
        Tu rol es responder cualquier pregunta sobre entrenamiento, nutrición, hipertrofia, pérdida de grasa, rutinas, lesiones (recomendando ir al médico) y mentalidad fitness.
        Habla con un tono profesional, motivador y usa lenguaje claro. No des consejos médicos diagnosticados, enfócate en la parte deportiva. 
        Mantén tus respuestas relativamente cortas (máximo 2 o 3 párrafos) ya que se muestran en un chat en tiempo real."""
    )
else:
    model = None

def get_chatbot_response(message, context=""):
    try:
        if not model:
            return "Lo siento, la clave API de Gemini no está configurada. Por favor, revisa el archivo .env en el servidor."
        
        # Enviar el mensaje a Gemini (Sin estado para no mezclar usuarios)
        full_prompt = message
        if context:
            full_prompt = f"Contexto del usuario actual:\n{context}\n\nPregunta del usuario: {message}"
            
        response = model.generate_content(full_prompt)
        return response.text
        
    except Exception as e:
        print(f"Error connecting to Gemini (Fallback to local logic): {e}")
        # Fallback local (Sin gastar tokens)
        msg_lower = message.lower()
        if any(k in msg_lower for k in ["proteina", "proteína", "batido"]):
            return "Se recomienda consumir entre 1.6g y 2.2g de proteína por kg de peso corporal para ganar masa muscular."
        elif any(k in msg_lower for k in ["creatina", "creatine"]):
            return "La creatina es el suplemento más estudiado. Toma de 3 a 5 gramos diarios, todos los días. No necesitas fase de carga."
        elif any(k in msg_lower for k in ["grasa", "bajar de peso", "adelgazar", "definicion", "definición", "perder"]):
            return "Para perder grasa, la clave es mantener un déficit calórico de 300-500 kcal diarias, junto a entrenamiento de fuerza."
        elif "principiante" in msg_lower and ("rutina" in msg_lower or "empezar" in msg_lower):
            return "Para principiantes, una rutina Full Body 3 días a la semana es ideal: 3x10 Sentadillas, 3x10 Flexiones y 30s de plancha."
        elif any(k in msg_lower for k in ["lesion", "lesión", "dolor"]):
            return "Si sientes dolor agudo o punzante, DETÉN EL EJERCICIO. Aplica hielo si hay inflamación aguda y consulta a un fisioterapeuta."
        elif any(k in msg_lower for k in ["hola", "buenas"]):
            return "¡Hola! Soy tu asistente FitNet. ¿Qué duda tienes sobre entrenamiento o nutrición hoy?"
        else:
            return "Disculpa, el motor principal de IA está ocupado ahora mismo. Pero estoy aquí como tu Coach FitNet, pregúntame algo básico de nutrición o rutinas."
