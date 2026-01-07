<?php
namespace App\Models;

use CodeIgniter\Model;

class TwoFactorCodeModel extends Model
{
    protected $table = 'two_factor_codes';
    protected $allowedFields = [
        'user_id', 'code', 'expires_at', 'created_at'
    ];
}
