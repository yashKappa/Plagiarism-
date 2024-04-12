const express = require("express");
const path = require('path');
const sql = require("mssql");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require("mysql");
const MSSQLStore = require('connect-mssql')(session);
const app = express();
const multer = require('multer');
const fileUpload = require('express-fileupload');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

console.log('user connected');

