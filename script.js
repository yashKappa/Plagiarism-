const darkModePreference = localStorage.getItem('darkMode');
const dark = document.getElementById("dark");

if (darkModePreference === 'enabled') {
    document.body.classList.add('dark-theme');
    dark.src = "moons.png"; // Set the image to sun.png in dark mode
    
} else {
    dark.src = "suns.png"; // Set the image to moon.png in light mode
}

dark.onclick = function () {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem('darkMode', 'enabled');
        dark.src = "moons.png";
    } else {
        localStorage.setItem('darkMode', 'disabled');
        dark.src = "suns.png";
    }
}

window.addEventListener("load", () => {
    const input = document.getElementById("fileInput");
    const filewrapper = document.getElementById("filewrapper");

    input.addEventListener("change", (e) => {
        const fileList = e.target.files;
        if (fileList.length > 0) {
            displaySelectedFiles(fileList);
        }
    });

    function displaySelectedFiles(fileList) {
        const listElem = document.createElement("ul");

        for (const file of fileList) {
            const listItemElem = document.createElement("li");
            listItemElem.textContent = file.name;
            listElem.appendChild(listItemElem);
        }

        // Clear existing file list
        while (filewrapper.firstChild) {
            filewrapper.removeChild(filewrapper.firstChild);
        }

        filewrapper.appendChild(listElem);
    }
});

// Prevent the form from automatically redirecting
document.getElementById("uploadForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Use FormData to construct the POST request
    const formData = new FormData(this);

    // Send the POST request using Fetch API
    fetch("/upload", {
        method: "POST",
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            // Handle success here
            showPopupMessage("Your Files Uploaded Successfully");
            console.log("Files uploaded successfully.");
        } else {
            // Handle any errors here
            showPopupMessage("Error uploading files.");
            console.error("Error uploading files.");
        }
    })
    .catch(error => {
        // Handle network errors here
        showPopupMessage("Network error");
        console.error("Network error:", error);
    });
    this.reset();
});

function showPopupMessage(message) {
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;
    const popup = document.getElementById('popup');
    popup.style.display = 'block';

    // Add an event listener to the OK button
    const popupOKButton = document.getElementById('popupOKButton');
    popupOKButton.addEventListener('click', () => {
        // Hide the popup when the OK button is clicked
        popup.style.display = 'none';
    });
}


document.addEventListener("DOMContentLoaded", function() {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/cobalt");
    editor.getSession().setMode("ace/mode/html");
});

document.addEventListener("DOMContentLoaded", function() {
    const editor = ace.edit("editor1");
    editor.setTheme("ace/theme/cobalt");
    editor.getSession().setMode("ace/mode/html");
});

// ... (your existing functions) ...

// Function to update Ace editor content from a file input
function updateEditorFromFile(inputElement, editor) {
    const file = inputElement.files[0];
    if (file) {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async function (e) {
                const data = new Uint8Array(e.target.result);
                const text = decodePdfData(data);
                editor.setValue(text);
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractTextFromDocx(file, function (text) {
                editor.setValue(text);
            });
        } else {
            const reader = new FileReader();
            reader.onload = function (e) {
                editor.setValue(e.target.result);
            };
            reader.readAsText(file);
        }
    }
}

// Event listeners for file input fields
document.getElementById('file1').addEventListener('change', function () {
    updateEditorFromFile(this, ace.edit("editor"));
});

document.getElementById('file2').addEventListener('change', function () {
    updateEditorFromFile(this, ace.edit("editor1"));
});

// Function to check plagiarism between two Ace editor instances
function checkPlagiarism() {
    // Get the content of both editors
    const editor1 = ace.edit("editor");
    const editor2 = ace.edit("editor1");
    const code1 = editor1.getValue();
    const code2 = editor2.getValue();

    // Check if either editor is empty
    if (!code1.trim() || !code2.trim()) {
        displayPopup('Please input code in both editors.');
        // Clear any previously displayed copied lines and not similar lines
        clearCopiedLines();
        clearNotSimilarLines();
        return; // Exit the function
    }

    // Tokenize the code by lines
    const lines1 = code1.split('\n').map(line => line.trim());
    const lines2 = code2.split('\n').map(line => line.trim());

    // Find common lines between the two code snippets
    const commonLines = getCommonLines(lines1, lines2);

    // Check if there are common lines
    if (commonLines.length === 0) {
        displayPopup('No similarities found.');
        // Clear any previously displayed copied lines and not similar lines
        clearCopiedLines();
        clearNotSimilarLines();
        return; // Exit the function
    }

    // Calculate plagiarism percentage
    const plagiarismPercentage = (commonLines.length / Math.max(lines1.length, lines2.length)) * 100;

    // Display the result
    const resultElement = document.getElementById('result');
    resultElement.textContent = `Plagiarism Percentage: ${plagiarismPercentage.toFixed(2)}%`;

    // Find not similar lines
    const notSimilarLines1 = lines1.filter(line1 => !lines2.includes(line1));
    const notSimilarLines2 = lines2.filter(line2 => !lines1.includes(line2));

    // Display copied lines (optional)
    displayCopiedLines(commonLines);

    // Display not similar lines
    displayNotSimilarLines(notSimilarLines1, notSimilarLines2);
}

// Function to find common lines between two arrays
function getCommonLines(array1, array2) {
    const common = [];
    array1.forEach((line1, index1) => {
        array2.forEach((line2, index2) => {
            if (line1 === line2) {
                common.push({ editor1Line: index1 + 1, editor2Line: index2 + 1, text: line1 });
            }
        });
    });
    return common;
}

// Function to display copied lines
function displayCopiedLines(commonLines) {
    const copiedLinesList = document.getElementById('copied-lines-list');
    copiedLinesList.innerHTML = '';

    commonLines.forEach(line => {
        const listItem = document.createElement('li');
        listItem.textContent = `Editor line ${line.editor1Line} = Editor1 line ${line.editor2Line}: ${line.text}`;
        copiedLinesList.appendChild(listItem);
    });

    // Show the copied lines div
    const copiedLinesDiv = document.getElementById('copied-lines');
    copiedLinesDiv.style.display = 'block';
}

// Function to clear copied lines
function clearCopiedLines() {
    const copiedLinesList = document.getElementById('copied-lines-list');
    copiedLinesList.innerHTML = '';

    // Hide the copied lines div
    const copiedLinesDiv = document.getElementById('copied-lines');
    copiedLinesDiv.style.display = 'none';
}

// Function to display not similar lines
function displayNotSimilarLines(lines1, lines2) {
    const notSimilarLinesList = document.getElementById('not-similar-lines-list');
    notSimilarLinesList.innerHTML = '';

    lines1.forEach(line => {
        const listItem = document.createElement('li');
        listItem.textContent = `Not Similar (Editor 1): ${line}`;
        notSimilarLinesList.appendChild(listItem);
    });

    lines2.forEach(line => {
        const listItem = document.createElement('li');
        listItem.textContent = `Not Similar (Editor 2): ${line}`;
        notSimilarLinesList.appendChild(listItem);
    });

    // Show the not similar lines div
    const notSimilarLinesDiv = document.getElementById('not-similar-lines');
    notSimilarLinesDiv.style.display = 'block';
}

// Function to clear not similar lines
function clearNotSimilarLines() {
    const notSimilarLinesList = document.getElementById('not-similar-lines-list');
    notSimilarLinesList.innerHTML = '';

    // Hide the not similar lines div
    const notSimilarLinesDiv = document.getElementById('not-similar-lines');
    notSimilarLinesDiv.style.display = 'none';
}

// Function to display popup messages
function displayPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;
    popup.style.display = 'block';

    // Add an event listener to the OK button
    const okButton = document.querySelector('#popup button');
    okButton.addEventListener('click', () => {
        // Hide the popup when the OK button is clicked
        popup.style.display = 'none';
    });
}
