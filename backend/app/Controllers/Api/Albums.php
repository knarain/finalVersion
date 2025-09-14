<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use App\Models\AlbumAuthCredentialModel;
use App\Models\AlbumAuthTokenModel;
use CodeIgniter\API\ResponseTrait;

class Albums extends BaseController {
    use ResponseTrait;

    protected $albumModel;
    protected $imageModel;
    protected $credModel;
    protected $tokenModel;

    public function __construct() {
        $this->albumModel = new AlbumModel();
        $this->imageModel = new AlbumImageModel();
        $this->credModel  = new AlbumAuthCredentialModel();
        $this->tokenModel = new AlbumAuthTokenModel();
    }

    /**
     * GET /api/albums?category=&page=&limit=
     */
    public function index() {
        $category = $this->request->getGet('category');
        $page = (int) ($this->request->getGet('page') ?? 1);
        $limit = (int) ($this->request->getGet('limit') ?? 12);
        if ($page < 1) $page = 1;

        $builder = $this->albumModel;
        if ($category) {
            // match event_type or category case-insensitively
            $builder = $builder->like('event_type', $category);
        }

        $total = $builder->countAllResults(false); // false -> don't reset query
        $totalPages = max(1, (int) ceil($total / $limit));

        $offset = ($page - 1) * $limit;
        $albums = $builder
            ->orderBy('date', 'DESC')
            ->findAll($limit, $offset);

        // Map DB fields to frontend names used in React
        $items = array_map(function($a){
            return [
                'id' => (int)$a['id'],
                'clientNames' => $a['client_names'],
                'eventType' => $a['event_type'],
                'date' => $a['date'],
                'coverImage' => $a['cover_image'],
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
     * If album is locked, requires token (Authorization: Bearer <token> or ?token=)
     */
    public function images($id = null) {
        if (!$id) return $this->failNotFound('Album id required');

        $album = $this->albumModel->find($id);
        if (!$album) return $this->failNotFound('Album not found');

        if ((int)$album['is_locked'] === 1) {
            // check token
            $token = $this->getBearerToken() ?? $this->request->getGet('token');
            if (!$token || !$this->isTokenValid($id, $token)) {
                return $this->respond([
                    'success' => false,
                    'error' => 'Album is locked. Authentication required.'
                ], 401);
            }
        }

        $images = $this->imageModel->where('album_id', $id)->orderBy('id','ASC')->findAll();
        $data = array_map(function($img){
            return [
                'id' => (int)$img['id'],
                'albumId' => (int)$img['album_id'],
                'fileName' => $img['filename'],
                'fileUrl' => $img['file_url'],
                'caption' => $img['caption']
            ];
        }, $images);

        return $this->respond(['success' => true, 'data' => $data]);
    }

    /**
     * POST /api/albums/{id}/authenticate
     * Body: { email, password }
     * Returns { success: true, token: "...", expiresAt: "ISO" }
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
        if (!$cred) {
            return $this->respond(['success' => false, 'error' => 'Invalid credentials'], 401);
        }

        if (!password_verify($password, $cred['password_hash'])) {
            return $this->respond(['success' => false, 'error' => 'Invalid credentials'], 401);
        }

        // generate token and save with expiry (e.g., 6 hours)
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

    // Helper: get bearer token from Authorization header
    protected function getBearerToken() {
        $auth = $this->request->getServer('HTTP_AUTHORIZATION') ?? $this->request->getServer('Authorization');
        if (!$auth) return null;
        if (strpos($auth, 'Bearer ') === 0) {
            return trim(substr($auth, 7));
        }
        return null;
    }

    // Helper: checks token validity
    protected function isTokenValid($albumId, $token) {
        if (!$token) return false;
        $row = $this->tokenModel->where(['album_id' => $albumId, 'token' => $token])->first();
        if (!$row) return false;
        if (strtotime($row['expires_at']) < time()) {
            // optionally delete expired token
            $this->tokenModel->delete($row['id']);
            return false;
        }
        return true;
    }
}
