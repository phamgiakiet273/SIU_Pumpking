from ultralytics import YOLOE
import cv2

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        #print(f"Adding {parent} to sys.path")
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")

# Initialize a YOLOE model
model = YOLOE("data/weights/yoloe-11l-seg-pf.pt")

# Run prediction. No prompts required.
results = model.predict("data/examples/animal_pf_test_2.jpg")

# Save the first result as an image
# `plot()` renders the predictions on the image and returns a NumPy array
result_image = results[0].plot()

# Save with OpenCV
cv2.imwrite("data/examplesprediction_output.jpg", result_image)
