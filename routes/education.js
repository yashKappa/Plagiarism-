// index1.js
const express = require('express');
const router = express.Router();

router.get('/education', (req, res) => {
    app.post('/education', (req, res) => {
        // Extract the username from the request
        const storedEducationUsername = req.cookies.username;
      
        // Check if the username is defined
        if (!storEducationUsername) {
            return res.status(401).send("Invalid username. Please log in with the correct username.");
        }
      
        // Extract the education to remove from the request body
        const educationToRemove = req.body.educationName;
      
        // Fetch the current list of educations from the database
        connection.query('SELECT education FROM student WHERE username = ?', [storEducationsUername], (err, result) => {
            if (err) {
                console.error("Error fetching educations:", err);
                res.status(500).send("Error fetching educations");
            } else {
      
                const currentEducation = result[0].education.split(',').map(education => education.trim());
                const updatedEducation = currentEducation.filter(education => education !== educationToRemove);
                const updatedEducationString = updatedEducation.join(', ');
      
                // Update the 'student' table with the updated educations
      
                // Update the 'student' table with the updated educations
                connection.query('UPDATE student SET education = ? WHERE username = ?', [updatedEducationString, storedEducationUsername], (err, result) => {
                    if (err) {
                        console.error("Error updating educations:", err);
                        res.status(500).send("Error updating educations");
                    } else {
                        console.log("education removed successfully");
                        res.status(200).send("education removed successfully");
                    }
                });
            }
        });
      });
      });

module.exports = router;
