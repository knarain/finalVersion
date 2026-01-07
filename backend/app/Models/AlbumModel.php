<?php namespace App\Models;

use CodeIgniter\Model;

class AlbumModel extends Model {
    protected $table = 'albums';
    protected $primaryKey = 'id';
    protected $allowedFields = ['client_names', 'event_date', 'category_id', 'date', 'cover_image', 'is_locked', 'is_active', 'album_code'];
    protected $returnType = 'array';
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    
    // Disable validation for now
    protected $validationRules = [];
    protected $validationMessages = [];
    protected $skipValidation = false;
    
    // Enable auto increment
    protected $useAutoIncrement = true;
}
