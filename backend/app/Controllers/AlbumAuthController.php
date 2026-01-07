<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\AlbumAuthCredentialModel;
use App\Models\AlbumAuthTokenModel;
use App\Libraries\Utils;
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

    public function listCredentials($albumId = null)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof \CodeIgniter\HTTP\ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? null) !== 'admin') {
            return Utils::formatApiResponse(
                null,
                'Only admin can list credentials',
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        $query = $this->credentialModel->select('id, album_id, email, is_active');
        
        if ($albumId) {
            $query->where('album_id', $albumId);
        }
        
        $credentials = $query->findAll();

        return Utils::formatApiResponse(
            $credentials,
            'Credentials retrieved successfully'
        );
    }

    public function deleteCredential($credentialId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof \CodeIgniter\HTTP\ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? null) !== 'admin') {
            return Utils::formatApiResponse(
                null,
                'Only admin can delete credentials',
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        $credential = $this->credentialModel->find($credentialId);
        if (!$credential) {
            return Utils::formatApiResponse(
                null,
                'Credential not found',
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        $this->credentialModel->delete($credentialId);

        return Utils::formatApiResponse(
            null,
            'Credential deleted successfully'
        );
    }

    public function toggleCredentialStatus($credentialId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof \CodeIgniter\HTTP\ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? null) !== 'admin') {
            return Utils::formatApiResponse(
                null,
                'Only admin can toggle credential status',
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        $credential = $this->credentialModel->find($credentialId);
        if (!$credential) {
            return Utils::formatApiResponse(
                null,
                'Credential not found',
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        $data = $this->request->getJSON(true);
        $newStatus = isset($data['is_active']) ? (int) $data['is_active'] : ($credential['is_active'] ? 0 : 1);

        $this->credentialModel->update($credentialId, ['is_active' => $newStatus]);

        return Utils::formatApiResponse(
            ['id' => $credentialId, 'is_active' => $newStatus],
            'Credential status updated successfully'
        );
    }

    public function addCredential()
    {
        // 🔐 Authenticate (Admin/User via token)
        $auth = Utils::getAuthenticatedUser();

        // If auth failed, Utils already returned a Response
        if ($auth instanceof \CodeIgniter\HTTP\ResponseInterface) {
            return $auth;
        }

        // 🧠 Optional: restrict only admins
        if (($auth['auth_type'] ?? null) !== 'admin') {
            return Utils::formatApiResponse(
                null,
                'Only admin can add album credentials',
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        // 📦 Read JSON payload
        $data = $this->request->getJSON(true);

        // ❌ Validation
        if (!isset($data['album_id'], $data['email'], $data['password'])) {
            return Utils::formatApiResponse(
                null,
                'album_id, email, and password are required',
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $email = strtolower(trim($data['email']));
        $albumId = (int) $data['album_id'];

        // Check if album exists
        $albumModel = new \App\Models\AlbumModel();
        $album = $albumModel->find($albumId);
        if (!$album) {
            return Utils::formatApiResponse(
                null,
                'Album not found',
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        // Check for duplicate email for this album
        $existing = $this->credentialModel
            ->where('album_id', $albumId)
            ->where('email', $email)
            ->first();

        if ($existing) {
            return Utils::formatApiResponse(
                null,
                'Email already exists for this album',
                ResponseInterface::HTTP_CONFLICT
            );
        }

        // 🔐 Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // 📧 Send email with credentials FIRST
        $emailSent = Utils::sendEmail(
            $email,
            'Album Access Credentials - Your Photos Are Ready!',
            '',
            'album_credentials',
            [
                'email' => $email,
                'password' => $data['password'],
                'albumTitle' => $album['client_names'] . ' - ' . $album['event_date']
            ]
        );

        if (!$emailSent) {
            return Utils::formatApiResponse(
                null,
                'Failed to send email notification. Please check email configuration.',
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        // 💾 Save credential only after email success
        $this->credentialModel->insert([
            'album_id'      => $albumId,
            'email'         => $email,
            'password_hash'=> $hashedPassword,
        ]);

        // ✅ Success
        return Utils::formatApiResponse(
            null,
            'Album credentials added and email sent successfully',
            ResponseInterface::HTTP_CREATED
        );
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
