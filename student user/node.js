var student = getCookie('student');
var teacher = getCookie('teacher');
var logged = getCookie('logged');

if (student && logged === 'true') {
    // If the user is a student and logged in, hide the hideLink
    document.getElementById('teacherLink').style.display = 'none';
} else if (teacher && logged === 'true') {
    // If the user is a teacher and logged in, hide the teacherLink
    document.getElementById('hideLink').style.display = 'none';
}

// Function to get cookie value
function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return '';
}


function displaySavedImage(imageData) {
    const imageContainer = document.getElementById('image-container1');
    const image = new Image();
    image.src = imageData;
    imageContainer.appendChild(image);
  }
  
  // Load the saved image from local storage when the page loads
  window.onload = function() {
    const savedImageData = localStorage.getItem('kappa_savedImage');
    if (savedImageData) {
        displaySavedImage(savedImageData);
    }
  };
  
    function saveImage() {
    const input = document.getElementById('image-input');
    const file = input.files[0];
    
    // Check if username exists in cookies
    const username = getCookie('username');
    if (!username) {
        alert("Please enter your username first.");
        return;
    }
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            // Store image data along with username in local storage
            localStorage.setItem(username + '_savedImage', imageData);
            displayImageInMultipleContainers(imageData);
        };
        reader.readAsDataURL(file);
    }
}

function displayImageInMultipleContainers(imageData) {
    // Get both image containers by their IDs
    const container1 = document.getElementById('image-container1');
    const container2 = document.getElementById('image-container2');
    
    // Set the inner HTML of both containers to display the image
    container1.innerHTML = `<img src="${imageData}" alt="Saved Image">`;
    container2.innerHTML = `<img src="${imageData}" alt="Saved Image">`;
}

// Load the image from localStorage when the page loads
window.onload = function() {
    // Check if username exists in cookies
    const username = getCookie('username');
    if (!username) {
        const usernamePrompt = prompt("Please enter your username:");
        if (usernamePrompt) {
            document.cookie = `username=${usernamePrompt}`;
        }
    }
    
    const savedImageData = localStorage.getItem(username + '_savedImage');
    if (savedImageData) {
        displayImageInMultipleContainers(savedImageData);
    }
};

// Function to get the value of a cookie by its name
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}