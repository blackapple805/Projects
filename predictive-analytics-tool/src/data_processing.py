"""Data loading, cleaning, and feature normalization."""
from pathlib import Path

import pandas as pd

TARGET_COLUMN = "target"


def load_data(file_path: str | Path) -> pd.DataFrame:
    """Load a CSV file into a DataFrame."""
    return pd.read_csv(file_path)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Drop rows with missing values. Returns a new DataFrame."""
    return df.dropna().reset_index(drop=True)


def process_data(df: pd.DataFrame, target_column: str = TARGET_COLUMN) -> pd.DataFrame:
    """Z-score normalize every feature column, leaving the target untouched.

    Guards against zero-variance columns (which would produce NaN/inf).
    """
    df = df.copy()
    feature_columns = [c for c in df.columns if c != target_column]
    for column in feature_columns:
        std = df[column].std()
        if std == 0 or pd.isna(std):
            df[column] = 0.0  # constant column -> no information, set to 0
        else:
            df[column] = (df[column] - df[column].mean()) / std
    return df


def split_features_target(df: pd.DataFrame, target_column: str = TARGET_COLUMN):
    """Return (X, y) where X is the feature frame and y is the target series."""
    X = df.drop(columns=[target_column])
    y = df[target_column]
    return X, y
