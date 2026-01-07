<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Models\AlbumAuthTokenModel;

class ExpireToken extends BaseCommand
{
    protected $group       = 'debug';
    protected $name        = 'debug:expire-token';
    protected $description = 'Manually expire a token for testing';

    public function run(array $params)
    {
        $token = $params[0] ?? null;
        
        if (!$token) {
            CLI::write('Usage: php spark debug:expire-token <token>', 'red');
            return;
        }
        
        $tokenModel = new AlbumAuthTokenModel();
        $pastTime = date('Y-m-d H:i:s', time() - 3600); // 1 hour ago
        
        $updated = $tokenModel->where('token', $token)
                             ->set('expires_at', $pastTime)
                             ->update();
        
        if ($updated) {
            CLI::write("Token expired successfully: {$token}", 'green');
            CLI::write("New expiry time: {$pastTime}", 'yellow');
        } else {
            CLI::write("Token not found: {$token}", 'red');
        }
    }
}