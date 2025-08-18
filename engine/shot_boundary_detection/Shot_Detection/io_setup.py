import os
import json
import numpy as np
import cv2
from typing import Dict, List, Any

class DirectoryNotFoundError(Exception):
    """Custom exception for when the input directory is not found."""
    pass

def setup_video_path(input_dir: str) -> Dict[str, Dict]:
    def dfs(current_path: str, current_dict: Dict) -> None:
            for item in sorted(os.listdir(current_path)):
                item_path = os.path.join(current_path, item)
                if os.path.isdir(item_path):
                    current_dict[item] = {}
                    dfs(item_path, current_dict[item])
                elif item.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):  # Add more video extensions if needed
                    video_id = os.path.splitext(item)[0]
                    current_dict[video_id] = item_path

    result = {}
    if not os.path.exists(input_dir):
        raise DirectoryNotFoundError(f"The input directory '{self.input_dir}' does not exist.")
    dfs(input_dir, result)
    return result

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        return super().default(obj)

class SceneJsonLoader:
    def __init__(
        self, 
        input_dict: str, # output from model dictionaru
        output_dir: str # output SceneJson directory
    ):
        self.input_dict = input_dict
        self.output_dir = output_dir

    def save_results(self) -> None:

        def created_nested_structure(base_path: str, nested_dict: Dict) -> None:
            for key, value in nested_dict.items():
                if isinstance(value, dict):
                    new_path = os.path.join(base_path, key)
                    os.makedirs(new_path, exist_ok=True)
                    created_nested_structure(new_path, value)
                else:
                    with open(os.path.join(base_path, f"{key}.json"), 'w') as f:
                        json.dump(value, f, indent=2, cls=NumpyEncoder)
        
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        created_nested_structure(self.output_dir, self.input_dict)
    


class CutKeyFrameLoader:
    """
    A class for extracting keyframes from videos based on scene information.
    """

    def __init__(self, scene_json_dir: str, key_frame_dir: str):
        """
        Initialize the CutKeyFrameLoader.

        Args:
            scene_json_dir (str): Directory containing scene JSON files.
            key_frame_dir (str): Directory to save extracted keyframes.
        """
        self.scene_json_dir = scene_json_dir
        self.keyframes_dir = key_frame_dir

    def sample_frames_from_shot(self, start: int, end: int, num_samples: int = 3) -> List[int]:
        """
        Sample frame indices from a shot.

        Args:
            start (int): Start frame of the shot.
            end (int): End frame of the shot.
            num_samples (int): Number of frames to sample. Default is 3.

        Returns:
            List[int]: List of sampled frame indices.
        """
        return [start + i * (end - start) // (num_samples - 1) for i in range(num_samples)]

    def ensure_directory(self, directory: str):
        """
        Ensure that a directory exists, creating it if necessary.

        Args:
            directory (str): Path of the directory to ensure.
        """
        os.makedirs(directory, exist_ok=True)

    def read_frame(self, cap: cv2.VideoCapture, frame_index: int) -> tuple:
        """
        Read a specific frame from a video capture object.

        Args:
            cap (cv2.VideoCapture): Video capture object.
            frame_index (int): Index of the frame to read.

        Returns:
            tuple: A tuple containing a boolean (success flag) and the frame (if successful).
        """
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        return cap.read()

    def save_frame(self, frame, filename: str) -> bool:
        """
        Save a frame as an image file.

        Args:
            frame: The frame to save.
            filename (str): Path where the frame should be saved.

        Returns:
            bool: True if the frame was successfully saved, False otherwise.
        """
        return cv2.imwrite(filename, frame)

    def process_frame(self, cap: cv2.VideoCapture, index: int, key: str, keyframe_path: str):
        """
        Process a single frame: read it from the video and save it as an image.

        Args:
            cap (cv2.VideoCapture): Video capture object.
            index (int): Frame index.
            key (str): Identifier for the video (used in error messages).
            keyframe_path (str): Directory to save the frame.
        """
        filename = os.path.join(keyframe_path, f"{index}.jpg")
        ret, frame = self.read_frame(cap, index)
        if ret:
            if not self.save_frame(frame, filename):
                print(f'Failed to save frame {index} for video {key}')
        else:
            print(f'Failed to read frame {index} for video {key}')

    def process_shot(self, cap: cv2.VideoCapture, shot: List[int], key: str, keyframe_path: str):
        """
        Process a single shot: sample frames and save them.

        Args:
            cap (cv2.VideoCapture): Video capture object.
            shot (List[int]): Start and end frame indices of the shot.
            key (str): Identifier for the video.
            keyframe_path (str): Directory to save the keyframes.
        """
        shot_frames_id = self.sample_frames_from_shot(shot[0], shot[1])
        for index in shot_frames_id:
            self.process_frame(cap, index, key, keyframe_path)

    def process_video_scenes(self, key: str, video_path: str, video_scenes: List[List[int]], keyframe_path: str):
        """
        Process all scenes in a video: extract and save keyframes for each shot.

        Args:
            key (str): Identifier for the video.
            video_path (str): Path to the video file.
            video_scenes (List[List[int]]): List of shots (start and end frames) in the video.
            keyframe_path (str): Directory to save the keyframes.
        """
        cap = cv2.VideoCapture(video_path)
        for shot in video_scenes:
            self.process_shot(cap, shot, key, keyframe_path)
        cap.release()

    def load_json(self, json_file: str) -> List[List[int]]:
        """
        Load scene information from a JSON file.

        Args:
            json_file (str): Path to the JSON file.

        Returns:
            List[List[int]]: List of shots (start and end frames) in the video.
        """
        try:
            with open(json_file, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding JSON file: {json_file}")
            return []

    def process_video(self, key: str, video_path: str, json_path: str, keyframe_path: str):
        """
        Process a single video: load scene information and extract keyframes.

        Args:
            key (str): Identifier for the video.
            video_path (str): Path to the video file.
            json_path (str): Path to the JSON file containing scene information.
            keyframe_path (str): Directory to save the keyframes.
        """
        json_file = f"{json_path}.json"
        if not os.path.exists(json_file):
            print(f"Warning: JSON file not found for key: {key}")
            return

        video_scenes = self.load_json(json_file)
        if not video_scenes:
            return

        self.ensure_directory(keyframe_path)
        self.process_video_scenes(key, video_path, video_scenes, keyframe_path)

    def process_directory(self, current_video_path: Dict[str, Any], current_json_path: str, current_keyframe_path: str):
        """
        Recursively process a directory of videos.

        Args:
            current_video_path (Dict[str, Any]): Dictionary of video paths or nested directories.
            current_json_path (str): Current path for JSON files.
            current_keyframe_path (str): Current path for saving keyframes.
        """
        for key, value in current_video_path.items():
            new_json_path = os.path.join(current_json_path, key)
            new_keyframe_path = os.path.join(current_keyframe_path, key)

            if isinstance(value, str):
                self.process_video(key, value, new_json_path, new_keyframe_path)
            elif isinstance(value, dict):
                self.ensure_directory(new_keyframe_path)
                self.process_directory(value, new_json_path, new_keyframe_path)
            else:
                print(f"Unexpected item in video paths: {key}")

    def extract_keyframes(self, video_paths: Dict[str, Dict]):
        """
        Main method to extract keyframes from all videos in the given paths.

        Args:
            video_paths (Dict[str, Dict]): Dictionary of video paths, potentially nested.
        """
        self.ensure_directory(self.keyframes_dir)
        self.process_directory(video_paths, self.scene_json_dir, self.keyframes_dir)

