app.get('/teacher', async (req, res) => {
  try {
    // Connect to MSSQL using dbConfig
    await sql.connect(dbConfig);

    // Query the database
    const result = await sql.query('SELECT * FROM teacher');

    // Render the 'status.ejs' page and pass the query results
    res.render('teacher', { data: result.recordset, title: 'File Status' });
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
  res.sendFile(path.join(__dirname, 'teacher.html'));
});

// file.js
function getFileData() {
  return 'Data from file.js';
}

module.exports = getFileData;
