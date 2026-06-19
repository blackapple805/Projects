"""Plotting helpers."""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


def plot_data(df, save_path: Path | None = None):
    ax = df.plot(figsize=(10, 6), title="Raw data by column")
    ax.set_xlabel("row index")
    _finish(save_path)


def plot_predictions(y_true, y_pred, save_path: Path | None = None):
    """Scatter predicted vs. actual with an ideal-fit reference line."""
    y_true = np.asarray(y_true); y_pred = np.asarray(y_pred)
    fig, ax = plt.subplots(figsize=(7, 7))
    ax.scatter(y_true, y_pred, alpha=0.5, edgecolor="k", linewidth=0.3)
    lo, hi = min(y_true.min(), y_pred.min()), max(y_true.max(), y_pred.max())
    ax.plot([lo, hi], [lo, hi], "r--", label="perfect prediction")
    ax.set_xlabel("Actual"); ax.set_ylabel("Predicted")
    ax.set_title("Predicted vs. Actual"); ax.legend()
    _finish(save_path)


def plot_residuals(y_true, y_pred, save_path: Path | None = None):
    """Residuals vs. predicted: a healthy model shows a flat cloud around 0."""
    y_true = np.asarray(y_true); y_pred = np.asarray(y_pred)
    resid = y_true - y_pred
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(y_pred, resid, alpha=0.5, edgecolor="k", linewidth=0.3)
    ax.axhline(0, color="r", ls="--")
    ax.set_xlabel("Predicted"); ax.set_ylabel("Residual (actual - predicted)")
    ax.set_title("Residual plot")
    _finish(save_path)


def plot_model_comparison(results, save_path: Path | None = None):
    """Bar chart of cross-validated R2 per candidate model, with error bars."""
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(results["model"], results["cv_r2_mean"],
           yerr=results["cv_r2_std"], capsize=5, color="#4C72B0", edgecolor="k")
    ax.set_ylabel("Cross-validated R2"); ax.set_ylim(0, 1)
    ax.set_title("Model comparison (5-fold CV)")
    for i, v in enumerate(results["cv_r2_mean"]):
        ax.text(i, v + 0.02, f"{v:.3f}", ha="center", fontweight="bold")
    _finish(save_path)


def plot_feature_importance(model, feature_names, save_path: Path | None = None):
    """Show feature importance (tree models) or absolute coefficients (linear)."""
    if hasattr(model, "feature_importances_"):
        vals, label = model.feature_importances_, "Importance"
    elif hasattr(model, "coef_"):
        vals, label = np.abs(model.coef_), "abs(coefficient)"
    else:
        return
    order = np.argsort(vals)[::-1]
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(np.array(feature_names)[order], np.array(vals)[order],
           color="#55A868", edgecolor="k")
    ax.set_ylabel(label); ax.set_title(f"Feature {label} ({type(model).__name__})")
    _finish(save_path)


def _finish(save_path: Path | None) -> None:
    if save_path is not None:
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        plt.tight_layout(); plt.savefig(save_path, dpi=120); plt.close()
        print(f"Saved plot to {save_path}")
    else:
        plt.show()
