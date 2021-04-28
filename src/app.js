require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const uuid = require('uuid/v4');

const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
  
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(express.json());

const cards = [
  {
    id: "cda12d01-3f48-4035-ad54-3173842feb36",
    title: "Go to store",
    content: "Pick up the shopping",
  },
  {
    id: "f6110166-c7ad-4640-84df-b033724eec25",
    title: "Rewatch Lord of the Rings",
    content: "But skip the lame Hobbit movies",
  },
  {
    id: "29f23668-b673-4c3e-b2dc-beb363893855",
    title: "Do TPS reports",
    content: "However, I'm not going to be working on Saturday",
  },
  {
    id: "abde6c49-0ed1-4d33-ab62-d6081c130316",
    title: "Order printer cartridges",
    content: "I don't remember the last time I printed anything",
  },
];

const lists = [
  {
    id: "586f5e98-a4ab-4ad0-91eb-9dd872506362",
    header: 'Home',
    cardIds: [1, 2]
  },
  {
    id: "cce57fa3-a847-423c-be32-407714b9ad42",
    header: 'Work',
    cardIds: [3, 4]
  },
];

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
});

app.get('/card', (req, res) => {
  res
    .json(cards);
});

app.post('/card', (req, res) => {
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

app.get('/card/:id', (req, res) => {
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

app.get('/list', (req, res) => {
  res
    .json(lists);
});

app.post('/list', (req, res) => {
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

app.get('/list/:id', (req, res) => {
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
});

app.delete('/list/:id', (req, res) => {
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


app.use(function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message });
});

module.exports = app;