<?php namespace App\Models;

use CodeIgniter\Model;

class AdminModel extends Model {
    protected $table = 'admins';
    protected $primaryKey = 'id';
    protected $allowedFields = ['username', 'password_hash', 'watch_word', 'email', 'two_factor_enabled', 'created_at', 'updated_at'];
    protected $returnType = 'array';
}
