const fs = require('fs');
const path = require('path');

const loadAgendaJobs = (agenda) => {
    console.log("Agenda initial");
    const jobsPath = path.join(__dirname); // Points to `JobsInLine/` directory
    
    fs.readdirSync(jobsPath).forEach((file) => {
        if (file.endsWith('.js') && file !== 'agendaJobsLoader.js') {
            const job = require(path.join(jobsPath, file));
            if (typeof job === 'function') {
                job(agenda); // Pass agenda instance to each job
            }
        }
    });
};

module.exports = loadAgendaJobs;
