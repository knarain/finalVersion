<?php

namespace App\Models;

use CodeIgniter\Model;

class PermissionModel extends Model
{
    protected $table = 'permissions';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'slug', 'description'];
    protected $useTimestamps = true;
    protected $returnType = 'array';

    public function getStandardPermissions()
    {
        return $this->whereIn('slug', ['create', 'read', 'update', 'delete'])->findAll();
    }

    public function getBySlug($slug)
    {
        return $this->where('slug', $slug)->first();
    }
}
