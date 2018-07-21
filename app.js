const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const database = require('./config/database').database;

mongoose.connect(database.path, database.options);
const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.log(err);
});

const app = express();

const Article = require('./models/article');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    const namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg,
      value,
    }
  },
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) return console.log(err);
    res.render('index', {
      title: 'Articles',
      articles,
    });
  });
});

const articles = require('./routes/articles');
app.use('/articles', articles);

const users = require('./routes/users');
app.use('/users', users);

app.listen(3200, () => {
  console.log('Server started on port 3200...');
});
