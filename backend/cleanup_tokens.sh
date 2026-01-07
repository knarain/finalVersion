#!/bin/bash

# Cron job to clean up expired tokens every 15 minutes
# Add this to your crontab: */15 * * * * /path/to/your/backend/cleanup_tokens.sh

cd /path/to/your/backend
php spark cleanup:tokens >> /var/log/token_cleanup.log 2>&1