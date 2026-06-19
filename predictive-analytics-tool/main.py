"""End-to-end pipeline: generate -> load -> clean -> process -> compare models
-> train best -> evaluate -> visualize."""
from pathlib import Path

from sklearn.model_selection import train_test_split

from src.data_processing import clean_data, load_data, process_data, split_features_target
from src.model import train_model
from src.visualization import (
    plot_feature_importance,
    plot_model_comparison,
    plot_predictions,
    plot_residuals,
)

ROOT = Path(__file__).resolve().parent
RAW_CSV = ROOT / "data" / "raw" / "sample_data.csv"
REPORTS = ROOT / "reports"


def main() -> None:
    if not RAW_CSV.exists():
        print("Sample data not found; generating it...")
        from data.generate_data import main as generate
        generate()

    df = process_data(clean_data(load_data(RAW_CSV)))
    X, y = split_features_target(df)

    model, metrics, results = train_model(X, y)

    print("\nModel comparison (5-fold CV R2):")
    print(results.to_string(index=False))
    print(f"\nSelected: {metrics['model']}")
    print(f"Holdout R2:  {metrics['r2']:.3f}")
    print(f"Holdout MAE: {metrics['mae']:.3f}")

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    preds = model.predict(X_test)

    plot_model_comparison(results, REPORTS / "model_comparison.png")
    plot_predictions(y_test, preds, REPORTS / "predicted_vs_actual.png")
    plot_residuals(y_test, preds, REPORTS / "residuals.png")
    plot_feature_importance(model, list(X.columns), REPORTS / "feature_importance.png")


if __name__ == "__main__":
    main()
