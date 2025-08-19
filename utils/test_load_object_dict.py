import ujson
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
