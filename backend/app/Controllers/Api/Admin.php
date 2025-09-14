<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AdminModel;
use CodeIgniter\API\ResponseTrait;
use Firebase\JWT\JWT;

class Admin extends BaseController {
    use ResponseTrait;

    protected $adminModel;
    protected $jwtKey = "YOUR_SECRET_KEY"; // Change this to a strong secret

    public function __construct() {
        $this->adminModel = new AdminModel();
        helper(['form']);
    }

    /**
     * Admin login
     * POST /api/admin/login
     * Body: { "username": "...", "password": "..." }
     */
    public function login() {
        $json = $this->request->getJSON(true);
        $username = $json['username'] ?? null;
        $password = $json['password'] ?? null;

        if (!$username || !$password) {
            return $this->fail('Username and password are required', 400);
        }

        $admin = $this->adminModel->where('username', $username)->first();
        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            return $this->fail('Invalid credentials', 401);
        }

        $payload = [
            'id' => $admin['id'],
            'username' => $admin['username'],
            'iat' => time(),
            'exp' => time() + 6*3600 // 6 hours expiry
        ];

        $jwt = JWT::encode($payload, $this->jwtKey, 'HS256');

        return $this->respond([
            'success' => true,
            'token' => $jwt,
            'admin' => [
                'id' => $admin['id'],
                'username' => $admin['username']
            ]
        ]);
    }

    /**
     * Add new admin
     * POST /api/admin/add-admin
     * Body: { "username": "...", "password": "..." }
     * Requires Authorization: Bearer <token>
     */
    public function addAdmin() {
        $json = $this->request->getJSON(true);
        $username = $json['username'] ?? null;
        $password = $json['password'] ?? null;

        if (!$username || !$password) {
            return $this->fail('Username and password are required', 400);
        }

        // Check if username exists
        if ($this->adminModel->where('username', $username)->first()) {
            return $this->fail('Username already exists', 400);
        }

        $adminId = $this->adminModel->insert([
            'username' => $username,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'created_at' => date('Y-m-d H:i:s')
        ]);

        return $this->respond([
            'success' => true,
            'adminId' => $adminId
        ]);
    }
    /**
     * Validate JWT token
     */
    protected function validateToken($token) {
        if (!$token) return false;
        try {
            $decoded = JWT::decode($token, $this->jwtKey, ['HS256']);
            return (array) $decoded;
        } catch (\Exception $e) {
            return false;
        }
    }
}
