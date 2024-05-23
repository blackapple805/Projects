import pandas as pd

def load_data(file_path):
    return pd.read_csv(file_path)

def clean_data(df):
    # Remove any rows with missing values
    df = df.dropna()
    
    # Example of converting a categorical column to numerical (if applicable)
    # df['category_column'] = df['category_column'].astype('category').cat.codes
    
    return df

def process_data(df):
    # Normalize features
    for column in df.columns[:-1]:  # Assuming the last column is the target
        df[column] = (df[column] - df[column].mean()) / df[column].std()
    
    return df
