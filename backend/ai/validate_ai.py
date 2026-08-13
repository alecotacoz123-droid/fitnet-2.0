import time
import sys
from classifier import VideoClassifier
from chatbot_api import get_chatbot_response

# Helper to normalize strings for testing (removes accents)
def normalize_str(text):
    text = text.lower()
    replacements = (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"))
    for a, b in replacements:
        text = text.replace(a, b)
    return text

def validate_video_classifier():
    print("--------------------------------------------------")
    print("[TEST] Validando Clasificador de Videos (HU-10 / RNF-16)...")
    print("--------------------------------------------------")
    
    classifier = VideoClassifier()
    
    # Datos de prueba etiquetados (Ground Truth)
    test_cases = [
        {"title": "Rutina de sentadillas profundas", "content": "Entrenando piernas", "true_class": "Squats"},
        {"title": "Como hacer squats con barra", "content": "Para gluteos", "true_class": "Squats"},
        {"title": "Flexiones de pecho inclinadas", "content": "Trabajando triceps", "true_class": "Pushups"},
        {"title": "Pushups challenge", "content": "100 repeticiones diarias", "true_class": "Pushups"},
        {"title": "Bicep curl con mancuernas", "content": "Brazos fuertes", "true_class": "Bicep Curl"},
        {"title": "Curl de biceps concentrado", "content": "Rutina de brazos", "true_class": "Bicep Curl"},
        {"title": "Plancha abdominal de 5 minutos", "content": "Fortaleciendo el core", "true_class": "Plank"},
        {"title": "Plank de acero", "content": "Abdominales marcados", "true_class": "Plank"},
        {"title": "Corriendo 10k en el parque", "content": "Sesion de running cardio", "true_class": "Running"},
        {"title": "Treadmill cardio session", "content": "Trote suave", "true_class": "Running"},
        {"title": "Peso muerto rumano tecnica", "content": "Espalda y femorales", "true_class": "Deadlift"},
        {"title": "Deadlift pesado hoy", "content": "Nuevo record personal", "true_class": "Deadlift"},
    ]
    
    hits = 0
    total = len(test_cases)
    
    # Metricas por clase
    classes = ["Squats", "Pushups", "Bicep Curl", "Plank", "Running", "Deadlift"]
    tp = {c: 0 for c in classes}
    fp = {c: 0 for c in classes}
    fn = {c: 0 for c in classes}
    
    start_time = time.time()
    
    for case in test_cases:
        res = classifier.classify_video("dummy.mp4", case["title"], case["content"])
        pred_class = res["exercise_type"]
        true_class = case["true_class"]
        
        print(f"Titulo: '{case['title']}' -> Prediccion: {pred_class} (True: {true_class})")
        
        if pred_class == true_class:
            hits += 1
            tp[true_class] += 1
        else:
            if pred_class in fp:
                fp[pred_class] += 1
            fn[true_class] += 1
            
    latency = (time.time() - start_time) / total
    
    # Calcular Precision, Recall y F1-score promedio
    f1_scores = []
    for c in classes:
        precision = tp[c] / (tp[c] + fp[c]) if (tp[c] + fp[c]) > 0 else 0
        recall = tp[c] / (tp[c] + fn[c]) if (tp[c] + fn[c]) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        f1_scores.append(f1)
        
    avg_f1 = sum(f1_scores) / len(classes)
    accuracy = hits / total
    
    print("\n[RESULTADOS CLASIFICADOR]:")
    print(f"  - Tasa de Acierto (Accuracy): {accuracy:.2%}")
    print(f"  - F1-Score Promedio: {avg_f1:.4f} (Objetivo RNF-16: >= 0.80)")
    print(f"  - Latencia promedio de clasificacion: {latency*1000:.2f} ms")
    
    assert avg_f1 >= 0.80, "Falla: F1-score menor al requerido (0.80)"
    print("[OK] Clasificador CUMPLE con los requerimientos.")

def validate_chatbot():
    print("\n--------------------------------------------------")
    print("[TEST] Validando Chatbot Fitness (HU-11 / RNF-17 / RNF-18)...")
    print("--------------------------------------------------")
    
    # Casos de prueba de consultas y respuestas esperadas (en texto normalizado)
    queries = [
        {"q": "Hola, buenas tardes", "contains": "FitNet"},
        {"q": "Como hacer sentadillas", "contains": "pies"},
        {"q": "Dame una rutina de principiante", "contains": "Full Body"},
        {"q": "Cuanta proteina necesito al dia", "contains": "kg de peso"},
        {"q": "Que comer antes de entrenar", "contains": "carbohidratos"},
        {"q": "Como perder grasa corporal", "contains": "Deficit Calorico"},
        {"q": "Rutina para ganar musculo", "contains": "hipertrofia"},
        {"q": "Como hacer flexiones correctamente", "contains": "plancha alta"},
        {"q": "Cuanto tiempo descanso entre series", "contains": "minutos"},
        {"q": "Que comer despues del gimnasio", "contains": "glucogeno"}
    ]
    
    hits = 0
    total = len(queries)
    max_latency = 0.0
    total_time = 0.0
    
    for case in queries:
        start_time = time.time()
        response = get_chatbot_response(case["q"])
        elapsed = time.time() - start_time
        
        total_time += elapsed
        if elapsed > max_latency:
            max_latency = elapsed
            
        # Comparación normalizada sin acentos ni mayúsculas
        norm_response = normalize_str(response)
        norm_expected = normalize_str(case["contains"])
        
        success = norm_expected in norm_response
        if success:
            hits += 1
        else:
            print(f"FAILED CASE DETAIL:")
            print(f"  Query: '{case['q']}'")
            print(f"  Expected key term: '{case['contains']}' (Normalized: '{norm_expected}')")
            print(f"  Actual response: '{response}'")
            
        print(f"Q: '{case['q']}' -> Resp. OK: {success} | Tiempo: {elapsed*1000:.2f} ms")
        
    avg_latency = total_time / total
    accuracy = hits / total
    
    print("\n[RESULTADOS CHATBOT]:")
    print(f"  - Precision (Accuracy): {accuracy:.2%} (Objetivo RNF-18: >= 75%)")
    print(f"  - Tiempo de respuesta promedio: {avg_latency*1000:.2f} ms")
    print(f"  - Tiempo de respuesta maximo: {max_latency*1000:.2f} ms (Objetivo RNF-17: < 2000 ms)")
    
    assert accuracy >= 0.75, "Falla: Precision menor al 75%"
    assert max_latency < 2.0, "Falla: Tiempo de respuesta mayor a 2 segundos"
    print("[OK] Chatbot CUMPLE con los requerimientos.")

if __name__ == "__main__":
    try:
        validate_video_classifier()
        validate_chatbot()
        print("\n[VALIDACION FINAL]: TODOS LOS MODELOS DE IA CUMPLEN CON LOS RNF ESTABLECIDOS.")
    except AssertionError as e:
        print(f"\n[ERROR DE VALIDACION]: {e}")
        sys.exit(1)
