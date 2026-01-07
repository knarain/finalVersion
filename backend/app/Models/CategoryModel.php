<?php namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model {
    protected $table = 'categories';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name'];
    protected $returnType = 'array';
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $useAutoIncrement = true;
}