import os
import shutil

# Define the old and new base directories
old_base_dir = "/dataset/KLTN/1/frames/autoshot/keyframes"
new_base_dir = "/dataset/KLTN/1/frames/autoshot"
# Loop through the L folders in the old base directory
for l_folder in os.listdir(old_base_dir):
    if l_folder.startswith("Videos_"):
        l_folder_name = l_folder.split("Videos_")[
            -1
        ]  # Extract L folder name, e.g., L01
        print(l_folder_name)
        # Loop through the video folders inside each L folder
        old_l_folder_path = os.path.join(old_base_dir, l_folder, "video")
        if os.path.isdir(old_l_folder_path):
            for v_folder in os.listdir(old_l_folder_path):
                # Construct old and new paths
                old_video_dir = os.path.join(old_l_folder_path, v_folder)
                new_video_dir = os.path.join(
                    new_base_dir, f"Keyframes_{l_folder_name}", "keyframes", v_folder
                )

                # Make sure the new directory exists
                os.makedirs(new_video_dir, exist_ok=True)

                # Loop through the images in the old directory
                for old_file_name in os.listdir(old_video_dir):
                    if old_file_name.endswith(".jpg"):
                        # Extract the numerical part from the old file name
                        old_num = os.path.splitext(old_file_name)[0]

                        # Create the new file name with zero-padded format (e.g., 00000.jpg)
                        new_file_name = f"{int(old_num):05d}.jpg"

                        # Define the old and new file paths
                        old_file_path = os.path.join(old_video_dir, old_file_name)
                        new_file_path = os.path.join(new_video_dir, new_file_name)

                        # Copy the file
                        # shutil.copy(old_file_path, new_file_path)
                        # Move the file
                        shutil.move(old_file_path, new_file_path)
                        # print(f"Copied {old_file_path} to {new_file_path}")


# Define the old and new base directories
old_base_dir = "/dataset/KLTN/2/frames/autoshot/keyframes"
new_base_dir = "/dataset/KLTN/2/frames/autoshot"
# Loop through the L folders in the old base directory
for l_folder in os.listdir(old_base_dir):
    if l_folder.startswith("Videos_"):
        l_folder_name = l_folder.split("Videos_")[
            -1
        ]  # Extract L folder name, e.g., L01
        print(l_folder_name)
        # Loop through the video folders inside each L folder
        old_l_folder_path = os.path.join(old_base_dir, l_folder, "video")
        if os.path.isdir(old_l_folder_path):
            for v_folder in os.listdir(old_l_folder_path):
                # Construct old and new paths
                old_video_dir = os.path.join(old_l_folder_path, v_folder)
                new_video_dir = os.path.join(
                    new_base_dir, f"Keyframes_{l_folder_name}", "keyframes", v_folder
                )

                # Make sure the new directory exists
                os.makedirs(new_video_dir, exist_ok=True)

                # Loop through the images in the old directory
                for old_file_name in os.listdir(old_video_dir):
                    if old_file_name.endswith(".jpg"):
                        # Extract the numerical part from the old file name
                        old_num = os.path.splitext(old_file_name)[0]

                        # Create the new file name with zero-padded format (e.g., 00000.jpg)
                        new_file_name = f"{int(old_num):05d}.jpg"

                        # Define the old and new file paths
                        old_file_path = os.path.join(old_video_dir, old_file_name)
                        new_file_path = os.path.join(new_video_dir, new_file_name)

                        # Copy the file
                        # shutil.copy(old_file_path, new_file_path)
                        # Move the file
                        shutil.move(old_file_path, new_file_path)
                        # print(f"Copied {old_file_path} to {new_file_path}")
