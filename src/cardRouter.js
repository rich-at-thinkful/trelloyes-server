const express = require('express');
const uuid = require('uuid/v4');

const { cards, lists } = require('./dataStore');
const logger = require('./logger');

const cardRouter = express.Router();

cardRouter.get('/', (req, res) => {
  res
    .json(cards);
});

cardRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const card = cards.find(c => c.id === id);

  // make sure we found a card
  if(!card) {
    logger.error(`Card with id ${id} not found.`);
    return res
      .status(404)
      .send('Card Not Found');
  }

  res.json(card);
});

cardRouter.post('/', (req, res) => {
  const { title, content } = req.body;

  if(!title) {
    logger.error(`Title is required`);
    return res
      .status(400)
      .send('Invalid data');
  }

  if(!content) {
    logger.error(`Content is required`);
    return res
      .status(400)
      .send('Invalid data');
  }

  const id = uuid();

  const card = {
    id,
    title,
    content
  };

  cards.push(card);

  logger.info(`Card with id ${id} created`);
  
  res
    .status(201)
    .location(`http://localhost:8000/card/${id}`)
    .json({id});
});

cardRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  const cardIndex = cards.findIndex(c => c.id === id);

  if( cardIndex === -1) {
    logger.error(`Card with id ${id} not found.`);
    return res
      .status(404)
      .send('Not found');
  }

  //remove card from lists
  //assume cardIds are not duplicated in the cardIds array
  lists.forEach(list => {
    const cardIds = list.cardIds.filter(cid => cid !== id);
    list.cardIds = cardIds;
  });

  cards.splice(cardIndex, 1);

  logger.info(`Card with id ${id} deleted.`);

  res
    .status(204)
    .end();
});

module.exports = cardRouter;
