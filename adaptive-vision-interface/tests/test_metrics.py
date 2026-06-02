import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# tests/test_metrics.py
from app.metrics import Metrics
import time

def test_metrics_update():
    """Ensure Metrics class updates correctly."""
    metrics = Metrics()
    ts = time.time()
    metrics.update(1, ts)
    data = metrics.export()

    # Match actual export keys
    assert "active_viewers" in data
    assert "frames_processed" in data
    assert isinstance(data["active_viewers"], int)

