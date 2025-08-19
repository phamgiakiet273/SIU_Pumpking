from ultralytics import YOLO

#sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/engine/scene_classifier")
from pathlib import Path
import sys
# add child path manually
current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        base_path = parent
        new_path = base_path / "engine" / "scene_classifier"
        sys.path.append(str(new_path))
        #print(f"Added {new_path} to sys.path")
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")


class NewsIntroductionTrain:
    def __init__(self, model_path: str = "param/yolo11x-cls.pt"):
        self.model = YOLO(model_path)

    def train(dataset_path: str):
        # Cần 50GB GPU trong 5 tiếng
        results = self.model.train(data=dataset_path, epochs=30, imgsz=1280, patience=5)
