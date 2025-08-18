import torch
from configs.app import AppConfig
from configs.METACLIP_configs import METACLIPConfig
from open_clip.factory import create_model_and_transforms
from open_clip.tokenizer import tokenize
from PIL import Image
import requests
import numpy as np
import os

os.environ["TRANSFORMERS_CACHE"] = AppConfig().TRANSFORMERS_CACHE
os.environ["CUDA_DEVICE_ORDER"] = AppConfig().CUDA_DEVICE_ORDER
os.environ["CUDA_VISIBLE_DEVICES"] = METACLIPConfig().METACLIP_CUDA_VISIBLE_DEVICES


class METACLIP:
    def __init__(self, use_cpu=False):
        print("metaclip_altogether")
        if use_cpu:
            self.device = "cpu"
        else:
            self.device = "cuda"

        self.model, _, self.preprocess = create_model_and_transforms(
            "ViT-H-14", pretrained="metaclip_altogether", device=self.device
        )

    def get_image_features(self, image_data: Image) -> np.array:
        inputs = self.preprocess(image_data).unsqueeze(0).to(self.device)
        with torch.no_grad(), torch.amp.autocast("cuda"):
            image_features = self.model.encode_image(inputs)
            image_features /= image_features.norm(dim=-1, keepdim=True)
        return image_features.cpu().detach().numpy()

    def get_text_features(self, text: str) -> np.array:
        inputs = tokenize([text]).to(self.device)
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
