import numpy as np
import pandas as pd

from src.model import compare_models, load_model, train_model


def _toy_data(n=200):
    rng = np.random.default_rng(0)
    X = pd.DataFrame({"a": rng.normal(size=n), "b": rng.normal(size=n)})
    y = 3 * X["a"] - 2 * X["b"]
    return X, y


def test_compare_models_returns_table():
    X, y = _toy_data()
    results = compare_models(X, y)
    assert {"model", "cv_r2_mean", "cv_r2_std"}.issubset(results.columns)
    assert len(results) == 3  # three candidates


def test_train_model_returns_metrics(tmp_path):
    X, y = _toy_data()
    model, metrics, results = train_model(X, y, model_path=tmp_path / "m.pkl")
    assert "r2" in metrics and "mae" in metrics
    assert metrics["r2"] > 0.8  # learnable linear signal


def test_model_persists_and_loads(tmp_path):
    X, y = _toy_data()
    path = tmp_path / "m.pkl"
    train_model(X, y, model_path=path)
    assert path.exists()
    loaded = load_model(path)
    assert len(loaded.predict(X)) == len(y)
