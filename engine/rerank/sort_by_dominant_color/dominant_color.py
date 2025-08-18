from imagedominantcolor import DominantColor
import numpy as np
from scipy.spatial import distance
import os
from PIL import Image
import matplotlib.pyplot as plt


def create_html_gallery(folder_path, output_file="gallery.html"):
    # Get list of files in the folder
    files = os.listdir(folder_path)

    # Filter out non-image files
    image_files = [
        f
        for f in files
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp"))
    ]

    # Create an HTML file
    with open(output_file, "w") as f:
        f.write("<html><body>\n")

        for image_file in image_files:
            img_path = os.path.join(folder_path, image_file)
            f.write(f'<img src="{img_path}" style="max-width:200px; margin:10px;">\n')

        f.write("</body></html>\n")


def get_image_paths_from_folder(folder_path):
    # Get all image file paths from the specified folder
    valid_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")
    return [
        os.path.join(folder_path, f)
        for f in os.listdir(folder_path)
        if f.lower().endswith(valid_extensions)
    ]


def get_dominant_color(image_path):
    dominantcolor = DominantColor(image_path)
    return dominantcolor.rgb


def sort_images_by_dominant_color(image_paths):
    # Create a list of tuples with image path and its dominant color
    images_with_colors = [(path, get_dominant_color(path)) for path in image_paths]

    # Sort images by dominant color (you can modify this to sort by a specific color component or distance)
    images_with_colors.sort(key=lambda x: x[1])  # Sort by RGB value tuple

    # Extract sorted image paths
    sorted_image_paths = [image for image, _ in images_with_colors]

    return sorted_image_paths


def save_sorted_images(sorted_image_paths, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for index, image_path in enumerate(sorted_image_paths):
        img = Image.open(image_path)
        new_filename = f"{index:03d}.jpg"  # Save with index, e.g., 001.jpg, 002.jpg
        img.save(os.path.join(output_folder, new_filename))


# image_paths = get_image_paths_from_folder("/workspace/competitions/AIC_2024/SIU_Pumpkin/utils/color_sorting")
# sorted_images = sort_images_by_dominant_color(image_paths)
# save_sorted_images(sorted_images, "/workspace/competitions/AIC_2024/SIU_Pumpkin/utils/color_sorting")
