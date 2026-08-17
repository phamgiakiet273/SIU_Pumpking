from ultralytics import YOLOE
import cv2

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    # Project root is detected by content (it holds configs/ and utils/)
    # rather than by folder name, so the tree can be checked out under any
    # directory name - e.g. SIU_Pumpking_local on a client machine.
    if (parent / "configs").is_dir() and (parent / "utils").is_dir():
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find the SIU_Pumpking project root (a parent directory containing configs/ and utils/).")

# Initialize a YOLOE model
model = YOLOE("data/weights/yoloe-11l-seg-pf.pt")

# Run prediction. No prompts required.
results = model.predict("data/examples/animal_pf_test_2.jpg")

# Save the first result as an image
# `plot()` renders the predictions on the image and returns a NumPy array
result_image = results[0].plot()

# Save with OpenCV
cv2.imwrite("data/examplesprediction_output.jpg", result_image)
