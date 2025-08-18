from configs.app import AppConfig
from configs.METACLIP_v2_configs import METACLIPV2Config

import os

os.environ["TRANSFORMERS_CACHE"] = AppConfig().TRANSFORMERS_CACHE
os.environ["CUDA_DEVICE_ORDER"] = AppConfig().CUDA_DEVICE_ORDER
os.environ["CUDA_VISIBLE_DEVICES"] = METACLIPV2Config().METACLIP_V2_CUDA_VISIBLE_DEVICES

import torch

import sys

sys.path.append("/workspace/nhihtc/perfect/AIC2025/FE/git/MetaCLIP")
from src.mini_clip.factory import create_model_and_transforms, get_tokenizer
from PIL import Image
import requests
import numpy as np


# os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"


class METACLIP:
    def __init__(self, use_cpu=True):
        print("metaclip2_worldwide")
        if use_cpu:
            self.device = "cpu"
        else:
            self.device = "cuda"
        self.model, _, self.preprocess = create_model_and_transforms(
            "ViT-bigG-14-378-worldwide@WorldWideCLIP",
            pretrained="metaclip2_worldwide",
            device=self.device,
        )
        self.tokenizer = get_tokenizer("facebook/xlm-v-base")

    def get_image_features(self, image_data: Image) -> np.array:
        inputs = self.preprocess(image_data).unsqueeze(0).to(self.device)
        with torch.no_grad(), torch.amp.autocast("cuda"):
            image_features = self.model.encode_image(inputs)
            image_features /= image_features.norm(dim=-1, keepdim=True)
        return image_features.cpu().detach().numpy()

    def get_text_features(self, text: str) -> np.array:
        inputs = self.tokenizer([text]).to(self.device)
        with torch.no_grad(), torch.amp.autocast("cuda"):
            text_features = self.model.encode_text(inputs)
            text_features /= text_features.norm(dim=-1, keepdim=True)
        return text_features.cpu().detach().numpy()


if __name__ == "__main__":

    def cosine_similarity(vec1, vec2):
        return vec1 @ vec2.T

    url = "https://azpet.b-cdn.net/wp-content/uploads/2021/06/cho-corgi-5.jpg"
    image = Image.open(requests.get(url, stream=True).raw).convert("RGB")

    model = METACLIP()
    image_emb = model.get_image_features(image)
    texts = ["dog", "cat", "duck"]
    text_embs = [model.get_text_features(t) for t in texts]

    for t, emb in zip(texts, text_embs):
        sim = cosine_similarity(image_emb, emb)
        print(f"Similarity between image and '{t}': {sim.item():.4f}")
