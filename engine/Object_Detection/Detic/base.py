import sys
import torch

from detectron2.config import get_cfg
from detectron2.data import MetadataCatalog
from detectron2.data.detection_utils import read_image
from detectron2.engine import DefaultPredictor
from detectron2.utils.visualizer import ColorMode, Visualizer

sys.path.insert(0, "third_party/CenterNet2/")

from centernet.config import add_centernet_config
from detic.config import add_detic_config
from detic.modeling.utils import reset_cls_test

BUILDIN_CLASSIFIER = {
   "lvis": "datasets/metadata/lvis_v1_clip_a+cname.npy",
   "objects365": "datasets/metadata/o365_clip_a+cnamefix.npy",
   "openimages": "datasets/metadata/oid_clip_a+cname.npy",
   "coco": "datasets/metadata/coco_clip_a+cname.npy",
}
BUILDIN_METADATA_PATH = {
   "lvis": "lvis_v1_val",
   "objects365": "objects365_v2_val",
   "openimages": "oid_val_expanded",
   "coco": "coco_2017_val",
}

# Load model's configuration
cfg = get_cfg()
add_centernet_config(cfg)
add_detic_config(cfg)
cfg.merge_from_file("configs/Detic_LCOCOI21k_CLIP_SwinB_896b32_4x_ft4x_max-size.yaml")

# Configure prediction settings
cfg.MODEL.RETINANET.SCORE_THRESH_TEST = 0.5
cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5
cfg.MODEL.PANOPTIC_FPN.COMBINE.INSTANCES_CONFIDENCE_THRESH = 0.5
cfg.MODEL.ROI_BOX_HEAD.ZEROSHOT_WEIGHT_PATH = "rand"

# Where model weights are located and how to load them
cfg.MODEL.DEVICE = "cuda"
cfg.MODEL.WEIGHTS = "/workspace/competitions/AIC_2025/SIU_Pumpking/data/weights/Detic_LCOCOI21k_CLIP_SwinB_896b32_4x_ft4x_max-size.pth"
cfg.freeze()

vocabulary = "lvis"  # try 'lvis', 'objects365', 'openimages', or 'coco'
predictor = DefaultPredictor(cfg)
metadata = MetadataCatalog.get(BUILDIN_METADATA_PATH[vocabulary])
classifier = BUILDIN_CLASSIFIER[vocabulary]
num_classes = len(metadata.thing_classes)
reset_cls_test(predictor.model, classifier, num_classes)

im = read_image("/workspace/competitions/AIC_2025/SIU_Pumpking/data/example/animal_pf_test_2.jpg")

predictions = predictor(im)
metadata = MetadataCatalog.get(BUILDIN_METADATA_PATH["lvis"])
visualizer = Visualizer(
   im[:, :, ::-1], metadata=metadata, instance_mode=ColorMode.IMAGE
)
instances = predictions["instances"].to(torch.device("cpu"))
vis_output = visualizer.draw_instance_predictions(predictions=instances)
print(predictions)
vis_output.save("detic_output.jpg")