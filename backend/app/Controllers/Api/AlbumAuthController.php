<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\AlbumAuthCredentialModel;
use App\Models\AlbumAuthTokenModel;

class AlbumAuthController extends ResourceController
{
    protected $format = 'json';
    protected $credentialModel;
    protected $tokenModel;

    public function __construct()
    {
        $this->credentialModel = new AlbumAuthCredentialModel();
        $this->tokenModel = new AlbumAuthTokenModel();
    }

    // 🔹 Admin: Add credentials
    public function addCredential()
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['album_id'], $data['email'], $data['password'])) {
            return $this->failValidationErrors('album_id, email, and password are required');
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        $this->credentialModel->insert([
            'album_id' => $data['album_id'],
            'email' => $data['email'],
            'password_hash' => $hashedPassword
        ]);

        return $this->respond([
            'success' => true,
            'message' => 'Album credentials added successfully'
        ]);
    }

    // 🔹 Authenticate for album
    public function authenticate($album_id)
    {
        $data = $this->request->getJSON(true);

        $credential = $this->credentialModel->where('album_id', $album_id)
                                            ->where('email', $data['email'])
                                            ->first();

        if (!$credential || !password_verify($data['password'], $credential['password_hash'])) {
            return $this->fail('Invalid credentials');
        }

        // Generate token valid for 1 hour
        $token = bin2hex(random_bytes(16));
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $this->tokenModel->insert([
            'album_id' => $album_id,
            'token' => $token,
            'expires_at' => $expires_at
        ]);

        return $this->respond([
            'success' => true,
            'data' => ['token' => $token, 'expires_at' => $expires_at]
        ]);
    }

    // 🔹 Optional: Verify token
    public function verifyToken($album_id)
    {
        $token = $this->request->getGet('token');
        if (!$token) return $this->fail('Token required');

        $record = $this->tokenModel->where('album_id', $album_id)
                                   ->where('token', $token)
                                   ->where('expires_at >=', date('Y-m-d H:i:s'))
                                   ->first();

        if (!$record) return $this->fail('Invalid or expired token');

        return $this->respond(['success' => true]);
    }
}
