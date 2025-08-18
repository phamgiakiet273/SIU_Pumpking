from ultralytics import YOLO
import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/engine/scene_classifier")


class NewsIntroduction:
    def __init__(self, model_path: str = "param/best.pt"):
        self.model = YOLO(model_path)

    def train(dataset_path: str):
        # Cần 50GB GPU trong 5 tiếng
        results = self.model.train(data=dataset_path, epochs=30, imgsz=1280, patience=5)
