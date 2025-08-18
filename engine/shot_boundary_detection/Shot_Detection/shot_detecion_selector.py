import os
import torch
import numpy as np
import tqdm
from typing import Dict, Union
from torchinfo import summary

import sys
sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/engine/shot_boundary_detection/Shot_Detection")

from AutoShot.utils import get_batches, get_frames
from AutoShot.model import AutoShot
#
class ShotDetection:
    """
    A class for performing shot detection on videos using either AutoShot or TransNetV2 models.
    """

    def __init__(self, choice: str = 'autoshot'):
        """
        Initialize the ShotDetection class.

        Args:
            choice (str): The model to use for shot detection.
        """
        self.choice = choice.lower()
        if self.choice == 'autoshot':
            self.model = AutoShot("/workspace/competitions/AIC_2025/SIU_Pumpking/engine/shot_boundary_detection/Shot_Detection/AutoShot/model_weight/ckpt_0_200_0.pth")
        else:
            raise ValueError("Invalid choice. Please choose 'autoshot' or 'transnetv2'.")

    def run_model(self, video_path_dict: Dict[str, str]) -> Dict[str, np.ndarray]:
        """
        Run shot detection on a dictionary of video paths.

        Args:
            video_path_dict (Dict[str, str]): A dictionary mapping video names to their file paths.

        Returns:
            Dict[str, np.ndarray]: A dictionary mapping video names to their detected scene boundaries.
        """
       
        return self._run_autoshot(video_path_dict)
       

    def _run_autoshot(self, video_path_dict: Dict[str, Union[str, Dict]]) -> Dict[str, Union[np.ndarray, Dict]]:
        """
        Run shot detection using the AutoShot model.

        Args:
            video_path_dict (Dict[str, Union[str, Dict]]): A nested dictionary mapping video names or folder names
                                                           to their file paths or further nested dictionaries.

        Returns:
            Dict[str, Union[np.ndarray, Dict]]: A nested dictionary mapping video names or folder names
                                                to their detected scene boundaries or further nested dictionaries.
        """
        res = self.model.process_videos(video_path_dict)
        return res
