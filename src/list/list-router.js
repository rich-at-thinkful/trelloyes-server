const express = require('express');
const uuid = require('uuid/v4');

const { lists, cards } = require('../datastore');
const logger = require('../logger');

const listRouter = express.Router();

listRouter
  .route('/')
  
  .get((req, res) => {
    res
      .json(lists);
  })
  
  .post((req, res) => {
    const { header, cardIds = [] } = req.body;

    if (!header) {
      logger.error(`Header is required`);
      return res
        .status(400)
        .send('Invalid data');
    }

    // check card IDs
    if (cardIds.length > 0) {
      let valid = true;
      cardIds.forEach(cid => {
        const card = cards.find(c => c.id == cid);
        if (!card) {
          logger.error(`Card with id ${cid} not found in cards array.`);
          valid = false;
        }
      });

      if (!valid) {
        return res
          .status(400)
          .send('Invalid data');
      }
    }

    // get an id
    const id = uuid();

    const list = {
      id,
      header,
      cardIds
    };

    lists.push(list);

    logger.info(`List with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/list/${id}`)
      .json({id});
  });

listRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    const list = lists.find(li => li.id == id);

    // make sure we found a list
    if (!list) {
      logger.error(`List with id ${id} not found.`);
      return res
        .status(404)
        .send('List Not Found');
    }

    res.json(list);
  })
  
  .delete((req, res) => {
    const { id } = req.params;

    const listIndex = lists.findIndex(li => li.id == id);

    if (listIndex === -1) {
      logger.error(`List with id ${id} not found.`);
      return res
        .status(404)
        .send('Not Found');
    }

    lists.splice(listIndex, 1);

    logger.info(`List with id ${id} deleted.`);
    res
      .status(204)
      .end();
  });

module.exports = listRouter;
