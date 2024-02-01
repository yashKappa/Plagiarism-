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



const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ads'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", function (req, res) {
  const username = req.cookies.username;
  const logged = req.cookies.logged;
  const teacher = req.cookies.teacher;
  const admin = req.cookies.admin;


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
  res.clearCookie('teacher');
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
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Assuming your static files are in the 'public' folder
app.use(fileUpload());

app.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if an image file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No image file uploaded.');
    }

    // Get the image file
    const image = req.files.image;

    // Use the 'data' property to get the Buffer data of the image
    const imageData = image.data;

    // Convert image file data to buffer
    const imageBuffer = Buffer.from(imageData);

    const query = 'INSERT INTO student (username, email, password, image) VALUES (?, ?, ?, ?)';

    connection.query(query, [username, email, password, imageBuffer], (error, results) => {
      if (error) {
        console.error("Error occurred during registration:", error);
        res.redirect('/student/student register.html');
      } else {
        // Check if the query was successful
        if (results.affectedRows > 0) {
          res.cookie('username', username);
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

  const query = "SELECT * FROM teacher WHERE username = ? AND password = ?";  const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.input('password', sql.NVarChar, password);

  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.length > 0) {
      // Set cookies for username, teacher, and logged status
      res.cookie('teacher', username);
      res.cookie('logged', 'true'); // Add this line to set the 'logged' cookie
      // Redirect to the user panel page
      req.cookies.user = username;
      res.redirect(`/teacher and MU.html?username=${username}`);
    } else {
      res.redirect("/teacher/teacher login.html?error=Invalid Username or Password");
    }
  });
});



/*------------------------------------teacher login ---------------------------------*/



/*------------------------------------teacher register ---------------------------------*/

app.post('/go', (req, res) => {
  try {
    const { username, email, password, university, college, teacher } = req.body;
    const query = 'INSERT INTO teacher (username, email, password, university, college, teacher) VALUES (?, ?, ?, ?, ?, ?)';
    
    connection.query(query, [username, email, password, university, college, teacher], (error, results) => {
      if (error) {
        console.error("Error occurred during registration:", error);
        res.redirect('/student/student register.html');
      } else {
        // Check if the query was successful
        if (results.affectedRows > 0) {
          res.cookie('teacher', username);
          res.cookie('logged', 'true');
          // Set session variable
          req.cookies.user = username;
          // Redirect to the user panel page
          res.redirect('/teacher and MU.html');
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


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.post("/upload", upload.array("files"), (req, res) => {
  const files = req.files;
  const projectName = req.body.projectName;
  const inputUsername = req.body.username;
  const summary = req.body.summary;

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

  const query = "INSERT INTO file (filename, mime_type, data, project_name, username, summary) VALUES (?, ?, ?, ?, ?, ?)";
  connection.query(query, [filename, mimeType, fileData, projectName, inputUsername, summary], (err, result) => {
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

// Your existing /index route remains unchanged
app.get('/index', (req, res) => {
  try {
    // Query the MySQL database
    connection.query('SELECT DISTINCT username, project_name FROM file', (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the 'user' page and pass the query results
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

    connection.query('SELECT DISTINCT username, project_name FROM file WHERE username = ?', [storedUsername], (error, results) => {
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

    connection.query('SELECT DISTINCT username, email, password, image FROM student WHERE username = ?', [storedUsername], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        // Convert image data to Base64 string
        if (results[0].image && results[0].image instanceof Buffer) {
          results[0].image = 'data:image/jpeg;base64,' + results[0].image.toString('base64');
        }

        res.render('profile', { data: results, title: 'User Projects' });
      }
    });
  } catch (err) {
    console.error('Error handling MySQL query:', err);
    res.status(500).send('Internal Server Error');
  }
});



app.post("/profile", (req, res) => {
  try {
      // Check if the input username matches the one stored in cookies
      const storedUsername = req.cookies.username;

      if (!storedUsername) {
          return res.status(401).send("Invalid username. Please log in with the correct username.");
      }

      

      // Get the image file
      const image = req.files.image;
      const imageData = image.data;

      // Assuming you have a database connection named 'connection'
      const updateQuery = "UPDATE student SET image=? WHERE username=?";

      connection.query(updateQuery, [imageData, storedUsername], (err, result) => {
          if (err) {
            res.redirect("../profile");
              console.error("Error updating student image: ", err);
          } else {
            res.redirect("../profile");
            res.status(200).end();
          }
      });
  } catch (error) {
      console.error("Error occurred during profile update:", error);
      res.redirect("../profile").send("Internal Server Error");

  }
});

