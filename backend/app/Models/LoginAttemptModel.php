<?php
namespace App\Models;

use CodeIgniter\Model;

class LoginAttemptModel extends Model
{
    protected $table = 'login_attempts';
    protected $allowedFields = [
        'ip_address', 'attempts', 'locked_until',
        'created_at', 'updated_at'
    ];
}