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
## 3. Prepare the image directory

- Save your `images` folder anywhere on your machine.
- Copy the full path of the folder (example below):

    */mnt/c/Users/F14_TOMCAT/Downloads/Project/0_low_res_autoshot_only*

---------------------------------------------------------------
## 4. Edit nginx.conf to set the correct image directory (No folder name)

- Open the file: `nginx/conf/nginx.conf`
- Go to line 33
- Replace the path there with the copied path, WITHOUT the folder name.

  Example:
  > alias /mnt/c/Users/F14_TOMCAT/Downloads/Project/;

------------------------------------------------------------
## 5. Set IMAGE_LOCAL_PATH in .env file (WITH folder name included)

- Contact the repository owner to get the `.env` file.
- Open the `.env` file and set `IMAGE_LOCAL_PATH` to the full path INCLUDING the image folder name.

  Example:
    > IMAGE_LOCAL_PATH="/mnt/c/Users/F14_TOMCAT/Downloads/Project/0_low_res_autoshot_only"

------------------------
## 6. Run the Project

- Run the following command to start the service:
```
    python services/hub_service.py
```