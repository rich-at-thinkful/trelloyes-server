const express = require('express');
const listRouter = express.Router();

const listController = require('./listController');

listRouter
  .route('/')
  .get(listController.list)
  .post(listController.create);

listRouter
  .route('/:id')
  .get(listController.read)
  .delete(listController.destroy);

module.exports = listRouter;
