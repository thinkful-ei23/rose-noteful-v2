'use strict';
const knex = require ('../knex');
const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});


router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('folders.id', 'name')
    .from('folders')
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
 
  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });


  knex
    .update(updateObj)
    .from('folders')
    .where({id: id})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });

});

router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newItem = { name };
  /***** Never trust users - validate input *****/
  if (!newItem.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  knex('folders')
    .insert(newItem)
    .into('folders')
    .returning(['id', 'name'])
    .then( ([ item ]) => {
      res.location(`http://${req.headers.host}/folders/${item.id}`).status(201).json(item);
    })
    .catch(err => {
      next(err);
    });
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('folders')
    .where('id', id)
    .del()
    .then(() => {
      res.sendStatus(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;