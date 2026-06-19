"""Generate reproducible sample data for the predictive analytics tool."""
from pathlib import Path

import numpy as np
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent
RAW_DIR = DATA_DIR / "raw"
OUTPUT = RAW_DIR / "sample_data.csv"


def generate(n_rows: int = 2000, noise_sd: float = 8.0, seed: int = 42) -> pd.DataFrame:
    """Create features plus a target that linearly depends on them, with noise."""
    rng = np.random.default_rng(seed)
    f1 = rng.normal(10, 5, n_rows)
    f2 = rng.normal(20, 10, n_rows)
    f3 = rng.normal(30, 15, n_rows)
    f4 = rng.normal(40, 20, n_rows)
    noise = rng.normal(0, noise_sd, n_rows)
    target = 2.0 * f1 - 1.5 * f2 + 0.5 * f3 + 0.25 * f4 + noise
    return pd.DataFrame(
        {"feature1": f1, "feature2": f2, "feature3": f3, "feature4": f4, "target": target}
    )


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    df = generate()
    df.to_csv(OUTPUT, index=False)
    print(f"Wrote {len(df)} rows to {OUTPUT}")


if __name__ == "__main__":
    main()
