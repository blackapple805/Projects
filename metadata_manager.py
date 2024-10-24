import pandas as pd
from sqlalchemy import create_engine, text

# Database connection parameters
db_user = 'yourusername'      # Replace with your actual username
db_password = 'yourpassword'  # Replace with your actual password
db_host = 'localhost'
db_port = '5432'
db_name = 'yourdatabase'      # Replace with your actual database name

# Create the SQLAlchemy engine
engine = create_engine(f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}')

try:
    # Connect to the PostgreSQL database using the engine
    with engine.connect() as conn:
        # Create the data_dictionary table if it doesn't exist
        conn.execute(text('''
            CREATE TABLE IF NOT EXISTS data_dictionary (
                cde_name VARCHAR(100) PRIMARY KEY,
                definition TEXT NOT NULL,
                data_type VARCHAR(50) NOT NULL,
                owner VARCHAR(100),
                source_system VARCHAR(100)
            );
        '''))

        # Insert sample data into the data_dictionary table
        conn.execute(text('''
            INSERT INTO data_dictionary (cde_name, definition, data_type, owner, source_system)
            VALUES
                ('cost_center', 'A department within the organization', 'VARCHAR', 'Finance Dept.', 'ERP System'),
                ('business_segment', 'A division of business operations', 'VARCHAR', 'Sales Dept.', 'CRM System'),
                ('chart_of_accounts', 'Listing of all accounts in the general ledger', 'INTEGER', 'Accounting Dept.', 'Finance Database')
            ON CONFLICT (cde_name) DO NOTHING;
        '''))

        # Read data from the data_dictionary table
        df = pd.read_sql('SELECT * FROM data_dictionary', conn)

        # Display the data
        print(df)

except Exception as e:
    print(f"An error occurred: {e}")

