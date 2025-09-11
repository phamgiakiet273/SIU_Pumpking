============================
# Project Setup Instructions
============================

Follow the steps below to set up and run the project:

----------------------------------------
## 1. Setup Conda environment and clone repo

- Make sure you have Conda and Git installed.
- Create an SSH key (if you don’t have one) and add it to your GitHub account.
- Then clone this repository using SSH

--------------------------------------
## 2. Install required Python packages

- Create and activate a new Conda environment:
```
    conda create -n your-env-name python=3.11.12
    conda activate your-env-name
```
- Install packages:
```
    pip install -r requirements.txt
```
-------------------------------
## 3. Prepare the image directory and fps files

- Download `images` folder from AILab server using `scp` command, example below:
    ```
    scp ai_intern@14.224.156.113:/workspace/competitions/AIC_2025/SIU_Pumpking/static.zip C:\Users\F14_TOMCAT\Downloads\Project\AIC_data
    ```
- You can save the `images` folder anywhere on your machine.
- Copy the full **Linux path** of the folder (example below):

    */mnt/c/Users/F14_TOMCAT/Downloads/Project/AIC_data/0_low_res_autoshot_only*

- Do the same for 3 fps files (1 for each batch), example command:
    ```
    scp ai_intern@14.224.156.113:/dataset/AIC_2025/SIU_Pumpking/0/fps/video_fps_0.json C:\Users\F14_TOMCAT\Downloads\Project\AIC_data
    ```

------------------------------------------------------------
## 4. Set IMAGE_LOCAL_PATH and FPS_PATH in .env file

- Contact the repository owner to get the `.env` file.
- Open the `.env` file and set `IMAGE_LOCAL_PATH` to the full path INCLUDING the image folder name.

  Example:
    > IMAGE_LOCAL_PATH="/mnt/c/Users/F14_TOMCAT/Downloads/Project/AIC_data/0_low_res_autoshot_only"

- Finally, set the FPS_PATH to where the 3 downloaded files are located

  Example:
    > FPS_PATH = ['/mnt/c/Users/F14_TOMCAT/Downloads/Project/AIC_data/video_fps_0.json', '/mnt/c/Users/F14_TOMCAT/Downloads/Project/AIC_data/video_fps_1.json']

------------------------
## 5. Run the Project

- Run the command below to start the service, then go to **http://127.0.0.1:5501**:
```
    python services/hub_service.py
```