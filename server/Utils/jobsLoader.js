const fs = require('fs');
const path = require('path');

const loadCronJobs = () => {
    console.log('Initializing cron jobs...');

    const cronJobsPath = path.join(__dirname, 'CronJobs');
    fs.readdirSync(cronJobsPath).forEach((file) => {
        if (file.endsWith('.js')) {
            const job = require(path.join(cronJobsPath, file));
            if (typeof job === 'function') {
                job(); // Execute the job
            }
        }
    });

    console.log('All cron jobs initialized.');
};

module.exports = loadCronJobs;
