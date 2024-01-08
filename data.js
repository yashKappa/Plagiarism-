const express = require("express");
const path = require('path');
const sql = require("mssql");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MSSQLStore = require('connect-mssql')(session);
const app = express();
const mysql = require('mysql');
const ejs = require('ejs');
const PORT = 3000;


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ads',
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('MySQL database connected!');
});
// Set the 'views' directory
app.set('views', path.join(__dirname, 'views'));

// Set the 'public' directory for static files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Define a route to fetch data from the 'student' table
// Update the route to render the 'status' view
app.get('/status', (req, res) => {
  const query = 'SELECT * FROM student';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Render the 'status.ejs' page and pass the query results
    res.render('status', { data: results, title: 'File Status' });
  });
});


// Serve the status.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'status.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});