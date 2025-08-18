import numpy as np
import os 
import ffmpeg


def get_frames(video_file_path: str, width:int = 48, height:int = 27) -> np.ndarray:
    """Extract frames from video

    Args:
        video_file_path (str): Path to the video file
        width (int, optional): width of the extracted frame. Defaults to 320.
        height (int, optional): height of the extracted frames. Defaults to 240.

    Returns:
        np.ndarray: Array of video frames
    """

    video_stream, _ = (
        ffmpeg
        .input(video_file_path)
        .output('pipe:', format='rawvideo', pix_fmt='rgb24', s=f'{width}x{height}')
        # return a pipe instead of a file, rawvideo, pixel_format = 24-bit rgb, 
        .run(capture_stdout=True, capture_stderr=True)
    )
    video = np.frombuffer(
        video_stream,
        np.uint8
    ).reshape([-1, height, width, 3])
    return video

def get_batches(frames: np.ndarray) -> callable:
        """
        Prepare batches of frames for processing.

        Args:
            frames (np.ndarray): Array of video frames.

        Returns:
            callable: Generator function for frame batches.
        """
        reminder = 50 - len(frames) % 50
        if reminder == 50:
            reminder = 0
        frames = np.concatenate([frames[:1]] * 25 + [frames] + [frames[-1:]] * (reminder + 25), 0)

        
        for i in range(0, len(frames) - 50, 50):
            yield frames[i:i + 100]

def predictions_to_scenes(predictions: np.ndarray) -> np.ndarray:
    """
    Convert binary predictions back into scene annotations.

    Args:
        predictions (np.ndarray): Binary predictions for each frame.

    Returns:
        np.ndarray: Array of scene start and end frames.
    """
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