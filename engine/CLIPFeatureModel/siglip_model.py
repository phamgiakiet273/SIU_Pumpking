import torch
from transformers import AutoProcessor, AutoModel
from PIL import Image
import requests
import numpy as np
import os
from configs.METACLIP_v2_configs import METACLIPV2Config

HF_token = METACLIPV2Config().HUGGINGFACE_HUB_TOKEN

# import sys
# sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")

# from configs.app import AppConfig
# from configs.SIGLIP_vector_retrieval_config import SIGLIPVectorRetrievalConfig

# os.environ['TRANSFORMERS_CACHE'] = AppConfig().TRANSFORMERS_CACHE
# os.environ["CUDA_DEVICE_ORDER"] = AppConfig().CUDA_DEVICE_ORDER
# os.environ['CUDA_VISIBLE_DEVICES'] = SIGLIPVectorRetrievalConfig().SIGLIP_VECTOR_RETRIEVAL_CUDA_VISIBLE_DEVICES

# import sys
# sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")


class SIGLIP:
    def __init__(self):
        print("google/siglip-so400m-patch14-384")
        self.device = "cuda"
        self.processor = AutoProcessor.from_pretrained(
            "google/siglip-so400m-patch14-384", use_fast=True, token=HF_token
        )  # add token
        self.model = (
            AutoModel.from_pretrained(
                "google/siglip-so400m-patch14-384", token=HF_token
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
            text=text, padding="max_length", return_tensors="pt", truncation=True
        ).to(self.device)
        with torch.no_grad(), torch.amp.autocast("cuda"):
            text_features = self.model.get_text_features(**inputs)
            text_features /= text_features.norm(dim=-1, keepdim=True)
        return text_features.cpu().detach().numpy()


# siglip = SIGLIP()
