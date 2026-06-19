"""Model training, comparison, evaluation, and persistence."""
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
DEFAULT_MODEL_PATH = MODELS_DIR / "model.pkl"

# Candidate models compared during selection.
def _candidates(random_state: int = 42):
    return {
        "LinearRegression": LinearRegression(),
        "RandomForest": RandomForestRegressor(n_estimators=300, random_state=random_state),
        "GradientBoosting": GradientBoostingRegressor(random_state=random_state),
    }


def compare_models(X, y, cv: int = 5, random_state: int = 42) -> pd.DataFrame:
    """Cross-validate every candidate and return a sorted results table."""
    rows = []
    for name, model in _candidates(random_state).items():
        scores = cross_val_score(model, X, y, cv=cv, scoring="r2")
        rows.append({"model": name, "cv_r2_mean": scores.mean(), "cv_r2_std": scores.std()})
    return pd.DataFrame(rows).sort_values("cv_r2_mean", ascending=False).reset_index(drop=True)


def train_model(X, y, model_path: Path = DEFAULT_MODEL_PATH, random_state: int = 42,
                model=None):
    """Train the chosen model (best by CV if none supplied), evaluate on a
    holdout, persist, and return (model, metrics, results_table)."""
    results = compare_models(X, y, random_state=random_state)
    if model is None:
        best_name = results.iloc[0]["model"]
        model = _candidates(random_state)[best_name]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state
    )
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    metrics = {
        "model": type(model).__name__,
        "r2": float(r2_score(y_test, preds)),
        "mae": float(mean_absolute_error(y_test, preds)),
    }

    model_path = Path(model_path)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    return model, metrics, results


def load_model(model_path: Path = DEFAULT_MODEL_PATH):
    return joblib.load(model_path)
