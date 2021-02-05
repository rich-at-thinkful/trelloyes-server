const uuid = require('uuid/v4');
const { cards, lists } = require('../dataStore');
const logger = require('../logger');

function cardExists(req, res, next) {
  const { id } = req.params;
  const card = cards.find(c => c.id === id);

  // make sure we found a card
  if (!card) {
    logger.error(`Card with id ${id} not found.`);
    return next({
      status: 404,
      message: 'Card not found'
    });
  }

  next();
}

function hasValidCardData(req, res, next) {
  const { title, content } = req.body;

  if(!title) {
    logger.error(`Title is required`);
    return next({
      status: 400,
      message: 'Requires title'
    });
  }

  if(!content) {
    logger.error(`Content is required`);
    return next({
      status: 400,
      message: 'Requires content'
    });
  }

  next();
}

function list(req, res) {
  res
    .json(cards);
}

function read(req, res) {
  const { id } = req.params;
  const card = cards.find(c => c.id === id);
  res.json(card);
}

function create(req, res) {
  const { title, content } = req.body;
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

}

function destroy(req, res) {
  const { id } = req.params;

  const cardIndex = cards.findIndex(c => c.id === id);

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
}

module.exports = {
  list,
  read: [cardExists, read],
  create: [hasValidCardData, create],
  destroy: [cardExists, destroy],
};
