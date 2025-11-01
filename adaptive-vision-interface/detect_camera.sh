#!/bin/bash
echo "Detecting available cameras..."
rm -f .env

# Find the first real /dev/videoX that works
for dev in /dev/video*; do
  if [ -e "$dev" ]; then
    idx=${dev#/dev/video}
    if python3 - <<EOF >/dev/null 2>&1
import cv2
cap = cv2.VideoCapture($idx)
ok, frame = cap.read()
cap.release()
if ok and frame is not None:
    print("FOUND")
EOF
    then
      echo "Detected working camera: $dev"
      echo "CAMERA_PATH=$dev" > .env
      exit 0
    fi
  fi
done

echo "No working camera found."
exit 1
