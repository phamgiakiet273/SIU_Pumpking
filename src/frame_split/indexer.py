import os
import pathlib
from pathlib import Path
import ujson
from collections import OrderedDict

# dataset_0_path = "/dataset/AIC2023/pumkin_dataset/0/frames/pyscenedetect/"
# dataset_1_path = "/dataset/AIC2023/pumkin_dataset/1/frames/pyscenedetect/"
# dataset_2_path = "/dataset/AIC2023/pumkin_dataset/2/frames/pyscenedetect/"

# dataset_0_t5_path = "/dataset/AIC2024/pumkin_dataset/0/frames/pyscenedetect_t_5/"
# dataset_1_t5_path = "/dataset/AIC2024/pumkin_dataset/1/frames/pyscenedetect_t_5/"
# dataset_2_t5_path = "/dataset/AIC2024/pumkin_dataset/2/frames/pyscenedetect_t_5/"

dataset_0_autoshot_path = "/dataset/KLTN/0/frames/autoshot"

dataset_1_autoshot_path = "/dataset/KLTN/1/frames/autoshot"

dataset_2_autoshot_path = "/dataset/KLTN/2/frames/autoshot"

# dataset_test_path = "/dataset/AIC2024/pumkin_dataset/1/frames/pyscenedetect/"


def indexing(dataset_path, output_file, entire=True, entire_folder=None):
    visited = []
    index_dict = {}
    for file in Path(dataset_path).glob("**/*.jpg"):
        if not file.is_file():  # Skip directories
            continue
        video_name = str(pathlib.PurePath(file).parent.name)
        folder_name = str(pathlib.PurePath(file).parent)
        if video_name in visited:
            continue
        visited.append(video_name)
        print(video_name)
        list_image = []

        for image in Path(folder_name).glob("**/*.jpg"):
            image_name = str(pathlib.PurePath(image).name)
            real_image_name = str(pathlib.PurePath(image).stem)
            # print(image_name, real_image_name, video_name, folder_name)
            list_image.append(real_image_name)
        list_image = sorted(list_image)
        for item in list_image:
            index_dict[(video_name, item)] = list_image.index(item)
        # print(index_dict)

        if entire == False:
            save_dict = OrderedDict()
            for item in index_dict:
                save_dict[int(item[1])] = index_dict[item]
            with open(entire_folder + "/" + video_name + ".json", "w") as outfile:
                ujson.dump(save_dict, outfile, indent=4)
            save_dict.clear()
            index_dict.clear()

    if entire == True:
        index_dict = OrderedDict(index_dict.items())
        with open(output_file, "w") as outfile:
            ujson.dump(index_dict, outfile, indent=4)


# indexing(dataset_test_path,
#          output_file="/workspace/competitions/AIC_2024/SIU_Pumpkin/base_2023/SIU_Pumpkin/utils/feature_extraction/index_test/index_test.json")

indexing(
    dataset_0_autoshot_path,
    output_file="/dataset/KLTN/0/index/index_autoshot_0.json",
    entire=False,
    entire_folder="/dataset/KLTN/0/index",
)

indexing(
    dataset_1_autoshot_path,
    output_file="/dataset/KLTN/1/index/index_autoshot_1.json",
    entire=False,
    entire_folder="/dataset/KLTN/1/index",
)

indexing(
    dataset_2_autoshot_path,
    output_file="/dataset/KLTN/2/index/index_autoshot_2.json",
    entire=False,
    entire_folder="/dataset/KLTN/2/index",
)
