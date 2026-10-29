const EventEmitter = require('events');
// 'events' is a built-in Node module. EventEmitter is a CLASS
// (a blueprint) — you create your own emitter object from it.

const emitter = new EventEmitter();
// new EventEmitter() -> creates a fresh emitter object.
// This object now HAS .on() and .emit() methods available on it.

emitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});
// This does NOT run yet. It just REGISTERS: "when 'greet' is
// emitted, run this function." Nothing has happened so far.

console.log('before emit');

emitter.emit('greet', 'Rehan');
// THIS is what actually triggers it. emit('greet', 'Rehan') means:
// "the 'greet' event just happened, and here's the data ('Rehan')
// to pass along to whoever's listening."

console.log('after emit');

emitter.on('greet', (name) => {
  console.log(`Hi again, ${name}, from a second listener!`);
});

emitter.emit('greet', 'Rehan');