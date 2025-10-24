import json
import random
import time
from pathlib import Path  # <-- required import
# --- Configuration ---
# Define the simulated network nodes (5 total)
NODES = [f"node{i}" for i in range(1,6)]

# Define output file path (ensures directory exists)
METRICS_FILE = Path("app/metrics.json")
METRICS_FILE.parent.mkdir(parents=True, exist_ok=True)

def generate():
    """
    Simulates network performance metrics for each virtual node.
    Produces random latency and packet loss values,
    then logs them to a JSON file (metrics.json).
    """
        
    data = []
    # Loop through each virtual node to generate metrics
    for n in NODES:
        latency = random.uniform(20,200)    # milliseconds
        loss = random.uniform(0,3)          # packet loss percentage
        data.append({"node": n, "latency": latency, "loss": loss, "timestamp": time.time()})
    # Write JSON data to file (overwrite each cycle)   
    with METRICS_FILE.open("w") as f:
        json.dump(data, f, indent=2)

    print(f"[{time.strftime('%H:%M:%S')}] Metrics updated for {len(NODES)} nodes.")

if __name__ == "__main__":
    # Loop indefinitely, refreshing metrics every 5 seconds
    while True:
        generate()
        time.sleep(5)