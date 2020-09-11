const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Set up mongoose connection

// eslint-disable-next-line prettier/prettier
// const mongoDB = 'mongodb+srv://othman-19:0780458241-Na@cluster0.zlqrc.mongodb.net/local_library?retryWrites=true&w=majority';
const mongoDB = 'mongodb://othman-19:0780458241-Na@cluster0-shard-00-00.zlqrc.mongodb.net:27017,cluster0-shard-00-01.zlqrc.mongodb.net:27017,cluster0-shard-00-02.zlqrc.mongodb.net:27017/local_library?ssl=true&replicaSet=atlas-kwg8ni-shard-0&authSource=admin&retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
