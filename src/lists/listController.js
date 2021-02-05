const uuid = require('uuid/v4');
const { cards, lists } = require('../dataStore');
const logger = require('../logger');

function listExists(req, res, next) {
  const { id } = req.params;
  const list = lists.find(li => li.id === id);

  // make sure we found a list
  if(!list) {
    logger.error(`List with id ${id} not found.`);
    return next({
      status: 404,
      message: 'List not found'
    });
  }

  next();
}

function hasValidListData(req, res, next) {
  const { header, cardIds = [] } = req.body;

  if (!header) {
    logger.error(`Header is required`);
    return next({
      status: 400,
      message: 'Header required'
    });
  }

  // check card ids
  if (cardIds.length > 0) {
    const invalidIds = [];
    cardIds.forEach(cid => {
      const card = cards.find(c => c.id === cid);
      if (!card) {
        invalidIds.push(cid);
      } 
    });

    if (invalidIds.length > 0) {
      const errorMsg = `Card(s) with id(s) ${invalidIds.join(', ')} not found in cards array.`;
      logger.error(errorMsg);
      return next({
        status: 400,
        message: errorMsg,
      });
    }
  }

  next();
}

function list(req, res) {
  res
    .json(lists);
}

function create(req, res) {
  const { header, cardIds = [] } = req.body;
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
}

function read(req, res) {
  const { id } = req.params;
  const list = lists.find(li => li.id === id);

  res.json(list);
}

function destroy(req, res) {
  const { id } = req.params;

  const listIndex = lists.findIndex(li => li.id === id);

  lists.splice(listIndex, 1);

  logger.info(`List with id ${id} deleted.`);
  res
    .status(204)
    .end();
}

module.exports = {
  list,
  create: [hasValidListData, create],
  read: [listExists, read],
  destroy: [listExists, destroy],
};
