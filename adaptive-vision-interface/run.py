from app.routes import app

if __name__ == "__main__":
    # Start Flask app (threaded=True allows simultaneous stream + metric requests)
    print("🚀 Launching Adaptive Vision Interface on port 5000...")
    app.run(host="0.0.0.0", port=5000, threaded=True)
