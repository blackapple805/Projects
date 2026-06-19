import numpy as np
import pandas as pd
import pytest

from src.data_processing import clean_data, process_data, split_features_target


@pytest.fixture
def sample_df():
    return pd.DataFrame(
        {
            "feature1": [1.0, 2.0, 3.0, 4.0],
            "feature2": [10.0, 20.0, 30.0, 40.0],
            "target": [100.0, 200.0, 300.0, 400.0],
        }
    )


def test_clean_data_drops_nan():
    df = pd.DataFrame({"a": [1.0, None, 3.0], "target": [1.0, 2.0, 3.0]})
    cleaned = clean_data(df)
    assert len(cleaned) == 2
    assert not cleaned.isna().any().any()


def test_process_data_normalizes_features(sample_df):
    out = process_data(sample_df)
    # Features should be ~mean 0, std 1; target untouched.
    assert abs(out["feature1"].mean()) < 1e-9
    assert out["target"].tolist() == sample_df["target"].tolist()


def test_process_data_handles_constant_column():
    df = pd.DataFrame({"const": [5.0, 5.0, 5.0], "target": [1.0, 2.0, 3.0]})
    out = process_data(df)
    # Constant column must not become NaN/inf.
    assert out["const"].tolist() == [0.0, 0.0, 0.0]
    assert np.isfinite(out["const"]).all()


def test_process_data_does_not_mutate_input(sample_df):
    before = sample_df["feature1"].tolist()
    process_data(sample_df)
    assert sample_df["feature1"].tolist() == before


def test_split_features_target(sample_df):
    X, y = split_features_target(sample_df)
    assert "target" not in X.columns
    assert y.tolist() == sample_df["target"].tolist()
