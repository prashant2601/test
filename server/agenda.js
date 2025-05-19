const Agenda = require('agenda');
const dotenv = require('dotenv');

dotenv.config();

const agenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: 'jobs' },
});

// Start Agenda once it’s ready
agenda.on('ready', () => {
  console.log('Agenda started!');
  agenda.start();
});

module.exports = agenda;
