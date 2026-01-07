<?php
namespace App\Models;

use CodeIgniter\Model;

class CaptchaModel extends Model
{
    protected $table = 'captchas';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'captcha_id', 'text', 'ip_address', 'created_at', 'expires_at'
    ];
    protected $returnType = 'array';
}
