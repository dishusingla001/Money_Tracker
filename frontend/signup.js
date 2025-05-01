function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(e) {
    if (!e.target.matches('.dropbtn')) {
    var myDropdown = document.getElementById("myDropdown");
      if (myDropdown.classList.contains('show')) {
        myDropdown.classList.remove('show');
      }
    }
  }
 // Signup form submission handler
document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault(); // Prevent the form from refreshing the page

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
      const response = await fetch('/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
      });

      const result = await response.text();
      alert(result); // Show server response (success or error)
  } catch (err) {
      console.error('Error:', err);
      alert('Failed to create account.');
  }
});
