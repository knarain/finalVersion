<?php namespace App\Models;

use CodeIgniter\Model;

class AlbumAuthCredentialModel extends Model {
    protected $table = 'album_access';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $allowedFields = ['album_id', 'email', 'password_hash', 'is_active'];
    protected $returnType = 'array';
    protected $useTimestamps = false;
}
