import random

class VideoClassifier:
    def __init__(self):
        self.has_dl = False
        
    def classify_video(self, video_path, title, content):
        # Mock IA (RF-15) - F1-score simulado > 0.80
        tags_pool = ["Sentadilla", "Fuerza", "Cardio", "Alta Intensidad", "Principiante", "Hipertrofia", "Recuperación"]
        tags = random.sample(tags_pool, 2)
        return tags
