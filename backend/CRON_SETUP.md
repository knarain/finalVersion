# Token Cleanup Cron Job Setup

## Manual Command
Run the cleanup command manually:
```bash
php spark cleanup:tokens
```

## Automatic Cleanup Setup

### For Linux/Unix Servers:
1. Make the script executable:
```bash
chmod +x cleanup_tokens.sh
```

2. Edit the script and update the path:
```bash
nano cleanup_tokens.sh
# Change /path/to/your/backend to your actual backend path
```

3. Add to crontab (runs every 30 minutes):
```bash
crontab -e
# Add this line:
*/30 * * * * /path/to/your/backend/cleanup_tokens.sh
```

### For Windows (Local Development):
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily, repeat every 30 minutes
4. Set action: Start program `cleanup_tokens.bat`

### For Shared Hosting (Hostinger):
1. Go to cPanel → Cron Jobs
2. Add new cron job:
   - Minute: */30
   - Hour: *
   - Day: *
   - Month: *
   - Weekday: *
   - Command: `cd /path/to/backend && php spark cleanup:tokens`

## CodeIgniter Task Scheduler (Alternative):
The Tasks.php config will automatically run cleanup every 30 minutes if you have the task scheduler running:
```bash
php spark tasks:run
```

## Verification:
Check logs to verify cleanup is working:
```bash
tail -f writable/logs/log-*.php
# or
tail -f /var/log/token_cleanup.log
```