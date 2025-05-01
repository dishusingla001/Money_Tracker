document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('authToken', result.token); // Save JWT token
            alert('Login successful!');
            window.location.href = 'welcome.html'; // Redirect to welcome page
        } else {
            const errorText = await response.text();
            alert(errorText);
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Failed to log in.');
    }
});
async function updateNavbar() {
    const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    if (!token) return; // If no token, show login option

    try {
        const response = await fetch('/loggedin-user', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const user = await response.json();
            const authLink = document.getElementById('auth-link');
            authLink.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;

            const navbar = document.getElementById('navbar');
            const userWelcome = document.createElement('li');
            userWelcome.textContent = `Welcome, ${user.username}`;
            userWelcome.style.color = 'white';
            userWelcome.style.fontWeight = 'bold';

            navbar.querySelector('ul').prepend(userWelcome);
        }
    } catch (error) {
        console.log('Error updating navbar:', error);
    }
}
async function logout() {
    const token = localStorage.getItem('authToken'); // Retrieve token
    if (!token) return;

    try {
        const response = await fetch('/logout', { method: 'POST' });
        if (response.ok) {
            localStorage.removeItem('authToken'); // Clear token
            alert('Logged out successfully!');
            window.location.href = 'login.html'; // Redirect to login
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Call updateNavbar on page load
document.addEventListener('DOMContentLoaded', updateNavbar);
async function logout() {
    const token = localStorage.getItem('authToken'); // Retrieve token
    if (!token) return;

    try {
        const response = await fetch('/logout', { method: 'POST' });
        if (response.ok) {
            localStorage.removeItem('authToken'); // Clear token
            alert('Logged out successfully!');
            window.location.href = 'login.html'; // Redirect to login
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Call updateNavbar on page load
document.addEventListener('DOMContentLoaded', updateNavbar);

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault(); // ⛔ Stops the page from reloading
    // Handle login logic here...
  });
  