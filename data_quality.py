import pandas as pd
from sqlalchemy import create_engine

# Database connection parameters
db_user = 'yourusername'
db_password = 'yourpassword'
db_host = 'localhost'
db_port = '5432'
db_name = 'yourdatabase'

# Create the SQLAlchemy engine
engine = create_engine(f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}')

# Define data quality functions
def check_missing_values(table_name):
    df = pd.read_sql(f'SELECT * FROM {table_name}', engine)
    missing_values = df.isnull().sum()
    print(f'\nMissing values in {table_name}:')
    print(missing_values)

def check_duplicates(table_name):
    df = pd.read_sql(f'SELECT * FROM {table_name}', engine)
    duplicates = df.duplicated().sum()
    print(f'\nDuplicate rows in {table_name}: {duplicates}')

def check_data_types(table_name, expected_types):
    df = pd.read_sql(f'SELECT * FROM {table_name}', engine)
    for column, expected_type in expected_types.items():
        if df[column].dtype != expected_type:
            print(f'Data type mismatch in column {column}: Expected {expected_type}, got {df[column].dtype}')

# Run data quality checks on data_dictionary
check_missing_values('data_dictionary')
check_duplicates('data_dictionary')

