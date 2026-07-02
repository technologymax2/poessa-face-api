import sys
import json
import cv2

image_path = sys.argv[1]

image = cv2.imread(image_path)

if image is None:
    print(json.dumps({
        "live": False,
        "score": 0,
        "error": "Cannot read image"
    }))
    sys.exit()

height, width = image.shape[:2]

# Simple quality check
if width >= 200 and height >= 200:
    print(json.dumps({
        "live": True,
        "score": 0.90
    }))
else:
    print(json.dumps({
        "live": False,
        "score": 0.20
    }))