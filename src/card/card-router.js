const express = require('express');

const { cards } = require('../datastore');
const logger = require('../logger');
const uuid = require('uuid/v4');

const cardRouter = express.Router();

cardRouter
  .route('/')
  .get((req, res) => {
    res
      .json(cards);
  })
  
  .post((req, res) => {
    const { title, content } = req.body;
    if (!title) {
      logger.error(`Title is required`);
      return res
        .status(400)
        .send('Invalid data');
    }
    
    if (!content) {
      logger.error(`Content is required`);
      return res
        .status(400)
        .send('Invalid data');
    }

    // get an id
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
      .json(card);
  });

cardRouter
  .route('/card/:id')
  .get((req, res) => {
    const { id } = req.params;
    const card = cards.find(c => c.id == id);

    // make sure we found a card
    if (!card) {
      logger.error(`Card with id ${id} not found.`);
      return res
        .status(404)
        .send('Card Not Found');
    }

    res.json(card);
  });


module.exports = cardRouter;
