<?php namespace App\Models;

use CodeIgniter\Model;

class AlbumAuthCredentialModel extends Model {
    protected $table = 'album_auth_credentials';
    protected $primaryKey = 'id';
    protected $allowedFields = ['album_id', 'email', 'password_hash', 'created_at'];
    protected $returnType = 'array';
}
