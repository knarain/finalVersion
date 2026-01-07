<?php namespace App\Models;

use CodeIgniter\Model;

class AlbumAuthTokenModel extends Model {
    protected $table = 'album_auth_tokens';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $allowedFields = ['album_id', 'token', 'expires_at'];
    protected $returnType = 'array';
    protected $useTimestamps = false;
}