<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\AlbumAuthCredentialModel;
use App\Models\AlbumAuthTokenModel;
use CodeIgniter\HTTP\ResponseInterface;

class AlbumAuthController extends BaseController
{
    protected $credentialModel;
    protected $tokenModel;

    public function __construct()
    {
        $this->credentialModel = new AlbumAuthCredentialModel();
        $this->tokenModel = new AlbumAuthTokenModel();
    }

    /**
     * Admin: Add credentials
     * POST /api/admin/album-credentials
     */
    public function addCredential()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'CREATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $data = $this->request->getJSON(true);

        if (!isset($data['album_id'], $data['email'], $data['password'])) {
            return Utils::formatApiResponse(null, 'album_id, email, and password are required', 400);
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        $this->credentialModel->insert([
            'album_id' => $data['album_id'],
            'email' => $data['email'],
            'password_hash' => $hashedPassword,
            'is_active' => 1
        ]);

        return Utils::formatApiResponse(null, 'Album credentials added successfully', 201);
    }

    /**
     * Admin: List credentials for album
     * GET /api/admin/album-credentials/{album_id}
     */
    public function listCredentials($albumId = null)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'READ')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            if ($albumId) {
                $credentials = $this->credentialModel->where('album_id', $albumId)->findAll();
            } else {
                $credentials = $this->credentialModel->findAll();
            }

            return Utils::formatApiResponse($credentials, 'Credentials fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error fetching credentials: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Admin: Delete credential
     * DELETE /api/admin/album-credentials/{id}
     */
    public function deleteCredential($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'DELETE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            $credential = $this->credentialModel->find($id);
            if (!$credential) {
                return Utils::formatApiResponse(null, 'Credential not found', 404);
            }

            $this->credentialModel->delete($id);
            return Utils::formatApiResponse(null, 'Credential deleted successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error deleting credential: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Admin: Toggle credential status
     * PATCH /api/admin/album-credentials/{id}/status
     */
    public function toggleCredentialStatus($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            $credential = $this->credentialModel->find($id);
            if (!$credential) {
                return Utils::formatApiResponse(null, 'Credential not found', 404);
            }

            $data = $this->request->getJSON(true);
            $isActive = $data['is_active'] ?? null;

            if ($isActive === null) {
                return Utils::formatApiResponse(null, 'is_active is required', 400);
            }

            $this->credentialModel->update($id, ['is_active' => $isActive]);
            return Utils::formatApiResponse(null, 'Credential status updated successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error updating credential: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Client: Authenticate for album
     * POST /api/albums/{album_id}/authenticate
     */
    public function authenticate($albumId)
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['email'], $data['password'])) {
            return Utils::formatApiResponse(null, 'email and password are required', 400);
        }

        $credential = $this->credentialModel->where('album_id', $albumId)
                                            ->where('email', $data['email'])
                                            ->where('is_active', 1)
                                            ->first();

        if (!$credential || !password_verify($data['password'], $credential['password_hash'])) {
            return Utils::formatApiResponse(null, 'Invalid credentials', 401);
        }

        // Generate token valid for 1 hour
        $token = bin2hex(random_bytes(16));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $this->tokenModel->insert([
            'album_id' => $albumId,
            'token' => $token,
            'expires_at' => $expiresAt
        ]);

        return Utils::formatApiResponse([
            'token' => $token,
            'expires_at' => $expiresAt
        ], 'Authentication successful', 200);
    }

    /**
     * Client: Verify token
     * GET /api/albums/{album_id}/verify-token
     */
    public function verifyToken($albumId)
    {
        $token = $this->request->getGet('token');
        if (!$token) {
            return Utils::formatApiResponse(null, 'Token required', 400);
        }

        $record = $this->tokenModel->where('album_id', $albumId)
                                   ->where('token', $token)
                                   ->where('expires_at >=', date('Y-m-d H:i:s'))
                                   ->first();

        if (!$record) {
            return Utils::formatApiResponse(null, 'Invalid or expired token', 401);
        }

        return Utils::formatApiResponse(['valid' => true], 'Token is valid');
    }
}
