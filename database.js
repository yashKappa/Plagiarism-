const express = require("express");
const path = require('path');
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const multer = require('multer');

app.set("port", 9000);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ads'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/", function (req, res) {
  const username = req.cookies.username;
  const logged = req.cookies.logged;
  const teacher = req.cookies.teacher;

  if (username && logged === 'true') {
    // If the user is logged in, redirect to the user panel page
    res.redirect(`/student user/userpanel.html?username=${username}`);
  } else if (username && teacher === 'true') {
    // If the user is a teacher, redirect to the teacher page
    res.redirect(`/teacher and MU.html?username=${username}`);
  } else {
    // If the user is not logged in, serve the index.html page
    res.sendFile(path.join(__dirname, "index.html"));
  }
});


app.post("/student", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM student WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.length > 0) {
      // Set cookies for username and login status
      res.cookie('username', username);
      res.cookie('logged', 'true');
      // Redirect to the user panel page
      res.redirect(`/student user/userpanel.html?username=${username}`);
    } else {
      res.redirect("/student/student login.html");
    }
  });
});

app.get("/logout", (req, res) => {
  // Clear cookies and redirect to index.html
  res.clearCookie('username');
  res.clearCookie('logged');
  res.redirect("/index.html"); // Update the path if needed
});


app.listen(app.get("port"), () => {
  console.log("App listening on port " + app.get("port"));
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


app.post("/log", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM teacher WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.length > 0) {
      // Set cookies for username and login status
      res.cookie('username', username);
      res.cookie('teacher', 'true');
      // Redirect to the user panel page
      res.redirect(`/teacher and MU.html?username=${username}`);
    } else {
      res.redirect("/teacher/teacher login.html");
    }
  });
});

app.get("/logout", (req, res) => {
  // Clear cookies and redirect to index.html
  res.clearCookie('username');
  res.clearCookie('teacher');
  res.redirect("/index.html"); // Update the path if needed
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


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

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

