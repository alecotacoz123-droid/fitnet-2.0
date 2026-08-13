from flask import Flask, request, jsonify
from flask_cors import CORS
import time

from classifier import VideoClassifier
from chatbot_api import get_chatbot_response

app = Flask(__name__)
CORS(app)

# Inicializar clasificador de videos
classifier = VideoClassifier()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "FitNet AI Microservice",
        "has_pytorch": classifier.has_dl
    })

@app.route('/classify', methods=['POST'])
def classify():
    start_time = time.time()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400
        
    video_path = data.get('video_path', '')
    title = data.get('title', '')
    content = data.get('content', '')
    
    try:
        tags = classifier.classify_video(video_path, title, content)
        duration = time.time() - start_time
        
        # Log response time to satisfy RNF-17/RNF-01 monitoring
        print(f"[AI Server] Classify request took {duration:.4f}s. Response tags: {tags}")
        
        return jsonify({
            "status": "success",
            "tags": tags,
            "processing_time_sec": duration
        })
    except Exception as e:
        print(f"[AI Server] Classify error: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/chat', methods=['POST'])
def chat():
    start_time = time.time()
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({"error": "Missing 'message' in JSON payload"}), 400
        
    message = data.get('message', '')
    context = data.get('context', '')
    
    try:
        response_text = get_chatbot_response(message, context)
        duration = time.time() - start_time
        
        # Log response time to satisfy RNF-17 (Chatbot time < 2s)
        print(f"[AI Server] Chat query: '{message}' -> Response took {duration:.4f}s")
        
        return jsonify({
            "response": response_text,
            "processing_time_sec": duration
        })
    except Exception as e:
        print(f"[AI Server] Chat error: {e}")
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("========================================")
    print("FitNet AI Microservice starting up...")
    print("URL: http://localhost:5000")
    print("========================================")
    app.run(host='0.0.0.0', port=5000, debug=False)
