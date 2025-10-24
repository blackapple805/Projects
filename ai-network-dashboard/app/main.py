# --- Imports ---
from fastapi import FastAPI
import json
import os
from prometheus_client import Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response


# --- Initialize FastAPI app ---
app = FastAPI()

# --- Prometheus Gauges ---
latency_gauge = Gauge("node_latency_ms", "Node latency", ["node"])
spike_gauge = Gauge("node_spike_prob", "Predicted spike", ["node"])

# --- File paths ---
# Container working directory is /app
METRICS_PATH = os.path.join(os.path.dirname(__file__), "metrics.json")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")


# --- /metrics endpoint ---
@app.get("/metrics")
def metrics():
    if not os.path.exists(METRICS_PATH):
        return {"error": f"Metrics file not found at {METRICS_PATH}. Run simulator.py first."}

    with open(METRICS_PATH, "r") as f:
        data = json.load(f)

    for d in data:
        latency_gauge.labels(d["node"]).set(d["latency"])
        from model import predict
        spike_gauge.labels(d["node"]).set(predict(d["latency"], d["loss"]))

    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


# --- Health endpoint ---
@app.get("/")
def home():
    return {"message": "AI Network Dashboard API is running. Visit /metrics for Prometheus metrics."}
