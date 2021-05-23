#!/bin/sh

# Start the run once job.
echo "Security camera recorder"

node /record/index.js &

# Setup a cron schedule
echo "*/15 * * * * /record/run.sh >> /var/log/cron.log 2>&1
# This extra line makes it a valid cron" > scheduler.txt

crontab scheduler.txt
crond -f
