const express = require("express");
const path = require('path');
const sql = require("mssql");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require("mysql");
const MSSQLStore = require('connect-mssql')(session);
const app = express();
const PORT = 9000;
const multer = require('multer');
const fileUpload = require('express-fileupload');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Set up static files serving
app.use(express.static(path.join(__dirname, 'views')));

// Now you can access the 'views' directory from the browser

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ads'
});

const usersRoutes = require('./routes/users');

// Mount the user routes at the '/user' base path
app.use('/users', usersRoutes);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Routes
app.get("/", function (req, res) {
  const username = req.cookies.username;
  const logged = req.cookies.logged;
  const teacher = req.cookies.teacher;
  const developer = req.cookies.developer;
  const admin = req.cookies.admin;


  if (username && logged === 'true') {
    // If the user is logged in, redirect to the user panel page
    res.redirect(`/student user/userpanel.html?username=${username}`);
  } else if (teacher && logged === 'true') {
    // If the user is a teacher, redirect to the teacher page
    res.redirect(`/teacher and MU.html?username=${username}`);
  }  else if (developer && logged === 'true') {
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
  const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.status(500).send("Internal server error");
    } else if (results.length > 0) {
      // Set cookies for username and login status
      res.cookie('username', username, { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('student', 'student', { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('logged', 'true', { maxAge: 3 * 24 * 60 * 60 * 1000 });
      // Set session variable
      req.cookies.user = username;
      // Redirect to the user panel page
      res.redirect("/student user/userpanel.html");
    } else {
      // Render the login page with an error message
      res.redirect("/student/student login.html?error=Invalid Username or Password");
  }
  });
});



app.get("/logout", (req, res) => {
  // Clear cookies and session and redirect to index.html
  res.clearCookie('username');
  res.clearCookie('logged');
  res.clearCookie('student');
  res.clearCookie('teacher');
  res.clearCookie('developer');
  res.clearCookie('admin');
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


app.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    // SQL query with default values for columns not specified in the registration form
    const query = 'INSERT INTO student (username, email, password, teacher, developer) VALUES (?, ?, ?, ?, ?)';

    // Assuming `--` is the default value for the teacher column
    const defaultTeacher = '--';
    const defaultDeveloper = '--';

    connection.query(query, [username, email, password, defaultTeacher, defaultDeveloper], (error, results) => {
      if (error) {
        console.error("Error occurred during registration:", error);
        res.redirect('/student/student register.html');
      } else {
        // Check if the query was successful
        if (results.affectedRows > 0) {
          // Assuming `student` is a property in the results object
          const student = results.student; // Adjust this line according to your query results
          res.cookie('username', username);
          res.cookie('student', 'student');
          res.cookie('logged', 'true');
          // Set session variable
          req.cookies.user = username;
          // Redirect to the user panel page
          res.redirect('/student user/userpanel.html');
        } else {
          res.redirect("/student/student login.html?error= Username already exists");
        }
      }
    });
    
  } catch (error) {
    console.error("Error occurred during registration:", error);
    res.redirect('/student/student register.html');
  }
});


app.get('/student/userpanel.html', (req, res) => {
  if (req.loggedInUser) {
    res.sendFile(path.join(__dirname, 'student user/userpanel.html'));
  } else {
    res.redirect('/login');
  }
});
/*------------------------------------student register ---------------------------------*/


/*------------------------------------teacher login ---------------------------------*/


app.post("/log", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM student WHERE username = ? AND password = ?";  const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.length > 0) {
      // Set cookies for username, teacher, and logged status
      res.cookie('username', username);
      res.cookie('teacher', 'teacher');
      res.cookie('logged', 'true'); // Add this line to set the 'logged' cookie
      // Redirect to the user panel page
      req.cookies.user = username;
      res.redirect(`/student user/userpanel.html?username=${username}`);
    } else {
      res.redirect("/teacher/teacher login.html?error=Invalid Username or Password");
    }
  });
});



/*------------------------------------teacher login ---------------------------------*/



/*------------------------------------teacher register ---------------------------------*/

app.post('/go', (req, res) => {
  try {
    const {username, email, password, teacher, university, college, developer } = req.body;

    // SQL query with default values for columns not specified in the registration form
    const query = 'INSERT INTO student (username, email, password, teacher, university, college, developer) VALUES (?, ?, ?, ?, ?, ?, ?)';

    // Assuming `--` is the default value for the developer column
    const defaultDeveloper = '--';

    connection.query(query, [username, email, password, teacher, university, college, defaultDeveloper], (error, results) => {
      if (error) {
        console.error("Error occurred during registration:", error);
        res.redirect('/student/student register.html');
      } else {
        // Check if the query was successful
        if (results.affectedRows > 0) {
          // Assuming `student` is a property in the results object
          const teacher = results.teacher; // Adjust this line according to your query results
          res.cookie('username', username);
          res.cookie('teacher', 'teacher');
          res.cookie('logged', 'true'); // Add this line to set the 'logged' cookie
          // Redirect to the user panel page
          req.cookies.user = username;
          // Redirect to the user panel page
          res.redirect('/student user/userpanel.html');
        } else {
          res.redirect('/teacher/teacher register.html');
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.redirect('/teacher/teacher register.html');
  }
});

app.get("/student/userpanel.html", (req, res) => {
  if (req.loggedInUser) {
    res.sendFile(path.join(__dirname, "student user/userpanel.html"));
  } else {
    res.redirect("/login");
  }
});


  /*------------------------------------teacher register ---------------------------------*/

 /*------------------------------------developer login ---------------------------------*/


app.post("/MU", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM student WHERE developer = ? AND password = ?";  const request = new sql.Request();
  request.input('developer', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.length > 0) {
      // Set cookies for username, teacher, and logged status
      res.cookie('username', username);
      res.cookie('developer', 'developer');
      res.cookie('logged', 'true'); // Add this line to set the 'logged' cookie
      // Redirect to the user panel page
      req.cookies.user = username;
      res.redirect(`/student user/userpanel.html?username=${username}`);
    } else {
      res.redirect("/teacher/teacher login.html?error=Invalid Username or Password");
    }
  });
});



/*------------------------------------developer login ---------------------------------*/



/*------------------------------------developer register ---------------------------------*/

app.post('/MUR', (req, res) => {
  try {
    const { username, email, password, teacher, university, college, developer, company, work } = req.body;
  
    // SQL query with default values for columns not specified in the registration form
    const query = 'INSERT INTO student (username, email, password, teacher, university, college, developer, company, work) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
    // Assuming `--` is the default value for the teacher column
    const defaultTeacher = '--';
    const defaultUniversity = '--';
    const defaultCollege = '--';
  
    // Use the defaultTeacher value if teacher is not provided
    const teacherValue = teacher || defaultTeacher;
    const universityValue = university || defaultUniversity;
    const collegeValue = college || defaultCollege;
  
    connection.query(query, [username, email, password, teacherValue, defaultUniversity, defaultCollege, developer, company, work], (error, results) => {
      if (error) {
        console.error("Error occurred during registration:", error);
        res.redirect('/student/student register.html');
      } else {
        // Check if the query was successful
        if (results.affectedRows > 0) {
          // Assuming `student` is a property in the results object
          const developer = results.developer; // Adjust this line according to your query results
          res.cookie('username', username);
      res.cookie('developer', 'developer');
      res.cookie('logged', 'true'); // Add this line to set the 'logged' cookie
      // Redirect to the user panel page
      req.cookies.user = username;
          // Redirect to the user panel page
          res.redirect('/student user/userpanel.html');
        } else {
          res.redirect('/teacher/teacher register.html');
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.redirect('/teacher/teacher register.html');
  }
});

app.get("/student/userpanel.html", (req, res) => {
  if (req.loggedInUser) {
    res.sendFile(path.join(__dirname, "student user/userpanel.html"));
  } else {
    res.redirect("/login");
  }
});


  /*------------------------------------developer register ---------------------------------*/


/*------------------------------------file or folder upload---------------------------------*/

// database.js


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(express.json());
app.post("/upload", upload.array("files"), (req, res) => {
  const files = req.files;
  const projectName = req.body.projectName;
  const inputUsername = req.body.username;
  const summary = req.body.summary;
  const front = req.body.front;
  const back = req.body.back;

  if (!files || files.length === 0 || !projectName) {
      return res.status(400).send("Please provide a project name and select files to upload.");
  }

  // Check if the input username matches the one stored in cookies
  const storedUsername = req.cookies.username;

  if (inputUsername !== storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  let filesUploaded = 0;

// ...

files.forEach((file, index, array) => {
  const filename = file.originalname;
  const mimeType = file.mimetype;
  const fileData = file.buffer;

  const query = "INSERT INTO file (filename, mime_type, data, project_name, username, summary, front, back) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  connection.query(query, [filename, mimeType, fileData, projectName, inputUsername, summary, front, back], (err, result) => {
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
// ...


app.post("/project", upload.array("files"), (req, res) => {
  const files = req.files;
  const projectName = req.body.projectName;
  const inputUsername = req.body.username;
  const summary = req.body.summary;
  const front = req.body.front;
  const back = req.body.back;

  if (!files || files.length === 0 || !projectName) {
    return res.status(400).send("Please provide a project name and select files to upload.");
  }

  // Check if the input username matches the one stored in cookies
  const storedUsername = req.cookies.username;

  if (inputUsername !== storedUsername) {
    return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  let filesUploaded = 0;

  files.forEach((file, index, array) => {
    const filename = file.originalname;
    const mimeType = file.mimetype;
    const fileData = file.buffer;

    const query = "INSERT INTO project (filename, mime_type, data, project_name, username, summary, front, back) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(query, [filename, mimeType, fileData, projectName, inputUsername, summary, front, back], (err, result) => {
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




// Assuming you have Express set up and your EJS view engine configured

// Update the route handler
app.set('views', path.join(__dirname, 'views'));

// Set the 'public' directory for static files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Define a route to fetch data from the 'student' table
app.get('/status', async (req, res) => {
  try {
    // Connect to MSSQL using dbConfig
    await sql.connect(dbConfig);

    // Query the database
    const result = await sql.query('SELECT * FROM student');

    // Render the 'status.ejs' page and pass the query results
    res.render('status', { data: result.recordset, title: 'File Status' });
  } catch (err) {
    console.error('Error executing MSSQL query:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MSSQL connection
    sql.close();
  }
});


// Serve the status.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'status.html'));
});




/*------------------------------------admin_student login---------------------------------*/


app.post("/admin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM admin WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.status(500).send("Internal server error");
    } else if (results.length > 0) {
      // Set cookies for username and login status
      res.cookie('admin', username);
      res.cookie('logged', 'true');
      // Set session variable (Note: Cookies are accessed through req.cookies, not req.cookies.user)
      res.redirect("/admin/admin_home.html");
    } else {
      // Render the login page with an error message
      res.redirect("/admin.html?error=Invalid Username or Password");
    }
  });
});
/*------------------------------------admin_student login---------------------------------*/

/*------------------------------------student fetch data---------------------------------*/

app.get('/student', (req, res) => {
  try {
    // Query the MySQL database
    connection.query('SELECT * FROM student', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'student.ejs' page and pass the query results
        res.render('student', { data: results, title: 'File Status' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle other routes...

// Serve the student.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'student.html'));
});

/*------------------------------------student fetch data---------------------------------*/

/*------------------------------------teacher fetch data---------------------------------*/

app.get('/teacher', (req, res) => {
  try {
    // Query the MySQL database
    connection.query('SELECT * FROM teacher', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'student.ejs' page and pass the query results
        res.render('teacher', { data: results, title: 'File Status' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle other routes...

// Serve the student.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'teacher.html'));
});
/*------------------------------------teacher fetch data---------------------------------*/

/*------------------------------------User file fetch data---------------------------------*/

// Add a new route for downloading files
app.get('/download/:id', (req, res) => {
  const fileId = req.params.id;

  // Query the MySQL database to get file information based on the provided id
  connection.query('SELECT * FROM file WHERE id = ?', [fileId], (error, results, fields) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).send('Internal Server Error');
    } else {
      // Assuming 'data' is the column with BLOB data and 'filename' is the original filename
      const fileData = results[0].data; // Access the BLOB data from the first result (adjust as needed)
      const filename = results[0].filename; // Access the filename from the first result (adjust as needed)

      // Set response headers for file download
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', 'application/octet-stream');

      // Send the BLOB data as the response
      res.send(fileData);
    }
  });
});

app.get('/index', (req, res) => {
  try {
    // Query the MySQL database to select distinct username, project_name, and summary
    connection.query('SELECT username, project_name, summary FROM file GROUP BY username, project_name, summary', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'index' page and pass the query results
        res.render('index', { data: results, title: 'User Projects' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});


/*------------------------------------User file fetch data---------------------------------*/
// Add this route to handle getFileContent requests


// Your existing /index route remains unchanged
// Add a new route to handle the click on the project name
// Update the /user route to fetch distinct username and project_name

// Add this route in your main server file
// Add this route in your main server file (app.js or index.js)

// Add this route in your main server file (app.js or index.js)


// Route to delete a project
app.get('/user', (req, res) => {
  try {
    const storedUsername = req.cookies.username;

    if (!storedUsername) {
      return res.status(401).send('Unauthorized. Please log in.');
    }

    connection.query('SELECT DISTINCT username, project_name, summary FROM file WHERE username = ?', [storedUsername], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('user', { data: results, title: 'User Projects' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Route to delete a project
app.post('/user/delete', (req, res) => {
  try {
    const storedUsername = req.cookies.username;

    const projectNamesToDelete = req.body.selectedProjects.map(project => project.projectName);

    if (!projectNamesToDelete || projectNamesToDelete.length === 0) {
      return res.status(400).json({ success: false, error: 'No projects selected for deletion.' });
    }

    const placeholders = projectNamesToDelete.map(() => '?').join(', ');
    const deleteQuery = `DELETE FROM file WHERE project_name IN (${placeholders}) AND username = ?`;

    console.log('Delete Query:', deleteQuery);
    console.log('Delete Parameters:', [...projectNamesToDelete, storedUsername]);

    connection.query(deleteQuery, [...projectNamesToDelete, storedUsername], (error, results) => {
      if (error) {
        console.error('Error deleting projects:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      } else {
        console.log('Deletion successful. Rows affected:', results.affectedRows);

        // Fetch updated data from the server
        connection.query('SELECT DISTINCT username, project_name FROM file WHERE username = ?', [storedUsername], (error, results) => {
          if (error) {
            console.error('Error executing MySQL query:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
          } else {
            res.json({
              success: true,
              deletedProjects: projectNamesToDelete,
              updatedData: results,
            });
          }
        });
      }
    });
  } catch (err) {
    console.error('Error handling deletion:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});




// Add a new route to handle the click on the project name and fetch related files
app.get('/related/:username/:projectName', (req, res) => {
  const storedUsername = req.cookies.username;
  const projectName = req.params.projectName;

  try {
    // Check if the username is present in cookies
    if (!storedUsername) {
      return res.status(401).send('Unauthorized. Please log in.');
    }

    // Query the MySQL database to fetch files related to the stored username and project name
    const query = `
      SELECT *
      FROM file
      WHERE username = ? AND project_name = ?
    `;

    connection.query(query, [storedUsername, projectName], (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'related' page and pass the query results
        res.render('related', { data: results, title: 'Related Files', username: storedUsername, projectName });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/related', (req, res) => {
  try {
    // Query the MySQL database
    connection.query('SELECT * FROM file', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'index' page and pass the query results
        res.render('related', { data: results, title: 'File List' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getFileContent/:id', (req, res) => {
  const fileId = req.params.id;

  try {
    // Query the MySQL database to fetch the content of the file with the given ID
    const query = `
      SELECT data
      FROM file
      WHERE id = ?
    `;

    connection.query(query, [fileId], (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else if (results.length === 0) {
        // If no file with the given ID is found, return a 404 Not Found response
        res.status(404).send('File Not Found');
      } else {
        // Return the content of the file
        res.send(results[0].data);
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/userdata', (req, res) => {
  try {
    // Query the MySQL database
    connection.query('SELECT * FROM file', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'index' page and pass the query results
        res.render('userdata', { data: results, title: 'File List' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/profile', (req, res) => {
  try {
    const storedUsername = req.cookies.username;

    if (!storedUsername) {
      return res.status(401).send('Unauthorized. Please log in.');
    }

    connection.query('SELECT DISTINCT username, email, password, lang, exp, professional, education, skill FROM student WHERE username = ?', [storedUsername], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('profile', { data: results, title: 'User Profile' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/teacher_profile', (req, res) => {
  try {
    const storedUsername = req.cookies.username;

    if (!storedUsername) {
      return res.status(401).send('Unauthorized. Please log in.');
    }

    connection.query('SELECT DISTINCT username, email, password, lang, exp, professional, education, skill FROM student WHERE username = ?', [storedUsername], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('teacher_profile', { data: results, title: 'User teacher_profile' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

/*
app.post("/profile/image", (req, res) => {
  try {
    const storedUsername = req.cookies.username;

    if (!storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
    }

    if (!req.files || !req.files.image) {
      console.error("No image file uploaded.");
      return res.status(400).send("No image file uploaded.");
    }

    const image = req.files.image;
    const imageData = image.data;

    const updateQuery = "UPDATE student SET image=? WHERE username=?";

    connection.query(updateQuery, [imageData, storedUsername], (err, result) => {
      if (err) {
        console.error("Error updating image:", err);
        res.redirect("../profile");
      } else {
        res.redirect("../profile");
        res.status(200).end();
      }
    });
  } catch (error) {
    console.error("Error in image update route:", error);
    res.redirect("../profile");
    res.status(500).send("Internal Server Error");
  }
});
*/

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Assuming your static files are in the 'public' folder
app.use(fileUpload());

app.post("/profile/data", (req, res) => {
  try {
      const storedUsername = req.cookies.username;

      if (!storedUsername) {
          return res.status(401).send("Invalid username. Please log in with the correct username.");
      }

      const { lang, skill, exp, professional, education } = req.body;

      const updateQuery = `
          UPDATE student
          SET lang=TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM lang), ''), ''), ?)),
              skill=TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM skill), ''), ''), ?)),
              exp=TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM exp), ''), ''), ?)),
              professional=TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM professional), ''), ''), ?)),
              education=TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM education), ''), ''), ?))
          WHERE username=?
      `;

      connection.query(
          updateQuery,
          [lang, skill, exp, professional, education, storedUsername],
          (err, result) => {
              if (err) {
                  console.error("Error updating profile data:", err);
                  res.redirect("../profile");
              } else {
                  res.status(200).send("Profile updated successfully");
              }
          }
      );
  } catch (error) {
      console.error("Error in profile data update route:", error);
      res.status(500).send("Internal Server Error");
  }
});

app.post("/teacher_profile/data", (req, res) => {
  try {
      const storedUsername = req.cookies.username;

      if (!storedUsername) {
          return res.status(401).send("Invalid username. Please log in with the correct username.");
      }

      const { lang, skill, exp, professional, education } = req.body;

      const updateQuery = `
          UPDATE student
          SET lang = TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM lang), ''), ''), ?)),
              skill = TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM skill), ''), ''), ?)),
              exp = TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM exp), ''), ''), ?)),
              professional = TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM professional), ''), ''), ?)),
              education = TRIM(BOTH ',' FROM CONCAT_WS(', ', IFNULL(NULLIF(TRIM(BOTH ',' FROM education), ''), ''), ?))
          WHERE username = ?
      `;

      connection.query(updateQuery, [lang, skill, exp, professional, education, storedUsername], (err, result) => {
          if (err) {
              console.error("Error updating profile data:", err);
              res.status(500).send("Error updating profile data");
          } else {
              console.log("Profile updated successfully");
              res.status(200).send("Profile updated successfully");
          }
      });
  } catch (error) {
      console.error("Error in profile data update route:", error);
      res.status(500).send("Internal Server Error");
  }
});


app.post('/removeSkill', (req, res) => {
  // Extract the username from the request
  const storedUsername = req.cookies.username;

  // Check if the username is defined
  if (!storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Extract the skill to remove from the request body
  const langToRemove = req.body.langName;

  // Fetch the current list of skills from the database
  connection.query('SELECT lang FROM student WHERE username = ?', [storedUsername], (err, result) => {
      if (err) {
          console.error("Error fetching skills:", err);
          res.status(500).send("Error fetching skills");
      } else {
          // Extract the skills from the result
          const currentLang = result[0].lang.split(',').map(lang => lang.trim());
          const updatedLang = currentLang.filter(lang => lang !== langToRemove);
          const updatedLangString = updatedLang.join(', ');

          // Update the 'student' table with the updated skills

          // Update the 'student' table with the updated skills
          connection.query('UPDATE student SET lang = ? WHERE username = ?', [updatedLangString, storedUsername], (err, result) => {
              if (err) {
                  console.error("Error updating skills:", err);
                  res.status(500).send("Error updating skills");
              } else {
                  console.log("Skill removed successfully");
                  res.status(200).send("Skill removed successfully");
              }
          });
      }
  });
});


app.post('/removeDATA', (req, res) => {
  // Extract the username from the request
  const storedUsername = req.cookies.username;

  // Check if the username is defined
  if (!storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Extract the skill to remove from the request body
  const skillToRemove = req.body.skillName;

  // Fetch the current list of skills from the database
  connection.query('SELECT skill FROM student WHERE username = ?', [storedUsername], (err, result) => {
      if (err) {
          console.error("Error fetching skills:", err);
          res.status(500).send("Error fetching skills");
      } else {

          const currentSkill = result[0].skill.split(',').map(skill => skill.trim());
          const updatedSkill = currentSkill.filter(skill => skill !== skillToRemove);
          const updatedSkillString = updatedSkill.join(', ');

          // Update the 'student' table with the updated skills

          // Update the 'student' table with the updated skills
          connection.query('UPDATE student SET skill = ? WHERE username = ?', [updatedSkillString, storedUsername], (err, result) => {
              if (err) {
                  console.error("Error updating skills:", err);
                  res.status(500).send("Error updating skills");
              } else {
                  console.log("Skill removed successfully");
                  res.status(200).send("Skill removed successfully");
              }
          });
      }
  });
});

app.post('/removeEDU', (req, res) => {
  // Extract the username from the request
  const storedEducationUsername = req.cookies.username;

  // Check if the username is defined
  if (!storedEducationUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Extract the education to remove from the request body
  const educationToRemove = req.body.educationName;

  // Fetch the current list of educations from the database
  connection.query('SELECT education FROM student WHERE username = ?', [storedEducationUsername], (err, result) => {
      if (err) {
          console.error("Error fetching educations:", err);
          res.status(500).send("Error fetching educations");
      } else {
          const currentEducation = result[0].education.split(',').map(education => education.trim());
          const updatedEducation = currentEducation.filter(education => education !== educationToRemove);
          const updatedEducationString = updatedEducation.join(', ');

          // Update the 'student' table with the updated educations
          connection.query('UPDATE student SET education = ? WHERE username = ?', [updatedEducationString, storedEducationUsername], (err, result) => {
              if (err) {
                  console.error("Error updating educations:", err);
                  res.status(500).send("Error updating educations");
              } else {
                  console.log("Education removed successfully");
                  res.status(200).send("Education removed successfully");
              }
          });
      }
  });
});


app.post('/removeProfessional', (req, res) => {
  // Extract the username from the request
  const storedUsername = req.cookies.username;
  const profToRemove = req.body.profName;

  // Check if the username is defined
  if (!storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Fetch the current list of professional data from the database
  connection.query('SELECT professional FROM student WHERE username = ?', [storedUsername], (err, result) => {
      if (err) {
          console.error("Error fetching professional data:", err);
          res.status(500).send("Error fetching professional data");
      } else {
          const currentProf = result[0].professional.split(',').map(prof => prof.trim());
          const updatedProf = currentProf.filter(prof => prof !== profToRemove);
          const updatedProfString = updatedProf.join(', ');

          // Update the 'student' table with the updated professional data
          connection.query('UPDATE student SET professional = ? WHERE username = ?', [updatedProfString, storedUsername], (err, result) => {
              if (err) {
                  console.error("Error updating professional data:", err);
                  res.status(500).send("Error updating professional data");
              } else {
                  console.log("Professional data removed successfully");
                  res.status(200).send("Professional data removed successfully");
              }
          });
      }
  });
});




app.get('/fileDetails/:username/:projectName', (req, res) => {
  const projectName = req.params.projectName;

  try {
    // Query the MySQL database to fetch files related to the provided username and project name
    const query = `
      SELECT *
      FROM file
      WHERE username = ? AND project_name = ?
    `;

    connection.query(query, [req.params.username, projectName], (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'related' page and pass the query results
        res.render('related', { data: results, title: 'Related Files', username: req.params.username, projectName });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/plagi', (req, res) => {
  try {
    const searchTerm = req.query.term || ''; // Get the search term from query parameters or default to an empty string
    const searchCondition = searchTerm ? `WHERE project_name LIKE '%${searchTerm}%'` : ''; // Construct search condition if search term is provided
    
    // Query the MySQL database to select distinct username, project_name, and summary
    connection.query(`SELECT username, project_name, summary, front, back, year FROM file ${searchCondition} GROUP BY username, project_name, summary, front, back, year`, (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'index' page and pass the query results
        res.render('plagi', { data: results, title: 'User Projects' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/plagiarism', (req, res) => {
  try {
    // Query the MySQL database to select distinct username, project_name, and summary
    connection.query('SELECT username, project_name, summary, front, back, year FROM file GROUP BY username, project_name, summary, front, back, year', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'index' page and pass the query results
        res.render('plagiarism', { data: results, title: 'User Projects' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/plagiarism/:username/:projectName', (req, res) => {
  const projectName = req.params.projectName;

  // Query the MySQL database to fetch filenames and data related to the project name
  const query = `
    SELECT filename, data
    FROM file
    WHERE project_name = ?
  `;

  connection.query(query, [projectName], (error, results, fields) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      try {
        // Convert binary data to plain text
        const filesData = results.map(result => ({
          filename: result.filename,
          data: result.data.toString('utf-8') // Convert binary data to text
        }));
        res.json(filesData);
      } catch (err) {
        console.error('Error processing data:', err);
        res.status(500).json({ error: 'Error processing data' });
      }
    }
  });
});






app.get('/plagiarism', (req, res) => {
  try {
    // Query the MySQL database
    connection.query('SELECT * FROM file', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'index' page and pass the query results
        res.render('related', { data: results, title: 'File List' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/profile', (req, res) => {
  // Execute the SQL query to get total projects count
  connection.query('SELECT COUNT(*) AS totalProjects FROM student WHERE project_name IS NOT NULL', (error, results) => {
    if (error) {
      throw error;
    }
    // Render the EJS template with the count of total projects
    res.render('profile', { totalProjects: results[0].totalProjects });
  });
});




app.post('/deleteSkill', (req, res) => {
  // Extract the username from the request
  const storedUsername = req.cookies.username;

  // Check if the username is defined
  if (!storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Extract the skill to remove from the request body
  const langToRemove = req.body.langName;

  // Fetch the current list of skills from the database
  connection.query('SELECT lang FROM student WHERE username = ?', [storedUsername], (err, result) => {
      if (err) {
          console.error("Error fetching skills:", err);
          res.status(500).send("Error fetching skills");
      } else {
          // Extract the skills from the result
          const currentLang = result[0].lang.split(',').map(lang => lang.trim());
          const updatedLang = currentLang.filter(lang => lang !== langToRemove);
          const updatedLangString = updatedLang.join(', ');

          // Update the 'student' table with the updated skills

          // Update the 'student' table with the updated skills
          connection.query('UPDATE student SET lang = ? WHERE username = ?', [updatedLangString, storedUsername], (err, result) => {
              if (err) {
                  console.error("Error updating skills:", err);
                  res.status(500).send("Error updating skills");
              } else {
                  console.log("Skill removed successfully");
                  res.status(200).send("Skill removed successfully");
              }
          });
      }
  });
});

app.post('/deleteDATA', (req, res) => {
  // Extract the username from the request
  const storedUsername = req.cookies.username;

  // Check if the username is defined
  if (!storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Extract the skill to remove from the request body
  const skillToRemove = req.body.skillName;

  // Fetch the current list of skills from the database
  connection.query('SELECT skill FROM student WHERE username = ?', [storedUsername], (err, result) => {
      if (err) {
          console.error("Error fetching skills:", err);
          res.status(500).send("Error fetching skills");
      } else {

          const currentSkill = result[0].skill.split(',').map(skill => skill.trim());
          const updatedSkill = currentSkill.filter(skill => skill !== skillToRemove);
          const updatedSkillString = updatedSkill.join(', ');

          // Update the 'student' table with the updated skills

          // Update the 'student' table with the updated skills
          connection.query('UPDATE student SET skill = ? WHERE username = ?', [updatedSkillString, storedUsername], (err, result) => {
              if (err) {
                  console.error("Error updating skills:", err);
                  res.status(500).send("Error updating skills");
              } else {
                  console.log("Skill removed successfully");
                  res.status(200).send("Skill removed successfully");
              }
          });
      }
  });
});

app.post('/deleteEDU', (req, res) => {
  // Extract the username from the request
  const storedEducationUsername = req.cookies.username;

  // Check if the username is defined
  if (!storedEducationUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Extract the education to remove from the request body
  const educationToRemove = req.body.educationName;

  // Fetch the current list of educations from the database
  connection.query('SELECT education FROM student WHERE username = ?', [storedEducationUsername], (err, result) => {
      if (err) {
          console.error("Error fetching educations:", err);
          res.status(500).send("Error fetching educations");
      } else {
          const currentEducation = result[0].education.split(',').map(education => education.trim());
          const updatedEducation = currentEducation.filter(education => education !== educationToRemove);
          const updatedEducationString = updatedEducation.join(', ');

          // Update the 'student' table with the updated educations
          connection.query('UPDATE student SET education = ? WHERE username = ?', [updatedEducationString, storedEducationUsername], (err, result) => {
              if (err) {
                  console.error("Error updating educations:", err);
                  res.status(500).send("Error updating educations");
              } else {
                  console.log("Education removed successfully");
                  res.status(200).send("Education removed successfully");
              }
          });
      }
  });
});


app.post('/deleteProfessional', (req, res) => {
  // Extract the username from the request
  const storedUsername = req.cookies.username;
  const profToRemove = req.body.profName;

  // Check if the username is defined
  if (!storedUsername) {
      return res.status(401).send("Invalid username. Please log in with the correct username.");
  }

  // Fetch the current list of professional data from the database
  connection.query('SELECT professional FROM student WHERE username = ?', [storedUsername], (err, result) => {
      if (err) {
          console.error("Error fetching professional data:", err);
          res.status(500).send("Error fetching professional data");
      } else {
          const currentProf = result[0].professional.split(',').map(prof => prof.trim());
          const updatedProf = currentProf.filter(prof => prof !== profToRemove);
          const updatedProfString = updatedProf.join(', ');

          // Update the 'student' table with the updated professional data
          connection.query('UPDATE student SET professional = ? WHERE username = ?', [updatedProfString, storedUsername], (err, result) => {
              if (err) {
                  console.error("Error updating professional data:", err);
                  res.status(500).send("Error updating professional data");
              } else {
                  console.log("Professional data removed successfully");
                  res.status(200).send("Professional data removed successfully");
              }
          });
      }
  });
});


app.get('/new_ideas', (req, res) => {
  try {
    // Query the MySQL database to select distinct username, project_name, and summary
    connection.query('SELECT username, project_name, summary, year, front, back, filename FROM project GROUP BY username, project_name, summary, year, front, back, filename', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'project' page and pass the query results
        res.render('new_ideas', { data: results, title: 'User new_ideas' }); // Updated path to 'project'
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});


/*************** Forget password ***********************/

app.post('/forgot-password', (req, res) => {
  const { email, username } = req.body;

  // Check if email and username are defined
  if (!email || !username) {
    return res.status(400).send('Email and username are required');
  }

  // Trim whitespace from email and username
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();

  // Query the database to check if the email corresponds to the same username
  connection.query('SELECT * FROM student WHERE email = ? AND username = ?', [trimmedEmail, trimmedUsername], (error, results) => {
    if (error) {
      console.error('Error querying the database:', error);
      return res.status(500).send('Internal Server Error');
    }

    // Check if any rows were returned (i.e., if email and username match)
    if (results.length > 0) {
      // Set cookies with username and email
      res.cookie('username', trimmedUsername, { maxAge: 120000 }); // 2 minutes
      res.cookie('email', trimmedEmail, { maxAge: 120000 }); // 2 minutes

      // Redirect to the newpass.html page
      res.redirect('/student/new pass.html');
    } else {
      // Redirect with error message
      res.redirect("/student/forget pass.html?error=Invalid Username or Password");
    }
  });
});


app.post('/reset-password', (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  // Check if newPassword and confirmPassword match
  if (newPassword !== confirmPassword) {
    return res.status(400).send('New password and confirm password do not match');
  }

  // Retrieve username and email from cookies
  const username = req.cookies.username;
  const email = req.cookies.email;

  // Check if username and email are present in cookies
  if (!username || !email) {
    return res.status(400).send('Username and email not found in cookies');
  }

  // Query the database to update the password
  connection.query('UPDATE student SET password = ? WHERE email = ? AND username = ?', [newPassword, email, username], (error, results) => {
    if (error) {
      console.error('Error updating password in the database:', error);
      return res.status(500).send('Internal Server Error');
    }

    // Check if the password was updated successfully
    if (results.affectedRows > 0) {
      res.cookie('username', username, { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('student', 'student', { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('logged', 'true', { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.clearCookie('email'); // Clear the email cookie
      // Set session variable
      req.cookies.user = username;
      res.redirect('/student user/userpanel.html'); // Redirect to the login page
    } else {
      res.status(401).send('Failed to update password');
    }
  });
});


/*************** Teacher Forget password ***********************/

app.post('/tech-password', (req, res) => {
  const { email, username } = req.body;

  // Check if email and username are defined
  if (!email || !username) {
    return res.status(400).send('Email and username are required');
  }

  // Trim whitespace from email and username
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();

  // Query the database to check if the email corresponds to the same username
  connection.query('SELECT * FROM student WHERE email = ? AND username = ?', [trimmedEmail, trimmedUsername], (error, results) => {
    if (error) {
      console.error('Error querying the database:', error);
      return res.status(500).send('Internal Server Error');
    }

    // Check if any rows were returned (i.e., if email and username match)
    if (results.length > 0) {
      // Set cookies with username and email
      res.cookie('username', trimmedUsername, { maxAge: 120000 }); // 2 minutes
      res.cookie('email', trimmedEmail, { maxAge: 120000 }); // 2 minutes

      // Redirect to the newpass.html page
      res.redirect('/teacher/new pass.html');
    } else {
      // Redirect with error message
      res.redirect("/teacher/forget pass.html?error=Invalid Username or Password");
    }
  });
});


app.post('/new-tech-password', (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  // Check if newPassword and confirmPassword match
  if (newPassword !== confirmPassword) {
    return res.status(400).send('New password and confirm password do not match');
  }

  // Retrieve username and email from cookies
  const username = req.cookies.username;
  const email = req.cookies.email;

  // Check if username and email are present in cookies
  if (!username || !email) {
    return res.status(400).send('Username and email not found in cookies');
  }

  // Query the database to update the password
  connection.query('UPDATE student SET password = ? WHERE email = ? AND username = ?', [newPassword, email, username], (error, results) => {
    if (error) {
      console.error('Error updating password in the database:', error);
      return res.status(500).send('Internal Server Error');
    }

    // Check if the password was updated successfully
    if (results.affectedRows > 0) {
      res.cookie('username', username, { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('teacher', 'teacher', { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('logged', 'true', { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.clearCookie('email'); // Clear the email cookie
      // Set session variable
      req.cookies.user = username;
      res.redirect('/student user/userpanel.html'); // Redirect to the login page
    } else {
      res.status(401).send('Failed to update password');
    }
  });
});


/*************** Developer Forget password ***********************/

app.post('/dev-password', (req, res) => {
  const { email, username } = req.body;

  // Check if email and username are defined
  if (!email || !username) {
    return res.status(400).send('Email and username are required');
  }

  // Trim whitespace from email and username
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();

  // Query the database to check if the email corresponds to the same username
  connection.query('SELECT * FROM student WHERE email = ? AND username = ?', [trimmedEmail, trimmedUsername], (error, results) => {
    if (error) {
      console.error('Error querying the database:', error);
      return res.status(500).send('Internal Server Error');
    }

    // Check if any rows were returned (i.e., if email and username match)
    if (results.length > 0) {
      // Set cookies with username and email
      res.cookie('username', trimmedUsername, { maxAge: 120000 }); // 2 minutes
      res.cookie('email', trimmedEmail, { maxAge: 120000 }); // 2 minutes

      // Redirect to the newpass.html page
      res.redirect('/university/new pass.html');
    } else {
      // Redirect with error message
      res.redirect("/university/forget pass.html?error=Invalid Username or Password");
    }
  });
});


app.post('/new-dev-password', (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  // Check if newPassword and confirmPassword match
  if (newPassword !== confirmPassword) {
    return res.status(400).send('New password and confirm password do not match');
  }

  // Retrieve username and email from cookies
  const username = req.cookies.username;
  const email = req.cookies.email;

  // Check if username and email are present in cookies
  if (!username || !email) {
    return res.status(400).send('Username and email not found in cookies');
  }

  // Query the database to update the password
  connection.query('UPDATE student SET password = ? WHERE email = ? AND username = ?', [newPassword, email, username], (error, results) => {
    if (error) {
      console.error('Error updating password in the database:', error);
      return res.status(500).send('Internal Server Error');
    }

    // Check if the password was updated successfully
    if (results.affectedRows > 0) {
      res.cookie('username', username, { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('developer', 'developer', { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.cookie('logged', 'true', { maxAge: 3 * 24 * 60 * 60 * 1000 });
          res.clearCookie('email'); // Clear the email cookie
      // Set session variable
      req.cookies.user = username;
      res.redirect('/student user/userpanel.html'); // Redirect to the login page
    } else {
      res.status(401).send('Failed to update password');
    }
  });
});
