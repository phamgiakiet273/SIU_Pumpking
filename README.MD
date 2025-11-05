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

    */mnt/c/Users/F14_TOMCAT/Downloads/Project/AIC_data/*


------------------------------------------------------------
## 4. Set IMAGE_LOCAL_PATH in .env file

- Contact the repository owner to get the `.env` file.
- Open the `.env` file and set `IMAGE_LOCAL_PATH` to the full path INCLUDING the image folder name.

  Example:
    > IMAGE_LOCAL_PATH="/mnt/c/Users/F14_TOMCAT/Downloads/Project/AIC_data/"

NOTE: make sure inside AIC_data are 2 folder name `0` and `1` (for 2 batches)
Example full path:
    > "C:\Users\F14_TOMCAT\Downloads\Project\AIC_data\0\frames\low_res_autoshot\Keyframes_L25\keyframes\L25_V088\43358.avif"
Example full img folder path:
```
    C:\Users\F14_TOMCAT\Downloads\Project\AIC_data\
    ├── 0\frames\low_res_autoshot
        └──Keyframes_L21
        └──Keyframes_L22
        └──...
    └── 1\frames\low_res_autoshot
        └──Keyframes_K06
        └──Keyframes_K07
        └──...
```
------------------------
## 5. Run the Project

- Run the command below to start the service, then go to **http://127.0.0.1:5501**:
```
    uvicorn services.hub_service:app --host 127.0.0.1 --port 5501
```

