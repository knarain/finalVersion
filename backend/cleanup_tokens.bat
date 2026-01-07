@echo off
REM Windows batch file to clean up expired tokens
REM Run this every 15 minutes via Windows Task Scheduler

cd /d "%~dp0"
php spark cleanup:tokens >> logs\token_cleanup.log 2>&1