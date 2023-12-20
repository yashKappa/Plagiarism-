const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const multer = require('multer');
const session = require('express-session');
const MSSQLStore = require('connect-mssql')(session);
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 9000;

const dbConfig = {
  user: 'sa',
  password: 'yash@2003',
  server: 'DESKTOP-4IBD93F',
  database: 'duplicate',
  options: {
      encrypt: true,
      trustServerCertificate: true,
  },
};

// Connect to SQL Server
sql.connect(dbConfig, async (err) => {
  if (err) {
      console.error('Error connecting to SQL Server:', err);
  } else {
      console.log('Connected to SQL Server');
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "main.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/student", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM student WHERE username = @username AND password = @password";

  const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

  request.query(query, (error, results) => {
      if (error) {
          console.error("Error occurred during login:", error);
          res.redirect("/");
      } else if (results.recordset.length > 0) {
          res.sendFile(path.join(__dirname, "student user/userpanel.html"));
      } else {
          res.redirect("/student/student login.html");
      }
  });
});


app.get("/student/user/userpanel", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "student user/userpanel.html"));
    } else {
        res.redirect("/login");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
