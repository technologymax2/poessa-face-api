import sys
import json
from deepface import DeepFace

registered = "." + sys.argv[1]
selfie = "." + sys.argv[2]

try:
    result = DeepFace.verify(
        img1_path=registered,
        img2_path=selfie,
        model_name="Facenet512"
    )

    print(json.dumps({
        "match": result["verified"],
        "similarity": 1 - result["distance"]
    }))

except Exception as e:
    print(json.dumps({
        "match": False,
        "similarity": 0,
        "error": str(e)
    }))
