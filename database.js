const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require('multer');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // For session storage
const path = require('path');
const app = express();
const PORT = 9000;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "ads"
});

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
    pool.query(query, [username, password], function(error, results) {
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
// Handle file uploads
app.post("/upload", upload.array("files"), (req, res) => {
  const files = req.files;
  const projectName = req.body.projectName; // Get the project name from the form

  if (!files || files.length === 0 || !projectName) {
      return res.status(400).send("Please provide a project name and select files to upload.");
  }

  // Create a variable to keep track of the number of files successfully uploaded
  let filesUploaded = 0;

  // Loop through the uploaded files and insert each one into the database with the project name
  files.forEach((file) => {
      const filename = file.originalname;
      const mimeType = file.mimetype;
      const fileData = file.buffer;

      // Insert file data and project name into the database
      const query = "INSERT INTO file (filename, mime_type, data, project_name) VALUES (?, ?, ?, ?)";
      connection.query(query, [filename, mimeType, fileData, projectName], (err, result) => {
          if (err) {
              console.error("Error uploading file: ", err);
          } else {
              filesUploaded++;
          }
      });
  });
});

