import ujson
from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    # Project root is detected by content (it holds configs/ and utils/)
    # rather than by folder name, so the tree can be checked out under any
    # directory name - e.g. SIU_Pumpking_local on a client machine.
    if (parent / "configs").is_dir() and (parent / "utils").is_dir():
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find the SIU_Pumpking project root (a parent directory containing configs/ and utils/).")

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
