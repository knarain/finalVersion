<?php namespace App\Models;

use CodeIgniter\Model;

class AlbumModel extends Model {
    protected $table = 'albums';
    protected $primaryKey = 'id';
    protected $allowedFields = ['client_names', 'event_type', 'date', 'cover_image', 'is_locked', 'created_at', 'updated_at'];
    protected $returnType = 'array';
}
