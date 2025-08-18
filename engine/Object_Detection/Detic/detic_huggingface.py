from transformers import AutoImageProcessor, DeformableDetrForObjectDetection
import torch
from PIL import Image
import os


os.environ['TRANSFORMERS_CACHE'] = '/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights'
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"   # see issue #152
os.environ['CUDA_VISIBLE_DEVICES'] = "2"


class DeticHuggingFace:
    def __init__(self):
        self.processor = AutoImageProcessor.from_pretrained("facebook/deformable-detr-detic", use_fast=True)
        self.model = DeformableDetrForObjectDetection.from_pretrained("facebook/deformable-detr-detic")
        self.model.to("cuda")
    
    def predict(self, image_path, threshold = 0.5):
        image = Image.open(image_path)
        inputs = self.processor(images=image, return_tensors="pt").to("cuda")
        outputs = self.model(**inputs)

        # convert outputs (bounding boxes and class logits) to COCO API
        # let's only keep detections with score > 0.7
        target_sizes = torch.tensor([image.size[::-1]])
        results = self.processor.post_process_object_detection(outputs, target_sizes = target_sizes, threshold = threshold)[0]

        return_list = []

        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            box = [round(i, 2) for i in box.tolist()]
            print(
                    f"Detected {self.model.config.id2label[label.item()]} with confidence "
                    f"{round(score.item(), 3)} at location {box}"
            )
            return_list.append({"bbox": box,
                                "label": self.model.config.id2label[label.item()],
                                "score": round(score.item(), 3)})

        return return_list
    
# detic = DeticHuggingFace()

# image_path = "/workspace/competitions/AIC_2025/SIU_Pumpking/data/example/animal_pf_test_2.jpg"

# print(detic.predict(image_path))