import torch
from transformers import AutoProcessor, AutoModel
from configs.app import AppConfig
from configs.SIGLIP_v2_configs import SIGLIPV2Config
from PIL import Image
import requests
import numpy as np
import os

# Non-deprecated spelling of TRANSFORMERS_CACHE. Note this assignment lands
# *after* `transformers` is imported above, so it cannot move the cache on its
# own - .env (loaded by the service entrypoint before this module) is what
# actually governs the cache dir. Kept as a fallback for direct imports.
os.environ.setdefault("HF_HUB_CACHE", AppConfig().TRANSFORMERS_CACHE)
os.environ["CUDA_DEVICE_ORDER"] = AppConfig().CUDA_DEVICE_ORDER
os.environ["CUDA_VISIBLE_DEVICES"] = SIGLIPV2Config().SIGLIP_V2_CUDA_VISIBLE_DEVICES
# os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

# The class SIGLIP2 initializes a model for extracting image and text features using Google's SIGLIP2
# model with specific settings.
class SIGLIP2:
    def __init__(self, use_cpu=False):
        print("google/siglip2-giant-opt-patch16-384")
        if use_cpu:
            self.device = "cpu"
        else:
            self.device = "cuda"

        # No device_map here: a processor is CPU-side tokenising/resizing, so it
        # was never placed on a device, and accelerate (which device_map needs)
        # is not installed in this env.
        self.processor = AutoProcessor.from_pretrained(
            "google/siglip2-giant-opt-patch16-384", use_fast=True
        )  # add token
        # The checkpoint is fp32 on disk (~7.5GB). get_image_features and
        # get_text_features already run under autocast("cuda"), so the matmuls
        # were happening in fp16 regardless - holding fp32 weights only cost
        # VRAM. fp16 halves the resident weights to ~3.7GB on the 16GB RTX 5000.
        # Turing has no bf16 tensor cores, so float16 is the right half here.
        dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.model = (
            AutoModel.from_pretrained(
                "google/siglip2-giant-opt-patch16-384", dtype=dtype
            )
            .eval()
            .to(self.device)
        )  # add token
        # self.model = torch.compile(self.model)

    def get_image_features(self, image_data: Image) -> np.array:
        inputs = self.processor(
            images=image_data,
            padding="max_length",
            return_tensors="pt",
            truncation=True,
        ).to(self.device)
        with torch.no_grad(), torch.amp.autocast("cuda"):
            image_features = self.model.get_image_features(**inputs)
            image_features /= image_features.norm(dim=-1, keepdim=True)
        return image_features.cpu().detach().numpy()

    def get_text_features(self, text: str) -> np.array:
        inputs = self.processor(
            text=text,
            padding="max_length",
            max_length=64,
            return_tensors="pt",
            truncation=True,
        ).to(self.device)
        with torch.no_grad(), torch.amp.autocast("cuda"):
            text_features = self.model.get_text_features(**inputs)
            text_features /= text_features.norm(dim=-1, keepdim=True)
        return text_features.cpu().detach().numpy()


# if __name__ == '__main__':
#     def cosine_similarity(vec1, vec2):
#         return vec1 @ vec2.T

#     url = "https://azpet.b-cdn.net/wp-content/uploads/2021/06/cho-corgi-5.jpg"
#     image = Image.open(requests.get(url, stream=True).raw).convert("RGB")

#     model = SIGLIP2()
#     image_emb = model.get_image_features(image)
#     texts = ["dog", "cat", "duck"]
#     text_embs = [model.get_text_features(t) for t in texts]

#     for t, emb in zip(texts, text_embs):
#         sim = cosine_similarity(image_emb, emb)
#         print(f"Similarity between image and '{t}': {sim.item():.4f}")
