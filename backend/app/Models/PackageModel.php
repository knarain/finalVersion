<?php

namespace App\Models;

use CodeIgniter\Model;

class PackageModel extends Model
{
    protected $table = 'packages';
    protected $primaryKey = 'id';
    protected $allowedFields = ['category', 'name', 'price', 'features', 'is_active'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $returnType = 'array';
}
