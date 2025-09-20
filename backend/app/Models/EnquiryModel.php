<?php

namespace App\Models;

use CodeIgniter\Model;

class EnquiryModel extends Model
{
    protected $table = 'enquiries';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'name',
        'email',
        'phone',
        'eventType',   // ✅ matches DB column
        'eventDate',   // ✅ matches DB column
        'message',
        'created_at',
        'updated_at'
    ];

    // Enable automatic timestamps
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Optional: validation rules (recommended)
    protected $validationRules = [
        'name'      => 'required|min_length[3]',
        'email'     => 'required|valid_email',
        'phone'     => 'permit_empty|string|max_length[20]',
        'eventType' => 'permit_empty|string|max_length[100]',
        'eventDate' => 'permit_empty|valid_date',
        'message'   => 'required|string'
    ];
}
