# Personal Finance Manager

## Overview
The Personal Finance Manager is a web application designed to help you track your incomes and expenses. It allows you to categorize transactions, generate reports, set budgets, and predict future expenses and savings based on historical data. The application is built using Python, Flask, and Firebase as the database.

## Features
- **Track Incomes and Expenses:** Add and view transactions with details such as date, category, amount, and type (income or expense).
- **Categorize Transactions:** Organize transactions into categories for better management and analysis.
- **Generate Reports:** Visualize monthly expenses through charts and graphs.
- **Set Budgets:** Set a budget and track your spending to ensure you stay within your financial limits.
- **Predict Future Expenses:** Analyze historical data to forecast future expenses and savings.

## Technologies Used
- **Python:** Backend programming language.
- **Flask:** Web framework for creating the web interface.
- **Firebase:** Cloud Firestore for storing transaction data.
- **Pandas:** Data analysis library.
- **Matplotlib:** Data visualization library.

## Getting Started

### Prerequisites
- Python 3.x
- Firebase account and project setup
- Firebase Admin SDK JSON key

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/personal_finance_manager.git
    cd personal_finance_manager
    ```

2. **Create a virtual environment and activate it:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install the required packages:**
    ```bash
    pip install flask firebase-admin python-dotenv
    ```

4. **Set up Firebase:**
    - Download your Firebase Admin SDK JSON key from the Firebase console.
    - Save it in the project directory and create a  file with the following content:
      ```
      GOOGLE_APPLICATION_CREDENTIALS=personal_finance_manager/personalfinace-2145d-firebase-adminsdk-r6kb5-80dc29166b.json
      ```

### Running the Application

1. **Start the Flask app:**
    ```bash
    python app.py
    ```

2. **Open your browser and go to `http://127.0.0.1:5000/` to interact with the web interface.**

## File Structure

personal_finance_manager/
├── app.py # Main Flask application
├── firebase_config.py # Firebase setup and configuration
├── .env # Environment variables
├── README.md # Project documentation
└── templates/
    └── index.html # HTML template for the web interface
└── static/
    └── styles.css # CSS styles for the web interface
