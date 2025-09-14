<?php namespace App\Models;

use CodeIgniter\Model;

class AdminModel extends Model {
    protected $table = 'admins';
    protected $primaryKey = 'id';
    protected $allowedFields = ['username', 'password_hash', 'created_at'];
    protected $returnType = 'array';
}
