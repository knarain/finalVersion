<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use CodeIgniter\API\ResponseTrait;
use Firebase\JWT\JWT;

class AlbumsAdmin extends BaseController {
    use ResponseTrait;

    protected $albumModel;
    protected $imageModel;
    protected $jwtKey = "YOUR_SECRET_KEY";

    public function __construct() {
        $this->albumModel = new AlbumModel();
        $this->imageModel = new AlbumImageModel();
    }

    protected function getAdmin() {
        $authHeader = $this->request->getServer('HTTP_AUTHORIZATION');
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) return false;
        $token = $matches[1];
        try {
            $decoded = JWT::decode($token, $this->jwtKey, ['HS256']);
            return (array)$decoded;
        } catch (\Exception $e) {
            return false;
        }
    }

    // Add new album
    public function create() {
        $admin = $this->getAdmin();
        if (!$admin) return $this->failUnauthorized('Unauthorized');

        $json = $this->request->getJSON(true);
        $clientNames = $json['clientNames'] ?? null;
        $eventType = $json['eventType'] ?? null;
        $date = $json['date'] ?? null;
        $isLocked = $json['isLocked'] ?? 0;
        $coverImage = $json['coverImage'] ?? null; // expect base64 or URL

        if (!$clientNames || !$eventType || !$date || !$coverImage) {
            return $this->fail('All fields are required', 400);
        }

        $albumId = $this->albumModel->insert([
            'client_names' => $clientNames,
            'event_type' => $eventType,
            'date' => $date,
            'cover_image' => $coverImage,
            'is_locked' => $isLocked,
        ]);

        return $this->respond([
            'success' => true,
            'albumId' => $albumId
        ]);
    }

    // Upload album images
    public function uploadImages($albumId) {
        $admin = $this->getAdmin();
        if (!$admin) return $this->failUnauthorized('Unauthorized');

        $files = $this->request->getFiles();
        if (!$files) return $this->fail('No files uploaded', 400);

        $uploaded = [];
        foreach ($files['images'] ?? [] as $file) {
            if ($file->isValid() && !$file->hasMoved()) {
                $newName = $file->getRandomName();
                $file->move(WRITEPATH.'uploads', $newName);

                $fileUrl = base_url('writable/uploads/'.$newName);

                $imageId = $this->imageModel->insert([
                    'album_id' => $albumId,
                    'filename' => $newName,
                    'file_url' => $fileUrl,
                    'caption' => '',
                ]);

                $uploaded[] = $fileUrl;
            }
        }

        return $this->respond([
            'success' => true,
            'uploaded' => $uploaded
        ]);
    }

    public function images($albumId = null)
    {
        if (!$albumId) {
            return $this->response
                        ->setJSON(['status' => 'error', 'message' => 'Album ID is required'])
                        ->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
        }

        $model = new AlbumImageModel();
        $images = $model->where('album_id', $albumId)
                        ->orderBy('created_at', 'DESC')
                        ->findAll();

        return $this->response->setJSON([
            'status' => 'success',
            'data' => $images
        ]);
    }
}
