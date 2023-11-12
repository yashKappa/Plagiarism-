const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require('multer');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // For session storage
const path = require('path');
const app = express();
const PORT = 9000;
const nodemailer = require('nodemailer');

const connection = mysql.createConnection({
  host: 'localhost', // Replace with your MySQL host
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'ads' // Replace with your MySQL database name
});

// Connect to the database
connection.connect((err) => {
  if (err) {
      console.error('Error connecting to the database: ' + err.stack);
      return;
  }
  console.log('Connected to the database as ID ' + connection.threadId);
});

// Perform database operations here
// For example, you can run SQL queries, insert, update, or retrieve data

// Close the database connection when done


const sessionStoreOptions = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "sessiondb" // Create a separate database for session storage
};

const sessionStore = new MySQLStore(sessionStoreOptions);

app.use(session({
    secret: 'kappa3000+',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/main.html");
});

app.get("/login", function(req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.post("/student", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM student WHERE username = ? AND password = ?";
  connection.query(query, [username, password], function(error, results) {
      if (error) {
          console.error("Error occurred during login:", error);
          res.redirect("/");
      } else if (results.length > 0) {
          // Store user data in the session
          req.session.user = { username: results[0].username };
          res.redirect("/student user/userpanel.html");
      } else {
          res.redirect("/student/student login.html");
      }
  });
});


app.get("/student user/userpanel", function(req, res) {
    // Check if the user is authenticated
    if (req.session.user) {
        res.sendFile(__dirname + "/student user/userpanel.html");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res) {
    // Destroy the session on logout
    req.session.destroy(function(error) {
        if (error) {
            console.error("Error occurred during logout:", error);
        }
        res.redirect("/");
    });
});

app.post('/forgot-password', function(req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const new_password = req.body.new_password;

  // Check if the username exists in the database
  pool.query('SELECT * FROM student WHERE username = ?', [username], (error, results) => {
      if (error) {
          console.error('Error occurred during password reset:', error);
          res.send('Error occurred. Please try again later.');
      } else if (results.length > 0) {
          const verificationCode = Math.floor(1000 + Math.random() * 9000);

          const transporter = nodemailer.createTransport({
              service: 'Gmail', 
              port:'9000',
              auth: {
                  user: 'yash0@gmail.com', 
                  pass: 'yash@2003' 
              }
            
          });
          // Email message
          const mailOptions = {
              from: 'yash0@gmail.com', // Your email
              to: email,
              subject: 'Password Reset Verification Code',
              text: `Your verification code is: ${verificationCode}`
          };

          // Send the verification email
          transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                  console.error('Error sending verification email:', err);
                  res.send('Error sending verification email.');
              } else {
                  // Store the verification code, username, and new password in the session
                  req.session.verificationCode = verificationCode;
                  req.session.username = username;
                  req.session.newPassword = new_password;

                  res.send('Verification code sent to your email. <a href="/verify-code">Verify Code</a>');
              }
          });
      } else {
          res.send('Invalid username.');
      }
  });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

/*------------------------------------student register ---------------------------------*/
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const query = 'INSERT INTO student (username, email, password) VALUES (?, ?, ?)';
    connection.query(query, [username, email, password], (error) => {
        if (error) {
            console.error('Error inserting data into the database:', error);
            res.sendStatus(500);
        } else {
            res.redirect('/student user/userpanel.html');
        }
    });
});

app.get('/student user/userpanel.html', (req, res) => {
    res.sendFile(__dirname + '/student user/userpanel.html');
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

  if (!files || files.length === 0 || !projectName) {
      return res.status(400).send("Please provide a project name and select files to upload.");
  }

  let filesUploaded = 0;

  files.forEach((file, index, array) => {
      const filename = file.originalname;
      const mimeType = file.mimetype;
      const fileData = file.buffer;

      const query = "INSERT INTO file (filename, mime_type, data, project_name, username) VALUES (?, ?, ?, ?, ?)";
      connection.query(query, [filename, mimeType, fileData, projectName, username], (err, result) => {
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



