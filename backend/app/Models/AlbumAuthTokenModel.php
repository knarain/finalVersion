<?php namespace App\Models;

use CodeIgniter\Model;

class AlbumAuthTokenModel extends Model
{
    protected $table = 'album_auth_tokens';
    protected $primaryKey = 'id';
    protected $allowedFields = ['album_id', 'token', 'expires_at', 'created_at'];

    protected $returnType = 'array';

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
}
