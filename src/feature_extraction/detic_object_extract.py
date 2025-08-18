import os
import json
from pathlib import Path
from transformers import AutoImageProcessor, DeformableDetrForObjectDetection
import torch
from PIL import Image
from tqdm import tqdm


def setup_environment(gpu_id: str = "0", cache_dir: str = None):
    """
    Configure GPU visibility and Transformers cache directory.
    """
    os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
    os.environ["CUDA_VISIBLE_DEVICES"] = gpu_id
    if cache_dir:
        os.environ["TRANSFORMERS_CACHE"] = cache_dir


class DeticHuggingFace:
    def __init__(
        self,
        model_name: str = "facebook/deformable-detr-detic",
        use_fast: bool = True,
        device: str = "cuda",
    ):
        self.device = device if torch.cuda.is_available() else "cpu"
        self.processor = AutoImageProcessor.from_pretrained(
            model_name, use_fast=use_fast
        )
        self.model = DeformableDetrForObjectDetection.from_pretrained(model_name)
        self.model.to(self.device)

    def predict(self, image_path: str, threshold: float = 0.5):
        """
        Run object detection on an image and return a list of detections.
        Each detection is a dict with keys: bbox, label, score.
        """
        image = Image.open(image_path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        outputs = self.model(**inputs)

        target_sizes = torch.tensor([image.size[::-1]])  # (height, width)
        results = self.processor.post_process_object_detection(
            outputs, target_sizes=target_sizes, threshold=threshold
        )[0]

        detections = []
        for score, label, box in zip(
            results["scores"], results["labels"], results["boxes"]
        ):
            detections.append(
                {
                    "bbox": [round(x, 2) for x in box.tolist()],
                    "label": self.model.config.id2label[label.item()],
                    "score": round(score.item(), 3),
                }
            )
        return detections


def batch_detect(
    input_dir: Path,
    output_dir: Path,
    threshold: float = 0.5,
    gpu_id: str = "0",
    cache_dir: str = None,
):
    """
    Walk through input_dir, detect objects in each .jpg frame, and
    save results grouped by video name into JSON files under output_dir.
    """
    setup_environment(gpu_id, cache_dir)
    detic = DeticHuggingFace()

    # Find all JPEG images recursively
    image_paths = list(input_dir.rglob("*.jpg"))
    if not image_paths:
        print(f"No .jpg images found in {input_dir}")
        return

    # Accumulate detections: video_name -> { frame_name: [detections] }
    all_results = {}
    # Progress bar over images
    for img_path in tqdm(image_paths, desc="Processing frames", unit="frame"):
        video_name = img_path.parent.name  # e.g., L01_V001
        frame_name = img_path.stem  # e.g., 00000

        detections = detic.predict(str(img_path), threshold=threshold)

        if video_name not in all_results:
            all_results[video_name] = {}
        all_results[video_name][frame_name] = detections

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Write JSON per video with progress bar
    for video_name, frames in tqdm(
        all_results.items(), desc="Writing JSON", unit="video"
    ):
        out_file = output_dir / f"{video_name}.json"
        with open(out_file, "w") as f:
            json.dump(frames, f, indent=2)
        print(f"Saved detections for '{video_name}' -> {out_file}")


if __name__ == "__main__":
    # === CONFIGURE YOUR PARAMETERS BELOW ===
    input_dir = Path("/dataset/KLTN/0")
    output_dir = Path("/dataset/KLTN/0/object_detection")
    threshold = 0.3
    gpu_id = "2"
    cache_dir = "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights"

    batch_detect(
        input_dir=input_dir,
        output_dir=output_dir,
        threshold=threshold,
        gpu_id=gpu_id,
        cache_dir=cache_dir,
    )

    # === CONFIGURE YOUR PARAMETERS BELOW ===
    input_dir = Path("/dataset/KLTN/1")
    output_dir = Path("/dataset/KLTN/1/object_detection")
    threshold = 0.3
    gpu_id = "2"
    cache_dir = "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights"

    batch_detect(
        input_dir=input_dir,
        output_dir=output_dir,
        threshold=threshold,
        gpu_id=gpu_id,
        cache_dir=cache_dir,
    )

    # === CONFIGURE YOUR PARAMETERS BELOW ===
    input_dir = Path("/dataset/KLTN/2")
    output_dir = Path("/dataset/KLTN/2/object_detection")
    threshold = 0.3
    gpu_id = "2"
    cache_dir = "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights"

    batch_detect(
        input_dir=input_dir,
        output_dir=output_dir,
        threshold=threshold,
        gpu_id=gpu_id,
        cache_dir=cache_dir,
    )
