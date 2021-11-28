const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const routes = require('./server/routes/users');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;


// Parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Static files (css, images, js)
app.use(express.static('public'));


// Templating engine
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('view options', {layout: 'login'});


// Database connection pool
const pool = mysql.createPool({
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_NAME,
    connectionLimit : 100
});

const sessionStore = new MySQLStore({}, pool);
global.database = pool;


app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

// Router
app.use('/', routes);


// Setting Server Port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});