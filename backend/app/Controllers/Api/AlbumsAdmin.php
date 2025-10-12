<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use CodeIgniter\API\ResponseTrait;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use CodeIgniter\HTTP\ResponseInterface;

class AlbumsAdmin extends BaseController {
    use ResponseTrait;

    protected $albumModel;
    protected $imageModel;
    protected $jwtKey = "YOUR_SECRET_KEY";

    public function __construct() {
        $this->albumModel = new AlbumModel();
        $this->imageModel = new AlbumImageModel();
    }

    /**
     * Decode JWT token and return admin payload
     */
    protected function getAdmin() {
        $authHeader = $this->request->getServer('HTTP_AUTHORIZATION');
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) return false;

        $token = $matches[1];

        try {
            // ✅ Updated for firebase/php-jwt v6+
            $decoded = JWT::decode($token, new Key($this->jwtKey, 'HS256'));
            return (array)$decoded;
        } catch (\Exception $e) {
            log_message('error', $e->getMessage());
            return false;
        }
    }

    /**
     * Create new album
     */
    public function create() {
        $admin = $this->getAdmin();
        if (!$admin) return $this->failUnauthorized('Unauthorized');

        $json = $this->request->getJSON(true);

        $clientNames = $json['clientNames'] ?? null;
        $eventType   = $json['eventType'] ?? null;
        $date        = $json['date'] ?? null;
        $isLocked    = $json['isLocked'] ?? 0;
        $coverImage  = $json['coverImage'] ?? null; // base64 or URL

        if (!$clientNames || !$eventType || !$date || !$coverImage) {
            return $this->fail('All fields are required', 400);
        }

        $albumId = $this->albumModel->insert([
            'client_names' => $clientNames,
            'event_type'   => $eventType,
            'date'         => $date,
            'cover_image'  => $coverImage,
            'is_locked'    => $isLocked,
        ]);

        return $this->respond([
            'success' => true,
            'albumId' => $albumId
        ]);
    }

    /**
     * Upload images to an album
     */
public function uploadImages($albumId)
{
    $admin = $this->getAdmin();
    if (!$admin) return $this->failUnauthorized('Unauthorized');

    $files = $this->request->getFiles();
    if (empty($files['images'])) {
        return $this->fail('No files uploaded', 400);
    }

    $images = $files['images'];
    $totalFiles = count($images);

    if ($totalFiles > 10) {
        return $this->fail('Maximum 10 images allowed per upload', 400);
    }

    // Store inside public folder
    $uploadPath = FCPATH . 'uploads/albums/' . $albumId . '/';
    if (!is_dir($uploadPath)) {
        mkdir($uploadPath, 0777, true);
    }

    $uploaded = [];

    foreach ($images as $file) {
        if ($file->isValid() && !$file->hasMoved()) {
            $ext = strtolower($file->getExtension());
            $newName = uniqid('img_', true) . '.webp'; // store all as .webp
            $destination = $uploadPath . $newName;

            // Convert to WebP if needed
            if ($ext === 'webp') {
                $file->move($uploadPath, $newName);
            } else {
                $this->convertToWebp($file->getTempName(), $destination, $ext);
            }

            // Store relative path (for DB)
            $relativePath = 'uploads/albums/' . $albumId . '/' . $newName;

            // Insert record into DB
            $this->imageModel->insert([
                'album_id' => $albumId,
                'filename' => $newName,
                'file_url' => $relativePath, // relative from public/
                'caption'  => '',
            ]);

            $uploaded[] = base_url($relativePath);
        }
    }

    return $this->respond([
        'success'  => true,
        'uploaded' => $uploaded, // return full URLs
    ]);
}

/**
 * Convert image to WebP
 */
private function convertToWebp(string $sourcePath, string $destination, string $ext)
{
    // Check GD availability
    if (!function_exists('imagewebp')) {
        log_message('error', 'GD extension not enabled — WebP conversion skipped');
        return false;
    }

    $image = null;

    switch ($ext) {
        case 'jpg':
        case 'jpeg':
            $image = @imagecreatefromjpeg($sourcePath);
            break;
        case 'png':
            $image = @imagecreatefrompng($sourcePath);
            if ($image) {
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
            }
            break;
        case 'gif':
            $image = @imagecreatefromgif($sourcePath);
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
     * Get all images for an album
     */
    public function images($albumId = null) {
        if (!$albumId) {
            return $this->response
                        ->setJSON(['status' => 'error', 'message' => 'Album ID is required'])
                        ->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
        }

        $images = $this->imageModel
                       ->where('album_id', $albumId)
                       ->orderBy('created_at', 'DESC')
                       ->findAll();

        return $this->response->setJSON([
            'status' => 'success',
            'data'   => $images
        ]);
    }
}
