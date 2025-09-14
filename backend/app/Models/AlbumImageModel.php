<?php namespace App\Models;

use CodeIgniter\Model;

class AlbumImageModel extends Model {
    protected $table = 'album_images';
    protected $primaryKey = 'id';
    protected $allowedFields = ['album_id', 'filename', 'file_url', 'caption', 'created_at'];
    protected $returnType = 'array';
}
