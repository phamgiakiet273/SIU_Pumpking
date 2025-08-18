from .supernet import TransNetV2Supernet
import os
import torch
import numpy as np
from typing import Dict, List, Tuple, Optional

from .utils import get_batches, get_frames
from tqdm import tqdm 

class AutoShot:
    """
    A class for automatic shot detection in videos using the TransNetV2Supernet model.
    """

    def __init__ (self, pretrained_path: str, device: Optional[str]= None ) -> None:
        """Initializa the AutoShot class

        Args:
            pretrained_path (str): Path to the pretrained model weights
            device (Optional[str], optional): Device to run the model on ('cuda' or 'cpu'). Defaults to 'cpu'
        """
        self.device = None
        if device:
            self.device = device
        else:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        self.model = self._load_model(pretrained_path)

    def _load_model(self, pretrained_path: str) -> torch.nn.Module:
        """
        Load the pretrained TransNetV2Supernet model.

        Args:
            pretrained_path (str): Path to the pretrained model weights.

        Returns:
            torch.nn.Module: Loaded and configured model.
        """
        model = TransNetV2Supernet().eval()
        if os.path.exists(pretrained_path):
            print(f'Loading pretrained model from {pretrained_path}')
            model_dict = model.state_dict()
            pretrained_dict = torch.load(pretrained_path, map_location=self.device)
            pretrained_dict = {k: v for k, v in pretrained_dict['net'].items() if k in model_dict}
            print(f"Current model has {len(model_dict)} params, Updating {len(pretrained_dict)} params")
            model_dict.update(pretrained_dict)
            model.load_state_dict(model_dict)

        else:
            raise FileNotFoundError(f"Error: Cannot find pretrained model at {pretrained_path}")
        
        return model.to(self.device)
    
    def predict(self, batch: np.ndarray) -> np.ndarray:
        """
        Make predictions on a batch of frames.

        Args:
            batch (np.ndarray): Batch of video frames.

        Returns:
            np.ndarray: Predictions for the batch.
        """
        with torch.no_grad():
            batch = torch.from_numpy(batch.transpose((3, 0, 1, 2))[np.newaxis, ...]) * 1.0
            batch = batch.to(self.device)
            one_hot = self.model(batch)
            if isinstance(one_hot, tuple):
                one_hot = one_hot[0]
            return torch.sigmoid(one_hot[0]).cpu().numpy()
    
    def detect_shots(self, frames: np.ndarray) -> np.ndarray:
        """Detect shots in a video

        Args:
            frames (np.ndarray): Array of video frames

        Returns:
            np.ndarray: Shot detection predictions for each frame
        """
        
        predictions = []
        for batch in tqdm(get_batches(frames)):
            predict = self.predict(batch=batch)
            predictions.append(predict[25:75])
        return np.concatenate(predictions, 0)[:len(frames)]

    def process_videos(self, video_dict_path: Dict[str, Dict]) -> Dict[str, Dict]:
        """Process multiple videos for shot detection

        Args:
            video_dict_path (Dict[str, Dict[str, str]]): dictionary mapping folder

        Returns:
            Dict[str, Dict[str, List[List[int]]]]: _description_
        """
        def process_nested(nested_dict: Dict) -> Dict:
            result = {}
            for key, value in nested_dict.items():
                if isinstance(value, dict):
                    result[key] = process_nested(value)
                else:
                    frame_array = get_frames(video_file_path=value)
                    predictions = self.detect_shots(frame_array)
                    result[key] = self.predictions_to_scenes(predictions)
            return result
        return process_nested(video_dict_path)
    
    @staticmethod
    def predictions_to_scenes(predictions: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """Convert frame-wise predictions to scene boundaries

        Args:
            predictions (np.ndarray): Array of framw-wise predictions
            threshold (float, optional): threshold of considering a frame as a shot boundary. Defaults to 0.5.

        Returns:
            List[Tuple[int, int]]: List of scene start and end frame indices.
        """
        predictions = (predictions > threshold).astype(np.uint8)
        scenes = []
        t, t_prev, start = -1, 0, 0
        for i, t in enumerate(predictions):
            if t_prev == 1 and t == 0:
                start = i
            if t_prev == 0 and t == 1 and i != 0:
                scenes.append([start, i])
            t_prev = t
        if t == 0:
            scenes.append([start, i])

        # just fix if all predictions are 1
        if len(scenes) == 0:
            return np.array([[0, len(predictions) - 1]], dtype=np.int32)

        return np.array(scenes, dtype=np.int32)


