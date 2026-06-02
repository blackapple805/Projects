# --- Imports ---
import numpy as np           # For numerical computation and array handling
import joblib                # For saving/loading trained models
from sklearn.linear_model import LinearRegression  # Machine learning regression model
import os                    # For safe file path handling


# --- Model paths ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")


def train_model():
    """
    Trains a simple Linear Regression model to predict
    network latency spikes based on latency and packet loss.
    """
    # Generate 100 random samples with two features (latency, loss)
    X = np.random.rand(100, 2) * [200, 3] 
    
    # Create a binary target: spike = 1 if latency > 150 or loss > 2
    y = (X[:, 0] > 150) | (X[:, 1] > 2)
    
    # Fit a linear regression model
    model = LinearRegression().fit(X, y)
    
    # Save the trained model to file
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved at {MODEL_PATH}")


def predict(latency, loss):
    """
    Predicts spike probability given latency and packet loss.
    Loads the pre-trained model from disk.
    """
    # Load trained model
    model = joblib.load(MODEL_PATH)
    
    # Predict using the model
    prediction = model.predict([[latency, loss]])[0]

    # Convert numpy float to Python float for JSON serialization
    return float(prediction)


if __name__ == "__main__":
    train_model()

    