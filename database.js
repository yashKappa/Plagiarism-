const express = require("express");
const path = require('path');
const sql = require("mssql");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MSSQLStore = require('connect-mssql')(session);
const app = express();
const PORT = 9000;
const multer = require('multer');


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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", function (req, res) {
  const username = req.cookies.username;
  const logged = req.cookies.logged;
  const teacher = req.cookies.teacher;


  if (username && logged === 'true') {
    // If the user is logged in, redirect to the user panel page
    res.redirect(`/student user/userpanel.html?username=${username}`);
  } else if (teacher && logged === 'true') {
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

  const query = "SELECT * FROM student WHERE username = @username AND password = @password";

  const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

  request.query(query, (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.recordset.length > 0) {
      // Set cookies for username and login status
      res.cookie('username', username);
      res.cookie('logged', 'true');
      // Set session variable
      req.cookies.user = username;
      // Redirect to the user panel page
      res.redirect("/student user/userpanel.html");
    } else {
      res.redirect("/student/student login.html");
    }
  });
});

app.get("/logout", (req, res) => {
  // Clear cookies and session and redirect to index.html
  res.clearCookie('username');
  res.clearCookie('logged');
  res.clearCookie('teacher')
    res.redirect("/index.html");
});

app.get("/student/userpanel", (req, res) => {
  if (req.session.user) {
    res.redirect("student user/userpanel.html");
  } else {
    res.redirect("/login");
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
/*------------------------------------student register ---------------------------------*/
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await sql.query`
      INSERT INTO student (username, email, password)
      VALUES (${username}, ${email}, ${password});`;

      const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

    // Check if the query was successful
    if (result.rowsAffected[0] > 0) {
      res.cookie('username', username);
      res.cookie('logged', 'true');
      // Set session variable
      req.cookies.user = username;
      // Redirect to the user panel page
      res.redirect('/student user/userpanel.html');
    } else {
      res.redirect('/student/student register.html');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/student/student register.html');
  } finally {
    sql.close();
  }
});

app.get('/student/user/userpanel.html', (req, res) => {
  res.sendFile(__dirname + '/student/user/userpanel.html');
});


/*------------------------------------student register ---------------------------------*/


/*------------------------------------teacher login ---------------------------------*/


app.post("/log", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM teacher WHERE username = @username AND password = @password";
  const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

  request.query(query, (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.recordset.length > 0) {
      // Set cookies for username, teacher, and logged status
      res.cookie('teacher', username);
      res.cookie('logged', 'true'); // Add this line to set the 'logged' cookie
      // Redirect to the user panel page
      res.redirect(`/teacher and MU.html?username=${username}`);
    } else {
      res.redirect("/teacher/teacher login.html");
    }
  });
});



/*------------------------------------teacher login ---------------------------------*/



/*------------------------------------teacher register ---------------------------------*/

app.post('/go', async (req, res) => {
  try {
    const { username, email, password, university, college, teacher_name } = req.body;
    const result = await sql.query`
      INSERT INTO teacher (username, email, password, university, college, teacher_name)
      VALUES (${username}, ${email}, ${password}, ${university}, ${college}, ${teacher_name});`;

      const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

    // Check if the query was successful
    if (result.rowsAffected[0] > 0) {
      res.cookie('teacher', username);
      res.cookie('logged', 'true');
      // Set session variable
      req.cookies.user = username;
      // Redirect to the user panel page
      res.redirect('/teacher and MU.html');
    } else {
      res.redirect('/teacher/teacher register.html');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/teacher/teacher register.html');
  } finally {
    sql.close();
  }
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

