<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

class AddWatchWordColumn extends BaseCommand
{
    protected $group       = 'database';
    protected $name        = 'db:add-watch-word';
    protected $description = 'Add watch_word column to admin table';

    public function run(array $params)
    {
        $db = \Config\Database::connect();
        
        try {
            $sql = "ALTER TABLE admins ADD COLUMN watch_word VARCHAR(255) NULL AFTER password";
            $db->query($sql);
            CLI::write('Successfully added watch_word column to admins table', 'green');
        } catch (\Exception $e) {
            CLI::write('Error: ' . $e->getMessage(), 'red');
        }
    }
}