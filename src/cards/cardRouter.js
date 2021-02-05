const express = require('express');

const cardController = require('./cardController');

const cardRouter = express.Router();

cardRouter.get('/', cardController.list);

cardRouter.get('/:id', cardController.read);

cardRouter.post('/', cardController.create);

cardRouter.delete('/:id', cardController.destroy);

module.exports = cardRouter;
