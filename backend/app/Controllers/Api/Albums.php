<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use App\Models\AlbumAuthCredentialModel;
use App\Models\AlbumAuthTokenModel;
use CodeIgniter\API\ResponseTrait;

class Albums extends BaseController {
    use ResponseTrait;

    protected AlbumModel $albumModel;
    protected AlbumImageModel $imageModel;
    protected AlbumAuthCredentialModel $credModel;
    protected AlbumAuthTokenModel $tokenModel;

    public function __construct() {
        $this->albumModel = new AlbumModel();
        $this->imageModel = new AlbumImageModel();
        $this->credModel  = new AlbumAuthCredentialModel();
        $this->tokenModel = new AlbumAuthTokenModel();
    }

    /**
     * GET /api/albums?category=&page=&limit=
     * Returns paginated albums, filtered by category if given.
     */
    public function index() {
        $category = $this->request->getGet('category');
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $limit = (int) ($this->request->getGet('limit') ?? 12);

        $builder = $this->albumModel;
        if ($category) {
            // Case-insensitive category/event_type filter
            $builder = $builder->like('LOWER(event_type)', strtolower($category), 'both', null, true);
        }

        // Count total matching albums without resetting builder
        $total = $builder->countAllResults(false);
        $totalPages = max(1, (int) ceil($total / $limit));
        $offset = ($page - 1) * $limit;

        // Fetch page of albums ordered by date descending
        $albums = $builder->orderBy('date', 'DESC')->findAll($limit, $offset);

        // Map DB fields to frontend keys
        $items = array_map(function($a) {
            return [
                'id' => (int)$a['id'],
                'clientNames' => $a['client_names'],
                'eventType' => $a['event_type'],
                'date' => $a['date'],
                'coverImage' => $a['cover_image'], // full URL or accessible path expected
                'isLocked' => (bool)$a['is_locked'],
            ];
        }, $albums);

        return $this->respond([
            'success' => true,
            'data' => [
                'items' => $items,
                'totalPages' => $totalPages,
                'page' => $page,
                'limit' => $limit,
            ]
        ]);
    }

    /**
     * GET /api/albums/{id}/images
     * Returns images in album; requires token if album is locked.
     *
     * @param int|null $id Album id
     */
    public function images($id = null) {
        if (!$id) return $this->failNotFound('Album id required');

        $album = $this->albumModel->find($id);
        if (!$album) return $this->failNotFound('Album not found');

        if ((int)$album['is_locked'] === 1) {
            // Check token validity via header or query param
            $token = $this->getBearerToken() ?? $this->request->getGet('token');
            if (!$token || !$this->isTokenValid($id, $token)) {
                return $this->respond([
                    'success' => false,
                    'error' => 'Album is locked. Authentication required.'
                ], 401);
            }
        }

        $images = $this->imageModel->where('album_id', $id)->orderBy('id', 'ASC')->findAll();
        $data = array_map(function($img) {
            return [
                'id' => (int)$img['id'],
                'albumId' => (int)$img['album_id'],
                'fileName' => $img['filename'],
                'fileUrl' => $img['file_url'], // must be accessible publicly
                'caption' => $img['caption'],
            ];
        }, $images);

        return $this->respond(['success' => true, 'data' => $data]);
    }

    /**
     * POST /api/albums/{id}/authenticate
     * Authenticates email/password for locked album; returns token
     *
     * @param int|null $id Album id
     */
    public function authenticate($id = null) {
        if (!$id) return $this->failNotFound('Album id required');

        $album = $this->albumModel->find($id);
        if (!$album) return $this->failNotFound('Album not found');

        $json = $this->request->getJSON(true);
        $email = $json['email'] ?? null;
        $password = $json['password'] ?? null;
        if (!$email || !$password) {
            return $this->respond([
                'success' => false,
                'error' => 'email and password are required'
            ], 400);
        }

        $cred = $this->credModel->where(['album_id' => $id, 'email' => $email])->first();
        if (!$cred || !password_verify($password, $cred['password_hash'])) {
            return $this->respond(['success' => false, 'error' => 'Invalid credentials'], 401);
        }

        // Create token with 6-hr expiry
        $token = bin2hex(random_bytes(24));
        $expiresAt = date('Y-m-d H:i:s', time() + 6 * 3600);

        $this->tokenModel->insert([
            'album_id' => $id,
            'token' => $token,
            'expires_at' => $expiresAt,
        ]);

        return $this->respond([
            'success' => true,
            'data' => [
                'token' => $token,
                'expiresAt' => $expiresAt
            ]
        ]);
    }

    /**
     * Helper to get bearer token from Authorization header
     * @return string|null
     */
    protected function getBearerToken() {
        $auth = $this->request->getServer('HTTP_AUTHORIZATION') ?? $this->request->getServer('Authorization');
        if (!$auth) return null;
        if (strpos($auth, 'Bearer ') === 0) {
            return trim(substr($auth, 7));
        }
        return null;
    }

    /**
     * Helper to validate token belongs to album and is not expired
     * @param int $albumId
     * @param string $token
     * @return bool
     */
    protected function isTokenValid($albumId, $token) {
        if (!$token) return false;
        $row = $this->tokenModel->where(['album_id' => $albumId, 'token' => $token])->first();
        if (!$row) return false;
        if (strtotime($row['expires_at']) < time()) {
            // Delete expired token
            $this->tokenModel->delete($row['id']);
            return false;
        }
        return true;
    }
}
