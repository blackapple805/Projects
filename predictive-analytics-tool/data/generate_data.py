import pandas as pd
import numpy as np

# Seed for reproducibility
np.random.seed(42)

# Generate random data
data = {
    'feature1': np.random.normal(10, 5, 100),
    'feature2': np.random.normal(20, 10, 100),
    'feature3': np.random.normal(30, 15, 100),
    'feature4': np.random.normal(40, 20, 100),
    'target': np.random.normal(50, 25, 100)
}

df = pd.DataFrame(data)

# Save to CSV
df.to_csv('/workspaces/Projects/predictive-analytics-tool/data/raw/sample_data.csv', index=False)
