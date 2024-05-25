
# Personal Finance Manager

## Overview

This project is a Personal Finance Manager web application that allows users to track their income and expenses. Users can log in, view their financial dashboard, add transactions, and delete transactions if necessary. The application uses Node.js with Express for the backend, MySQL for the database, and EJS for rendering the frontend views. The frontend is styled with a modern glassmorphism design.

## Features

- User authentication (login and signup)
- Dashboard displaying total income, expenses, and balance
- Add new transactions (income or expense)
- Delete existing transactions
- Responsive design with glassmorphism UI

## Setup

### Prerequisites

- Node.js and npm installed
- MySQL server installed and running

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/personal-finance-manager.git
   cd personal-finance-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a MySQL database and user:

   ```sql
   CREATE DATABASE your_database_name;
   CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Create the necessary tables:

   ```sql
   USE your_database_name;

   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) NOT NULL,
       password VARCHAR(255) NOT NULL
   );

   CREATE TABLE transactions (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       amount DECIMAL(10, 2) NOT NULL,
       type ENUM('income', 'expense') NOT NULL,
       description VARCHAR(255) NOT NULL,
       date DATE NOT NULL,
       FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

5. Configure the MySQL connection in the `app.js` file:

   ```javascript
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'your_username',
     password: 'your_password',
     database: 'your_database_name'
   });

   db.connect((err) => {
     if (err) {
       throw err;
     }
     console.log('MySQL Connected...');
   });
   ```

### Running the Application

1. Start the application:

   ```bash
   node app.js
   ```

2. Open your browser and navigate to `http://localhost:3000`.

## Detailed Explanation

### Backend

The backend is built using Node.js with the Express framework. The following routes are defined:

- `/`: Renders the login page.
- `/login`: Authenticates the user and redirects to the dashboard.
- `/dashboard`: Displays the user's financial dashboard with transactions.
- `/add-transaction`: Renders the form to add a new transaction.
- `/add-transaction` (POST): Handles the submission of the new transaction form.
- `/delete-transaction/:id`: Deletes a transaction.
- `/signup`: Renders the signup page.
- `/signup` (POST): Handles the creation of a new user.
- `/logout`: Logs the user out and redirects to the login page.

### Frontend

The frontend is rendered using EJS templates. The key templates are:

- `login.ejs`: The login page with a form for username and password.
- `dashboard.ejs`: The dashboard displaying the user's transactions and a summary of their finances.
- `add-transaction.ejs`: The form for adding a new transaction.
- `signup.ejs`: The signup page for creating a new user account.

The frontend uses a glassmorphism design to create a modern and visually appealing UI.

### Database Connection

The MySQL connection is set up in the `app.js` file using the `mysql` Node.js package. The connection configuration includes the host, user, password, and database name. Once the connection is established, it is used to execute queries for user authentication, retrieving transactions, adding transactions, and deleting transactions.

### Data Validation

The application includes basic validation to ensure that only numeric values can be entered for the amount field in the add transaction form. This is implemented using JavaScript in the frontend.
