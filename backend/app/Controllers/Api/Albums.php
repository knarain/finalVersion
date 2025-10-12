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
   protected $uploadPath = WRITEPATH . '../public/uploads/albums/';
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
     public function index()
    {
        $category = $this->request->getGet('category');
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $limit = (int) ($this->request->getGet('limit') ?? 12);

        $builder = $this->albumModel;
        if ($category) {
            $builder = $builder->like('LOWER(event_type)', strtolower($category), 'both', null, true);
        }

        $total = $builder->countAllResults(false);
        $totalPages = max(1, (int) ceil($total / $limit));
        $offset = ($page - 1) * $limit;

        $albums = $builder->orderBy('date', 'DESC')->findAll($limit, $offset);

        $items = array_map(function ($a) {
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
     * Create new album and process cover image
     */
public function store()
{
    helper(['filesystem', 'text']);

    $data = [
        'client_names' => $this->request->getPost('clientNames'),
        'event_type'   => $this->request->getPost('eventType'),
        'date'         => $this->request->getPost('date'),
        'is_locked'    => $this->request->getPost('isLocked') ?? 0,
    ];

    $file = $this->request->getFile('coverImage');
    if (!$file || !$file->isValid()) {
        return $this->respond(['success' => false, 'message' => 'Invalid or missing cover image'], 400);
    }

    // Insert album to get ID
    $albumId = $this->albumModel->insert($data);
    if (!$albumId) {
        return $this->respond(['success' => false, 'message' => 'Failed to create album'], 500);
    }

    // Create album folder inside "public/uploads/albums/"
    $albumFolder = FCPATH . 'uploads/albums/' . $albumId . '/';
    if (!is_dir($albumFolder)) {
        mkdir($albumFolder, 0777, true);
    }

    // Process cover image
    $fileExt = strtolower($file->getExtension());
    $newFileName = 'cover.webp'; // Always store as webp
    $destination = $albumFolder . $newFileName;

    if ($fileExt === 'webp') {
        // Directly move webp file
        $file->move($albumFolder, $newFileName);
    } else {
        // Convert to WebP
        $tempPath = $file->getTempName();
        $this->convertToWebp($tempPath, $destination, $fileExt);
    }

    // Store relative path (from public/)
    $relativePath = 'uploads/albums/' . $albumId . '/' . $newFileName;

    // Update album with cover image path
    $this->albumModel->update($albumId, ['cover_image' => $relativePath]);

    return $this->respond([
        'success' => true,
        'message' => 'Album created successfully',
        'data' => [
            'id' => $albumId,
            'coverImage' => base_url($relativePath),
        ]
    ]);
}

/**
 * Convert image to WebP
 */
private function convertToWebp(string $sourcePath, string $destination, string $ext)
{
    $image = null;

    switch ($ext) {
        case 'jpg':
        case 'jpeg':
            $image = imagecreatefromjpeg($sourcePath);
            break;
        case 'png':
            $image = imagecreatefrompng($sourcePath);
            // Preserve transparency
            imagepalettetotruecolor($image);
            imagealphablending($image, true);
            imagesavealpha($image, true);
            break;
        case 'gif':
            $image = imagecreatefromgif($sourcePath);
            break;
        default:
            log_message('error', "Unsupported image type for conversion: $ext");
            return false;
    }

    if ($image) {
        imagewebp($image, $destination, 85);
        imagedestroy($image);
        return true;
    }

    return false;
}

    /**
     * GET /api/albums/{id}/images
     * Returns images in album; requires token if album is locked.
     */
    public function images($id = null) {
        if (!$id) return $this->failNotFound('Album id required');

        $album = $this->albumModel->find($id);
        if (!$album) return $this->failNotFound('Album not found');

        if ((int)$album['is_locked'] === 1) {
            $token = $this->getBearerToken() ?? $this->request->getGet('token');
            if (!$this->isTokenValid($id, $token)) {
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
                'fileUrl' => $img['file_url'],
                'caption' => $img['caption'],
            ];
        }, $images);

        return $this->respond(['success' => true, 'data' => $data]);
    }

    /**
     * POST /api/albums/{id}/authenticate
     * Authenticates email/password for locked album; returns token
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
                'error' => 'Email and password are required'
            ], 400);
        }

        $cred = $this->credModel->where(['album_id' => $id, 'email' => $email])->first();
        if (!$cred || !password_verify($password, $cred['password_hash'])) {
            return $this->respond(['success' => false, 'error' => 'Invalid credentials'], 401);
        }

        // Create token with 6-hour expiry
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
     * Helper: get bearer token from Authorization header
     */
    protected function getBearerToken(): ?string {
        $auth = $this->request->getServer('HTTP_AUTHORIZATION') ?? $this->request->getServer('Authorization');
        if (!$auth) return null;
        if (strpos($auth, 'Bearer ') === 0) {
            return trim(substr($auth, 7));
        }
        return null;
    }

    /**
     * Helper: validate token belongs to album and is not expired
     */
    protected function isTokenValid(int $albumId, ?string $token): bool {
        if (!$token) return false;
        $row = $this->tokenModel->where(['album_id' => $albumId, 'token' => $token])->first();
        if (!$row) return false;

        if (strtotime($row['expires_at']) < time()) {
            // Remove expired token
            $this->tokenModel->delete($row['id']);
            return false;
        }
        return true;
    }
}
