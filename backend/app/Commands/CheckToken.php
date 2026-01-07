<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Models\AlbumAuthTokenModel;

class CheckToken extends BaseCommand
{
    protected $group       = 'debug';
    protected $name        = 'debug:token';
    protected $description = 'Check token status and expiration';

    public function run(array $params)
    {
        $token = $params[0] ?? null;
        
        if (!$token) {
            CLI::write('Usage: php spark debug:token <token>', 'red');
            return;
        }
        
        $tokenModel = new AlbumAuthTokenModel();
        $currentTime = date('Y-m-d H:i:s');
        
        $tokenData = $tokenModel->where('token', $token)->first();
        
        if (!$tokenData) {
            CLI::write("Token not found: {$token}", 'red');
            return;
        }
        
        CLI::write("Token: {$token}", 'yellow');
        CLI::write("Album ID: {$tokenData['album_id']}", 'white');
        CLI::write("Expires At: {$tokenData['expires_at']}", 'white');
        CLI::write("Current Time: {$currentTime}", 'white');
        
        $isExpired = strtotime($tokenData['expires_at']) <= time();
        CLI::write("Status: " . ($isExpired ? 'EXPIRED' : 'VALID'), $isExpired ? 'red' : 'green');
        
        if ($isExpired) {
            CLI::write("Deleting expired token...", 'yellow');
            $deleted = $tokenModel->where('token', $token)->delete();
            CLI::write("Deleted: {$deleted} record(s)", 'green');
        }
    }
}