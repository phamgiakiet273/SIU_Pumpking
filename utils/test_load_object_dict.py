import ujson
import sys

sys.path.append("/workspace/competitions/AIC_2025/SIU_Pumpking")

from utils.vector_database_util import merge_scores, preprocess_object_dict

OBJECT_PATH = "/dataset/KLTN/object/total_json.json"


dict_obj = {}
with open(OBJECT_PATH, encoding="utf-8-sig") as json_file:
    dict_obj = ujson.load(json_file)
print("Object Dict Loaded")
dict_obj = preprocess_object_dict(dict_obj)
print("Object Dict Preprocessed")

# print(dict_obj)

get_objs = dict_obj.get

video_name = "L15_V024"
frm = "10274"

print(get_objs((video_name, int(frm)), []))
