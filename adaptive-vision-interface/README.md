# Adaptive Vision Interface

A lightweight edge-vision prototype capturing, processing, and adapting to human presence in real time.  
Built to demonstrate **sensor integration**, **real-time vision pipelines**, and **embedded observability** for presentation or portfolio.

---

## Key Features
- Real-time camera streaming via Flask.
- Face, upper-body, full-body, and hand gesture (fist, open palm, pointing) detection.
- Wave and clap gesture detection.
- Modular architecture (camera → detection → metrics).
- Designed for deployment on embedded or edge systems.

---

## Quick Start
```bash
git clone https://github.com/YourUsername/YourRepoName.git
cd YourRepoName
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py
```
Then open your browser at `http://<VM_IP>:5000` for live feed.

---

## System Diagram
```
Camera → OpenCV/MediaPipe → Detection/Classification → Flask Stream + Metrics API
```

---

## Technologies
| Layer         | Tools                 |
|--------------|------------------------|
| Vision        | OpenCV, MediaPipe      |
| Backend       | Python 3, Flask        |
| Metrics       | JSON endpoint          |
| Deployment    | Docker (optional)      |

---

## Future Enhancements
- Schlump automatic brightness/motion control.
- Add directional wave detection (left→right / right→left).
- Containerize with Docker and integrate CI/CD.
- Publish metrics to Prometheus + Grafana.

---

## License
Licensed under the MIT License. See `LICENSE` file for details.
