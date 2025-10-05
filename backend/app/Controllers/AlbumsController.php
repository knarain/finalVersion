<?php namespace App\Controllers;

use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use App\Models\AlbumAuthCredentialModel;
use App\Models\AlbumAuthTokenModel;
use CodeIgniter\API\ResponseTrait;

class AlbumsController extends BaseController
{
    use ResponseTrait;

    protected $albumModel;
    protected $albumImageModel;
    protected $authCredModel;
    protected $authTokenModel;

    public function __construct()
    {
        $this->albumModel      = new AlbumModel();
        $this->albumImageModel = new AlbumImageModel();
        $this->authCredModel   = new AlbumAuthCredentialModel();
        $this->authTokenModel  = new AlbumAuthTokenModel();
    }

    /**
     * Authenticate album access
     * POST /api/albums/{id}/authenticate
     */
    public function authenticate($id = null)
    {
        // Optional: Allow CORS for dev frontend if needed
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");

        $input    = $this->request->getJSON(true);
        $email    = $input['email'] ?? null;
        $password = $input['password'] ?? null;

        if (!$id || !$email || !$password) {
            log_message('error', "Authentication failed: Missing album id, email or password. AlbumID: {$id}, Email: {$email}");
            return $this->respond(['success' => false, 'error' => 'Missing credentials'], 400);
        }

        $cred = $this->authCredModel
            ->where('album_id', $id)
            ->where('email', $email)
            ->first();

        if (!$cred || !password_verify($password, $cred['password_hash'])) {
            log_message('error', "Authentication failed: Invalid credentials. AlbumID: {$id}, Email: {$email}");
            return $this->respond(['success' => false, 'error' => 'Invalid credentials'], 401);
        }

        helper('text');

        // System date & time based expiry (2 hours)
        $now       = new \DateTime("now", new \DateTimeZone("Asia/Kolkata"));
        $expiresAt = $now->modify('+2 hours')->format('Y-m-d H:i:s');

        // Check for existing token for this album
        $existing = $this->authTokenModel
            ->where('album_id', $id)
            ->first();

        if ($existing) {
            // Update expiry for existing token
            $this->authTokenModel->update($existing['id'], [
                'expires_at' => $expiresAt
            ]);
            $token = $existing['token'];
        } else {
            // Generate new token
            $token = random_string('alnum', 40);
            $this->authTokenModel->insert([
                'album_id'   => $id,
                'token'      => $token,
                'expires_at' => $expiresAt
            ]);
        }

        return $this->respond([
            'success' => true,
            'data'    => [
                'token'      => $token,
                'expires_at' => $expiresAt
            ]
        ]);
    }

    /**
     * Get album images
     * GET /api/albums/{id}/images
     */
    public function images($id = null)
    {
        // Optional: Allow CORS for dev frontend if needed
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");

        if (!$id) {
            log_message('error', "Fetching images failed: Album id not provided.");
            return $this->failNotFound('Album id required');
        }

        $album = $this->albumModel->find($id);
        if (!$album) {
            log_message('error', "Fetching images failed: Album not found. AlbumID: {$id}");
            return $this->failNotFound('Album not found');
        }

        // For locked albums, check authorization token
        if ((int)$album['is_locked'] === 1) {
            $token = $this->request->getHeaderLine('Authorization');
            if (stripos($token, 'Bearer ') === 0) {
                $token = substr($token, 7);
            } else {
                // fallback token from query param ?token=
                $token = $this->request->getGet('token');
            }

            if (!$this->isTokenValid($id, $token)) {
                log_message('error', "Access denied: Token invalid or expired. AlbumID: {$id}, Token: {$token}");
                return $this->respond([
                    'success' => false,
                    'error'   => 'Album is locked. Authentication required or token expired.'
                ], 401);
            }
        }

        $images = $this->albumImageModel
            ->where('album_id', $id)
            ->orderBy('id', 'ASC')
            ->findAll();

        if (!$images) {
            log_message('warning', "No images found in album. AlbumID: {$id}");
        }

        $data = array_map(function ($img) {
            return [
                'id'       => (int)$img['id'],
                'albumId'  => (int)$img['album_id'],
                'fileName' => $img['filename'],
                'fileUrl'  => $img['file_url'],
                'caption'  => $img['caption'],
            ];
        }, $images);

        return $this->respond(['success' => true, 'data' => $data]);
    }

    /**
     * Validate token helper
     */
    private function isTokenValid($albumId, $token)
    {
        if (!$token) {
            log_message('error', "Token validation failed: Token not provided. AlbumID: {$albumId}");
            return false;
        }

        $row = $this->authTokenModel
            ->where('album_id', $albumId)
            ->where('token', $token)
            ->first();

        if (!$row) {
            log_message('error', "Token validation failed: Token not found in database. AlbumID: {$albumId}, Token: {$token}");
            return false;
        }

        // Check expiry
        if (strtotime($row['expires_at']) < time()) {
            log_message('error', "Token validation failed: Token expired. AlbumID: {$albumId}, Token: {$token}");
            return false;
        }

        return true;
    }
}
