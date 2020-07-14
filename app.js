const express = require('express');
const app = express();
const path = require('path');

const mongoose = require('mongoose');

const show = require('./routes/show');
const index = require('./routes/index');
const user = require('./routes/users');
const task = require('./routes/task');
const join = require('./routes/join');
const handle = require('./routes/handle');
const work = require('./routes/work');
const assignment = require('./routes/assignment');
const upload = require('./routes/upload');



const expressLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');

const passport = require('passport');


// Passport config
require('./configuration/passport')(passport);

// DB CONFIG
const key = require('./configuration/keys');
const database = key.mongoURI;


// config public folder
app.use('/public', express.static('public'));

// Public Folder
app.use(express.static('./public'));

// app.use('/public', express.static(__dirname + '/public'));


// CONNECT TO MONGOOSE
mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => console.log('MongoDb Connected..'))
    .catch(error => console.log(error));

// EJS
app.use(expressLayout);
app.set('view engine', 'ejs');


// BODY PARSER
app.use(express.urlencoded({
    extended: true
}));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variable
app.use((request, response, next) => {
    response.locals.success_message = request.flash('success_message');
    response.locals.error_message = request.flash('error_message');
    response.locals.error = request.flash('error');
    next();
});


// ROUTES

app.use(upload);
app.use(assignment);
app.use(work);
app.use(show);
app.use(handle);
app.use(index);
app.use(join);
app.use(task);
app.use('/user', user);


const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server is started on PORT ${PORT}`));