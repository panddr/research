// import r from 'rethinkdb';
// import rethinkdbdash from 'rethinkdbdash';
// let r = rethinkdbdash();

const r = require('rethinkdbdash')(config.get('rethinkdb'));

import config from 'config';
import xss from 'xss';
import Mdash from 'mdash-node';
import marked from 'marked';
import slug from 'limax';

function connect() {
  return r.connect(config.get('rethinkdb'));
}

export function liveUpdates(io) {
  console.log('Setting up listener...');
  r
    .table('pulses')
    .changes().run((err, cursor) => {
      console.log('Listening for changes...');
      cursor.each((err, change) => {
        console.log('Change detected', change);
        io.emit('event-change', change);
      });
    });
}

export function getEvents() {
  return r
    .table('pulses')
    .orderBy(r.desc('updated')).run();
}

export function addEvent(event) {
  const date = new Date();
  event.created = date;
  event.updated = date;
  event.slug = slug(event.title);

  return r
    .table('pulses')
    .insert(event).run()
    .then(response => {
      return Object.assign({}, event, {id: response.generated_keys[0]});
    });
}

export function editEvent(id, event) {
  event.updated = new Date();
  event.slug = slug(event.title) + '-' + event.id;
  return r
    .table('pulses')
    .get(id).update(event).run()
    .then(() => event);
}

export function deleteEvent(id) {
  return r
    .table('pulses')
    .get(id).delete().run()
    .then(() => ({id: id, deleted: true}));
}

export function getEvent(slug) {
  return r
    .table('pulses')
    .getAll(slug, {index: 'slug'}).run()
}
