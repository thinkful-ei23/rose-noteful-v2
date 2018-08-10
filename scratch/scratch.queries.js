'use strict';
//example of an id that a note would have and [34, 56, 78] are the tags that that note would have
// const noteId = 99;
// //map() converts array of tagIds into an array of objects
// //note_id has value of noteId and tag_id has value of tagId
// const result = [34, 56, 78].map(tagId => ({ note_id: noteId, tag_id: tagId }));
// //the result is the array of objects returned from map method
// //insert the results into notes_tags table
// console.log(`insert: ${result} into notes_tags`);

// let searchTerm = 'cats';
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(function (queryBuilder) {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

// Get Note By Id accepts an ID. 
// It returns the note as an object not an array
// const id = 6;
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .where('id', id)
//   .then(results => {
//     console.log(results[0]);
//   })
//   .catch(err => {
//     console.error(err);
//   });

// Update Note By Id accepts an ID and an object with the desired updates. 
// It returns the updated note as an object
// const id = 5;
// knex('notes')
//   .where('id', id)
//   .update('title', 'NEWTITLE')
//   .then(results => {
//     console.log(results[0]);
//   })
//   .catch(err => {
//     console.error(err);
//   });
// //checking the above code  
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .where('id', id)
//   .then(results => {
//     console.log(results[0]);
//   })
//   .catch(err => {
//     console.error(err);
//   });

// Create a Note accepts an object with the note properties and inserts it in the DB. 
// It responds with the new note (including the new id) as an object 
// const id = 1000; 
// knex('notes')
//   .insert({title: 'New Title for Creating Note', content: 'New Content for Creating Note'})
//   .into('notes')
//   .returning(['id', 'title', 'content'])
//   .then(results => {
//     console.log(results[0]);
//   })
//   .catch(err => {
//     console.error(err);
//   });

//Delete Note By Id accepts an ID and deletes the note from the DB.
// const id = 12;
// knex('notes')
//   .where('id', id)
//   .del()
//   .then(console.log);