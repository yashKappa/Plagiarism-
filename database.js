const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 9000;
const nodemailer = require('nodemailer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ads'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database as ID ' + connection.threadId);
});

app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }
}));

app.use(express.static(__dirname));

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.session.token;

  if (!token) {
    return res.status(403).json({ error: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/main.html");
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/student", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM student WHERE username = ? AND password = ?";
  connection.query(query, [username, password], function (error, results) {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.length > 0) {
      // Generate a JWT token
      const token = jwt.sign({ username: results[0].username }, 'your_secret_key');
      
      // Store the token in the session
      req.session.token = token;

      res.redirect("/student user/userpanel.html");
    } else {
      res.redirect("/student/student login.html");
    }
  });
});

app.get("/student/userpanel.html", verifyToken, function (req, res) {
  res.sendFile(__dirname + "/student/userpanel.html");
});

app.get("/logout", function (req, res) {
  // Clear the session
  req.session.destroy();
  res.redirect("/");
});

app.post('/forgot-password', function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const new_password = req.body.new_password;

  connection.query('SELECT * FROM student WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Error occurred during password reset:', error);
      res.send('Error occurred. Please try again later.');
    } else if (results.length > 0) {
      // Implement your logic for sending the verification email here
      res.send('Verification code sent to your email. <a href="/verify-code">Verify Code</a>');
    } else {
      res.send('Invalid username.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


/*------------------------------------student register ---------------------------------*/

/*------------------------------------teacher login ---------------------------------*/

app.post("/log", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM teacher WHERE username = ? AND password = ?";
  connection.query(query, [username, password], function(error, results) {
    if (error) {
      console.error('Error inserting data into the database:', error);
      res.status(500).send('Error login teacher. Please try again later.');
      } else if (results.length > 0) {
          res.redirect("/teacher and MU.html");
      } else {
          res.redirect("/teacher/teacher login.html");
      }
  });
});

app.get("/teacher and MU.html", function(req, res) {
  res.sendFile(__dirname + "/teacher and MU.html");
});

/*------------------------------------teacher login ---------------------------------*/



/*------------------------------------teacher register ---------------------------------*/

app.post('/go', (req, res) => {
  const { university, college, teacher, username, email, password } = req.body;

  const query =
    'INSERT INTO teacher (university, college, teacher, username, email, password) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [university, college, teacher, username, email, password], (error) => {
    if (error) {
      console.error('Error inserting data into the database:', error);
      res.status(500).send('Error registering teacher. Please try again later.');
      alert("ALready exist")
    } else {
      res.redirect('/teacher and MU.html');
    }
  });
});

app.get('/teacher and MU.html', (req, res) => {
  res.sendFile(__dirname + '/teacher and MU.html');
});

  /*------------------------------------teacher register ---------------------------------*/

    /*------------------------------------university login ---------------------------------*/

    app.post('/MU', (req, res) => {
      const {username, password } = req.body;
    
     
      const query = 'SELECT * FROM university WHERE username = ? AND password = ?';
      connection.query(query, [username, password], (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.sendStatus(500);
        } else {
          if (results.length > 0) {
            res.redirect('/mu.html');
          } else {
            res.redirect('/university/university login.html');
          }
        }
      });
    });
    
    app.get('/mu.html', (req, res) => {
      res.sendFile(__dirname + '/mu.html');
    });
    /*------------------------------------university login ---------------------------------*/

/*------------------------------------ university register ---------------------------------*/
app.post('/MUR', (req, res) => {
  const { username, email, password, university, country, college } = req.body;

  const query = 'INSERT INTO university (username, email, password, university, country, college) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [username, email, password, university, country, college], (error) => {
     if (error) {
      console.error('Error inserting data into the database:', error);
      res.sendStatus(500);
    } else {
      res.redirect('/mu.html');
    }
  });
});

app.get('/mu.html', (req, res) => {
  res.sendFile(__dirname + '/mu.html');
});

/*------------------------------------university register ---------------------------------*/


/*------------------------------------file or folder upload---------------------------------*/

// database.js

app.post("/upload", upload.array("files"), (req, res) => {
  const files = req.files;
  const projectName = req.body.projectName;
  const username = req.body.username;
  const summary= req.body.summary;

  if (!files || files.length === 0 || !projectName) {
      return res.status(400).send("Please provide a project name and select files to upload.");
  }

  let filesUploaded = 0;

  files.forEach((file, index, array) => {
      const filename = file.originalname;
      const mimeType = file.mimetype;
      const fileData = file.buffer;

      const query = "INSERT INTO file (filename, mime_type, data, project_name, username, summary) VALUES (?, ?, ?, ?, ?, ?)";
      connection.query(query, [filename, mimeType, fileData, projectName, username, summary], (err, result) => {
          if (err) {
              console.error("Error uploading file: ", err);
          } else {
              filesUploaded++;

              if (filesUploaded === array.length) {
                  // All files have been uploaded
                  res.status(200).send("Files uploaded successfully");
              }
          }
      });
  });
});


app.get("/status", (req, res) => {
  const query = "SELECT filename, project_name, summary FROM file";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data from database: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.render("status", { files: results });
    }
  });
});
