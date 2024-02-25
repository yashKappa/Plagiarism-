const express = require("express");
const path = require('path');
const sql = require("mssql");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require("mysql");
const MSSQLStore = require('connect-mssql')(session);
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ads'
});

// Connect to the database
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Express middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the root URL ("/")
app.get('/', (req, res) => {
    // Send the index.html file when accessing the root URL
    res.sendFile(path.join(__dirname, './upload/upload.html'));
});

// Route to handle file upload
app.post('/upload', upload.array('files'), (req, res) => {
    const username = req.body.username; // Extract username from request body
    const summary = req.body.summary; 
    const project_name = req.body.project_name;  // Extract summary from request body

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    // Extract file data
    const files = req.files;

    // Insert file data into the database
    const queries = files.map(file => {
        const filename = file.originalname;
        const fileData = file.buffer;
        const query = 'INSERT INTO file (filename, data, username, summary,project_name) VALUES (?, ?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            connection.query(query, [filename, fileData, username, summary, project_name], (err, result) => {
                if (err) {
                    console.error('Error uploading file:', err);
                    reject(err);
                } else {
                    console.log('File uploaded successfully:', filename);
                    resolve();
                }
            });
        });
    });

    // Wait for all queries to complete
    Promise.all(queries)
    res.sendFile(path.join(__dirname, './upload/upload.html'));
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
