const darkModePreference = localStorage.getItem('darkMode');
const dark = document.getElementById("dark");
const loo = document.getElementById("loo");

if (darkModePreference === 'enabled') {
    document.body.classList.add('dark-theme');
    dark.src = "moons.png"; // Set the image to sun.png in dark mode
    loo.src = "dark1.png";
} else {
    dark.src = "suns.png"; // Set the image to moon.png in light mode
    loo.src = "light1.png";
}

dark.onclick = function () {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem('darkMode', 'enabled');
        dark.src = "moons.png";
        loo.src = "dark1.png";
    } else {
        localStorage.setItem('darkMode', 'disabled');
        dark.src = "suns.png";
        loo.src = "light1.png";
    }
}

//// file uploaded code /////

window.addEventListener("load", () => {
    const input = document.getElementById("fileInput");
    const filewrapper = document.getElementById("filewrapper");
    const successMessage = document.getElementById("successMessage");

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

            // Add a delete button for each file
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                listElem.removeChild(listItemElem);
            });

            listItemElem.appendChild(deleteButton);
            listElem.appendChild(listItemElem);
        }

        // Clear existing file list
        while (filewrapper.firstChild) {
            filewrapper.removeChild(filewrapper.firstChild);
        }

        filewrapper.appendChild(listElem);
        filewrapper.style.display = "block"; // Show the file list
    }

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
                successMessage.classList.remove("hidden");
                console.log("Files uploaded successfully.");

                // Set a timer to hide the successMessage after 3000 milliseconds (3 seconds)
                setTimeout(() => {
                    successMessage.classList.add("hidden");
                }, 3000);

                filewrapper.style.display = "none"; // Hide the file list
            } else {
                // Handle any errors here
                ErrorMessage.classList.append("Er");
                console.error("Error");
            }
        })
        .catch(error => {
            // Handle network errors here
            showPopupMessage("Network error");
            console.error("Network error:", error);
        });
        this.reset();
    });
});

function handleFileSelect() {
    var fileInput = document.getElementById("fileInput");
    var uploadButton = document.getElementById("uploadButton");

    if (fileInput.files.length > 0) {
        // Files selected, hide the upload button
        uploadButton.style.display = "flex";
    } else {
        // No files selected, show the upload button
        uploadButton.style.display = "none";
    }
}
//// file uploaded code /////

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

function checkPlagiarism() {
    // Get the content of both editors
    const editor1 = ace.edit("editor");
    const editor2 = ace.edit("editor1");
    const code1 = editor1.getValue();
    const code2 = editor2.getValue();

    // Check if either editor is empty
    if (!code1.trim() || !code2.trim()) {
        displayPopup('Please input code in both editors.');
        clearCopiedLines();
        clearNotSimilarLines();
        return;
    }

    // Function to normalize a line by removing comments and handling whitespace variations
    function normalizeLine(line) {
        // Remove comments and leading/trailing white spaces
        const trimmedLine = line.replace(/\/\/.*$/, '').trim();

        // Handle multiple whitespaces
        const normalizedLine = trimmedLine.replace(/\s+/g, ' ');

        return normalizedLine;
    }

    // Function to split code into lines while maintaining references to the original lines
    const getNormalizedLinesWithReferences = (code) => {
        const lines = code.split('\n');
        return lines.map((line, index) => ({
            originalLine: line,
            normalizedLine: normalizeLine(line),
            lineNumber: index + 1,
        }));
    };

    const linesWithReferences1 = getNormalizedLinesWithReferences(code1);
    const linesWithReferences2 = getNormalizedLinesWithReferences(code2);

    // Initialize variables to track copied and not similar lines
    const copiedLines = [];
    const notSimilarLines1 = [];
    const notSimilarLines2 = [];

    linesWithReferences1.forEach((line1, index1) => {
        let lineIsSimilar = false;
        linesWithReferences2.forEach((line2, index2) => {
            if (line1.normalizedLine === line2.normalizedLine && line1.normalizedLine !== '') {
                copiedLines.push({
                    editor1Line: line1.lineNumber,
                    editor2Line: line2.lineNumber,
                    text: line1.originalLine,
                });
                lineIsSimilar = true;
            }
        });
        if (!lineIsSimilar) {
            notSimilarLines1.push(line1.originalLine);
            notSimilarLines2.push(linesWithReferences2[index1]?.originalLine || ''); // Use empty string for non-existing lines
        }
    });

    // Calculate plagiarism percentage
    const totalLines = Math.max(linesWithReferences1.length, linesWithReferences2.length);
    const nonEmptyLines1 = linesWithReferences1.filter(line => line.normalizedLine !== '').length;
    const nonEmptyLines2 = linesWithReferences2.filter(line => line.normalizedLine !== '').length;
    const copiedPercentage = (copiedLines.length / totalLines) * 100;

    // Display the result
    const resultElement = document.getElementById('result');
    resultElement.textContent = `Plagiarism Percentage: ${Math.min(copiedPercentage, 100).toFixed(2)}%`;

    if (copiedPercentage > 0) {
        // Display copied lines (optional)
        displayCopiedLines(copiedLines);
    } else {
        displayPopup('No similarities found.');
    }

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
function displayNotSimilarLines(lines1, lines2) {
    const notSimilarLinesList = document.getElementById('not-similar-lines-list');
    notSimilarLinesList.innerHTML = '';

    lines1.forEach((line, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Line ${index + 1} (Editor 1): ${line}`;
        notSimilarLinesList.appendChild(listItem);
    });

    lines2.forEach((line, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Line ${index + 1} (Editor 2): ${line}`;
        notSimilarLinesList.appendChild(listItem);
    });

    // Show the not similar lines div
    const notSimilarLinesDiv = document.getElementById('not-similar-lines');
    notSimilarLinesDiv.style.display = 'block';
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

var referrer = document.referrer;

// Check if the referrer is from the "student user" directory
if (referrer.includes("/student user/")) {
    // If the referrer is from "student user," block the back button
    history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };
}


const ejs = require('ejs');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
