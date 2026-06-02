#!/bin/bash
set -e

case "$1" in
  build)
    docker build --no-cache -t adaptive-vision .
    ;;
  run)
    docker run --rm -p 5000:5000 --device /dev/video0:/dev/video0 adaptive-vision
    ;;
  clean)
    docker system prune -af && docker volume prune -f
    ;;
  *)
    echo "Usage: $0 {build|run|clean}"
    ;;
esac
