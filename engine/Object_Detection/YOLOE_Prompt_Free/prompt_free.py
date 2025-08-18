from ultralytics import YOLOE
import cv2

import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking/engine")

# Initialize a YOLOE model
model = YOLOE("data/weights/yoloe-11l-seg-pf.pt")

# Run prediction. No prompts required.
results = model.predict("data/examples/animal_pf_test_2.jpg")

# Save the first result as an image
# `plot()` renders the predictions on the image and returns a NumPy array
result_image = results[0].plot()

# Save with OpenCV
cv2.imwrite("data/examplesprediction_output.jpg", result_image)
