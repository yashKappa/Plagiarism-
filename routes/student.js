


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
  const admin = req.cookies.admin;
  const logged = req.cookies.logged;
  const teacher = req.cookies.teacher;


  if (admin && logged === 'true') {
    // If the user is logged in, redirect to the user panel page
    res.redirect(`/student user/userpanel.html?admin=${admin}`);
  } else if (teacher && logged === 'true') {
    // If the user is a teacher, redirect to the teacher page
    res.redirect(`/teacher and MU.html?admin=${admin}`);
  } else {
    // If the user is not logged in, serve the index.html page
    res.sendFile(path.join(__dirname, "index.html"));
  }
});


app.post("/admin_student", (req, res) => {
  const admin = req.body.admin;
  const password = req.body.password;

  const query = "SELECT * FROM admin_student WHERE admin = @admin AND password = @password";

  const request = new sql.Request();
  request.input('admin', sql.NVarChar, admin);
  request.input('password', sql.NVarChar, password);

  request.query(query, (error, results) => {
    if (error) {
      console.error("Error occurred during login:", error);
      res.redirect("/");
    } else if (results.recordset.length > 0) {
      // Set cookies for admin and login status
      res.cookie('admin', admin);
      res.cookie('logged', 'true');
      // Set session variable
      req.cookies.user = admin;
      // Redirect to the user panel page
      res.redirect("/admin/admin_home.html");
    } else {
      res.redirect();
    }
  });
});

app.get("/logout", (req, res) => {
  // Clear cookies and session and redirect to index.html
  res.clearCookie('admin');
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

