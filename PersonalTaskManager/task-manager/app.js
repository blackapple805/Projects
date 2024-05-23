document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
  
    const renderLogin = () => {
      app.innerHTML = `
        <div class="container">
          <h2>Login</h2>
          <form id="loginForm">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
          </form>
        </div>
      `;
  
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Here you would handle the login logic, e.g., send a request to your server
        try {
          const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          
          if (response.ok) {
            const data = await response.json();
            // Handle successful login, e.g., store token and redirect
            console.log('Login successful:', data);
          } else {
            console.error('Login failed:', response.statusText);
          }
        } catch (error) {
          console.error('Error during login:', error);
        }
      });
    };
  
    renderLogin();
  });
  