// Ensure that this script runs after the Firebase SDK is loaded and initialized
const database = firebase.database();

// Function to register a new user
function registerUser() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Create a new user with email and password
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Get the user ID and store additional information in the database
      const userId = userCredential.user.uid;

      // Store user data in the database (you can customize this structure)
      database.ref('users/' + userId).set({
        username: username,
        email: email,
        // Add more fields as needed
      });

      alert('Registration successful!');
    })
    .catch((error) => {
      alert('Registration failed: ' + error.message);
    });
}
