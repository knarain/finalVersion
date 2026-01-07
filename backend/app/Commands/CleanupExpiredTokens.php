<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Models\AlbumAuthTokenModel;

class CleanupExpiredTokens extends BaseCommand
{
    protected $group       = 'maintenance';
    protected $name        = 'cleanup:tokens';
    protected $description = 'Delete expired album authentication tokens';

    public function run(array $params)
    {
        $tokenModel = new AlbumAuthTokenModel();
        
        // Set IST timezone for proper comparison
        date_default_timezone_set('Asia/Kolkata');
        $currentTime = date('Y-m-d H:i:s');
        
        // Count expired tokens before deletion
        $expiredCount = $tokenModel->where('expires_at <=', $currentTime)->countAllResults(false);
        
        // Delete expired tokens
        $deletedCount = $tokenModel->where('expires_at <=', $currentTime)->delete();
        
        CLI::write("Current IST time: {$currentTime}", 'white');
        CLI::write("Found {$expiredCount} expired tokens", 'yellow');
        CLI::write("Deleted {$deletedCount} expired tokens", 'green');
        
        // Log the cleanup
        log_message('info', "Token cleanup (IST): Found {$expiredCount}, Deleted {$deletedCount} expired album tokens at {$currentTime}");
        
        return $deletedCount;
    }
}