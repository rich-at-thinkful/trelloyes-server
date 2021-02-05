require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const { NODE_ENV } = require('./config');
const cardRouter = require('./cards/cardRouter');
const listRouter = require('./lists/listRouter');
const validateBearerToken = require('./middleware/validateBearerToken');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// Middleware
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(validateBearerToken);

// Main Routes
app.use('/card', cardRouter);
app.use('/list', listRouter);

// Error Handling
app.use(function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let response;
  if (NODE_ENV === 'production') {
    response = { message: 'Internal server error' };
  } else {
    console.error(error);
    response = { message: error.message };
  }
  res.status(error.status).json(response);
});

module.exports = app;