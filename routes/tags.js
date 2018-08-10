'use strict';

const express = require('express');
const knex = require('../knex');
const router = express.Router();

//get all tags 
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex.first('id', 'name')
    .from('tags')
    .where('id', id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

router.put('/:id', (req, res, next) => {
  const id = req.params.id;
 
  const updateObj = req.body;
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  knex.select('id', 'name')
    .from('tags')
    .where({id: id})
    .update(updateObj, ['id', 'name'])
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });

});



// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('tags')
    .where('id', id)
    .del()
    .then(() => {
      res.sendStatus(204).end();
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE ITEM ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});  
// .then(((results) => {
//   // // Uses Array index solution to get first item in results array
//   // // const result = results[0];
//   // res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
// })
    
module.exports = router;