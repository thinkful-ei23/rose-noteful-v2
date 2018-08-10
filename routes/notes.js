'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);
const knex = require('../knex');

const hydrateNotes = require('../utils/hydrateNotes');

//(done) Get All Notes accepts a searchTerm and finds notes with titles which contain the term. 
//It responds with an array of objects and a 200 status.
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query; //same as: const searchTerm = req.query.searchTerm; ?
  const { folderId } = req.query;
  const { tagId } = req.query; 
  
  knex.select('notes.id', 'title', 'content', 
    'folders.id as folderId', 'folders.name as folderName', 
    'notes_tags.note_id as notesTagsId', 'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
  //join notes with note_tags
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
  // join notes_tags with tags
    .leftJoin('tags', 'notes_tags.tag_id','tags.id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .modify(function (queryBuilder) { //filters checking notes.id
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    });
});


//Get Note By Id accepts an ID. 
//It responds with the note as an object, not an array with status 200. 
//If the ID is not found then it responds with a 404 status.
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  
  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
  //join notes with note_tags
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
  // join notes_tags with tags
    .leftJoin('tags', 'notes_tags.tag_id','tags.id')
    .where('notes.id', id) 
    .then(result => {
      if(!result) {
        next({status : 400});
      }
      if (result) { const hydrated = hydrateNotes(result);
        res.json(hydrated[0]);
      } else {
        next();
      } 
    }) 
    .catch(err => {
      next(err);
    });
});

//Update Note By Id accepts an ID and an object with the desired updates. 
//It responds with the updated note as an object and a 200 status
//local host:8080/api/notes/1003 
//BODY => { title: "new title"}
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  
  let noteId;
  const tags = req.body.tags; //can update tags in line 121

  const updateObj = {
    
  };
  
  const updateableFields = ['title', 'content'];
  updateableFields.forEach(field => {
    if (field in req.body) { //if title is present in body, if so, go to next one (content)
      updateObj[field] = req.body[field];
    } if ('folderId' in req.body) {
      updateObj['folder_id'] = req.body['folderId'];
    }
  });
  //Update note in notes table
  knex('notes') 
    .where('notes.id', id)
    .update(updateObj)
    .returning('id') //returning the id of the object I just updated *returning returns an array, here just one item = the id
    .then(([id]) => {  //pass the id array that has info about that note with array destructuring (1st index, single item which is id of that note)
      //then statement sets const id = id[0], 
      noteId = id; //set the id passed in the search parameter so we can select it
      //Delete current related tags from notes_tags table
      return knex('notes_tags')
        .where('note_id', noteId) //references the id of note we just updated
        .del();
    })
    //Insert related tags into notes_tags table 
    .then(() => {  
      const tagsInsert = tags.map(tagId => ({note_id: noteId, tag_id: tagId}));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      //Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId); 
    })
    .then(result => {
      if(result) {
        //if result exists, hydrate the results
        //hydrated = object with key: values with all info about the note (combined tables)
        const hydrated = hydrateNotes(result)[0]; //pass result to hydrateNotes fn, which returns an array where obj in array is the note but just want obj
        //respond with a 201 status, and a note object
        //hydrated.id = id of updated note 
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});


router.post('/', (req, res, next) => {
  const { title, content, folder_Id, tags } = req.body; // Add `folderId` to object destructure
  
  const newNote = {
    title: title,
    content: content,
    folder_id: folder_Id  // Add `folderId`
  };
  
  let noteId;
  // Insert new note into notes table
  knex.insert(newNote)
    .into('notes')  
    .returning('id') 
  //then insert related tags into notes_tags table
    .then(([id]) => {  
      noteId = id; //new serial id for new note
      const tagsInsert = tags.map(tagId => ({note_id: noteId, tag_id: tagId}));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
    //Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId); 
    })
    .then(result => {
      if(result) {
      //hydrate the results
        const hydrated = hydrateNotes(result)[0];
        //respond with a location header, a 201 status, and a note object
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});  
// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
    
  knex('notes')
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