#!/bin/sh

# Start the run once job.
echo "Security camera recorder"

# Setup a cron schedule
echo "0 * * * * /record/run.sh >> /var/log/cron.log 2>&1
# This extra line makes it a valid cron" > scheduler.txt

crontab scheduler.txt
crond -f
