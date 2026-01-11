<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use App\Models\CategoryModel;
use App\Helpers\ActionLogHelper;
use App\Helpers\QRCodeHelper;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;
use App\Libraries\Utils;

class AlbumsAdmin extends BaseController
{
    use ResponseTrait;

    protected $albumModel;
    protected $imageModel;
    protected $categoryModel;

    public function __construct()
    {
        $this->albumModel = new AlbumModel();
        $this->imageModel = new AlbumImageModel();
        $this->categoryModel = new CategoryModel();
    }

    public function categories()
    {
        $categories = $this->categoryModel->findAll();
        
        $data = array_map(fn ($c) => [
            'id'   => (int) $c['id'],
            'name' => $c['name']
        ], $categories);
        
        return Utils::formatApiResponse(
            $data,
            'Categories fetched successfully'
        );
    }

    public function storeCategory()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Categories', 'CREATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $payload = $this->request->getJSON(true);
        if (!$payload) {
            return Utils::formatApiResponse(null, 'Invalid JSON payload', 400);
        }

        $name = trim($payload['name'] ?? '');
        if (!$name) {
            return Utils::formatApiResponse(null, 'Category name is required', 400);
        }

        try {
            $categoryId = $this->categoryModel->insert([
                'name' => $name
            ]);

            $newCategory = $this->categoryModel->find($categoryId);

            ActionLogHelper::logAction(
                'Created a Category',
                "Category created: {$name}",
                'Admin',
                $categoryId,
                $auth['id']
            );

            return Utils::formatApiResponse(
                [
                    'id'   => (int) $newCategory['id'],
                    'name' => $newCategory['name']
                ],
                'Category created successfully',
                ResponseInterface::HTTP_CREATED
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Failed to create category: ' . $e->getMessage(), 500);
        }
    }

    public function deleteCategory($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Categories', 'DELETE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $category = $this->categoryModel->find($id);
        if (!$category) {
            return Utils::formatApiResponse(null, 'Category not found', 404);
        }

        try {
            $this->categoryModel->delete($id);

            ActionLogHelper::logAction(
                'Deleted a Category',
                "Category deleted: {$category['name']}",
                'Admin',
                $id,
                $auth['id']
            );

            return Utils::formatApiResponse(null, 'Category deleted successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Failed to delete category: ' . $e->getMessage(), 500);
        }
    }

    public function index()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'READ')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $category = $this->request->getGet('category');
        $page     = max(1, (int) ($this->request->getGet('page') ?? 1));
        $pageSize = (int) ($this->request->getGet('page_size') ?? 12);

        $filters = [];
        if ($category) {
            $filters['category'] = $category;
        }

        $result = Utils::getPaginationData(
            model: $this->albumModel,
            filters: $filters,
            pageNumber: $page,
            pageSize: $pageSize,
            orderBy: ['created_at' => 'DESC']
        );

        $result['data'] = array_map(fn ($a) => [
            'id'          => (int) $a['id'],
            'clientNames' => $a['client_names'],
            'eventDate'   => $a['event_date'],
            'categoryId'  => $a['category_id'],
            'coverImage'  => $a['cover_image'],
            'isLocked'    => (bool) $a['is_locked'],
            'isActive'    => (bool) ($a['is_active'] ?? true),
        ], $result['data']);

        return Utils::formatApiResponse(
            $result,
            'Albums fetched successfully'
        );
    }

    public function show($albumId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'READ')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $album = $this->albumModel->find($albumId);
        if (!$album) {
            return Utils::formatApiResponse(null, 'Album not found', 404);
        }

        return Utils::formatApiResponse(
            $album,
            'Album fetched successfully',
            200
        );
    }

    public function create()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'CREATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $payload = $this->request->getJSON(true);
        if (!$payload) {
            return Utils::formatApiResponse(null, 'Invalid JSON payload', 400);
        }

        if (!isset($payload['categoryId']) || empty($payload['categoryId'])) {
            return Utils::formatApiResponse(null, 'Category ID is required', 400);
        }

        $albumData = [
            'client_names' => $payload['clientNames'] ?? '',
            'event_date'   => $payload['eventDate'] ?? null,
            'category_id'  => (int) $payload['categoryId'],
            'is_locked'    => (int) ($payload['isLocked'] ?? 0),
            'album_code'   => 'rsp' . strtolower(bin2hex(random_bytes(6))),
        ];

        $albumId = $this->albumModel->insert($albumData);
        if (!$albumId) {
            return Utils::formatApiResponse(null, 'Album creation failed', 500);
        }

        $coverImageUrl = null;

        if (!empty($payload['image'])) {
            $albumPath = FCPATH . "uploads/album/$albumId/";
            
            try {
                $files = Utils::processBase64Images(
                    [$payload['image']],
                    $albumPath,
                    1
                );
                
                if (!empty($files)) {
                    $relative = "uploads/album/$albumId/" . $files[0];
                    $this->albumModel->update($albumId, ['cover_image' => $relative]);
                    $coverImageUrl = base_url($relative);
                }
            } catch (\Exception $e) {
                log_message('error', 'Cover image processing failed: ' . $e->getMessage());
            }
        }

        ActionLogHelper::logAction(
            'Created an Album',
            "Album created: {$albumData['client_names']} on {$albumData['event_date']}",
            'Admin',
            $albumId,
            $auth['id']
        );

        return Utils::formatApiResponse(
            ['id' => $albumId, 'coverImage' => $coverImageUrl],
            'Album created successfully',
            ResponseInterface::HTTP_CREATED
        );
    }

    public function edit($albumId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $payload = $this->request->getJSON(true);
        if (!$payload) {
            return Utils::formatApiResponse(null, 'Invalid JSON payload', 400);
        }

        if (!$this->albumModel->find($albumId)) {
            return Utils::formatApiResponse(null, 'Album not found', 404);
        }

        $updateData = [];

        if (isset($payload['clientNames'])) $updateData['client_names'] = $payload['clientNames'];
        if (isset($payload['eventDate']))   $updateData['event_date']   = $payload['eventDate'];
        if (isset($payload['categoryId']))  $updateData['category_id']  = $payload['categoryId'];
        if (isset($payload['isLocked']))    $updateData['is_locked']    = (int) $payload['isLocked'];

        if (!empty($payload['image'])) {
            $albumPath = FCPATH . "uploads/album/$albumId/";
            
            try {
                $files = Utils::processBase64Images(
                    [$payload['image']],
                    $albumPath,
                    1
                );
                
                if (!empty($files)) {
                    $updateData['cover_image'] = "uploads/album/$albumId/" . $files[0];
                }
            } catch (\Exception $e) {
                log_message('error', 'Cover image processing failed: ' . $e->getMessage());
            }
        }

        if (!$this->albumModel->update($albumId, $updateData)) {
            return Utils::formatApiResponse(null, 'Album update failed', 500);
        }

        ActionLogHelper::logAction(
            'Updated an Album',
            "Album ID {$albumId} updated",
            'Admin',
            $albumId,
            $auth['id']
        );

        $album = $this->albumModel->find($albumId);
        unset($album['created_at'], $album['updated_at']);
        
        return Utils::formatApiResponse(
            ['id' => $albumId, 'album' => $album],
            'Album updated successfully',
            200
        );
    }

    public function toggleStatus($albumId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $album = $this->albumModel->find($albumId);
        if (!$album) {
            return Utils::formatApiResponse(null, 'Album not found', 404);
        }

        $payload = $this->request->getJSON(true);
        $isActive = isset($payload['is_active']) ? (int) $payload['is_active'] : (isset($album['is_active']) ? ($album['is_active'] ? 0 : 1) : 1);

        $this->albumModel->update($albumId, ['is_active' => $isActive]);

        ActionLogHelper::logAction(
            'Toggled Album Status',
            "Album ID {$albumId} status changed to: " . ($isActive ? 'Active' : 'Inactive'),
            'Admin',
            $albumId,
            $auth['id']
        );

        return Utils::formatApiResponse(
            ['is_active' => $isActive],
            $isActive ? 'Album activated successfully' : 'Album deactivated successfully'
        );
    }

    public function toggleLock($albumId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $album = $this->albumModel->find($albumId);
        if (!$album) {
            return Utils::formatApiResponse(null, 'Album not found', 404);
        }

        $payload = $this->request->getJSON(true);
        $isLocked = isset($payload['is_locked']) ? (int) $payload['is_locked'] : ($album['is_locked'] ? 0 : 1);

        $this->albumModel->update($albumId, ['is_locked' => $isLocked]);

        ActionLogHelper::logAction(
            'Toggled Album Lock',
            "Album ID {$albumId} lock status changed to: " . ($isLocked ? 'Locked' : 'Unlocked'),
            'Admin',
            $albumId,
            $auth['id']
        );

        return Utils::formatApiResponse(
            ['is_locked' => $isLocked],
            $isLocked ? 'Album locked successfully' : 'Album unlocked successfully'
        );
    }

    public function delete($albumId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'DELETE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $album = $this->albumModel->find($albumId);
        if (!$album) {
            return Utils::formatApiResponse(null, 'Album not found', 404);
        }

        $this->imageModel->where('album_id', $albumId)->delete();
        $this->albumModel->delete($albumId);

        $paths = [
            FCPATH . "uploads/album/$albumId/",
            FCPATH . "uploads/albums/$albumId/",
        ];

        foreach ($paths as $path) {
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            }
        }

        ActionLogHelper::logAction(
            'Deleted an Album',
            "Album ID {$albumId} deleted: {$album['client_names']}",
            'Admin',
            $albumId,
            $auth['id']
        );

        return Utils::formatApiResponse(null, 'Album deleted successfully', 200);
    }

    public function deleteImage($imageId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'DELETE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $image = $this->imageModel->find($imageId);
        if (!$image) {
            return Utils::formatApiResponse(null, 'Image not found', 404);
        }

        $filePath = FCPATH . $image['file_url'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $this->imageModel->delete($imageId);

        ActionLogHelper::logAction(
            'Deleted Album Image',
            "Image ID {$imageId} deleted from album ID {$image['album_id']}",
            'Admin',
            $image['album_id'],
            $auth['id']
        );

        return Utils::formatApiResponse(null, 'Image deleted successfully', 200);
    }

    public function downloadQR($albumId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $album = $this->albumModel->find($albumId);
        if (!$album) {
            return Utils::formatApiResponse(null, 'Album not found', 404);
        }

        try {
            $albumCode = $album['album_code'] ?? 'album' . $albumId;
            $qrUrl = 'http://localhost:3000/albums/' . $albumCode;
            $qrImage = QRCodeHelper::generateQRCode($qrUrl);

            return service('response')
                ->setHeader('Content-Type', 'image/png')
                ->setHeader('Content-Disposition', 'attachment; filename="album_' . $albumCode . '_qr.png"')
                ->setBody($qrImage);
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Failed to generate QR code: ' . $e->getMessage(), 500);
        }
    }

    private function deleteDirectory($dir)
    {
        foreach (array_diff(scandir($dir), ['.', '..']) as $file) {
            $path = "$dir/$file";
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }

    public function uploadImages($albumId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'CREATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $payload = $this->request->getJSON(true);
        if (empty($payload['images']) || !is_array($payload['images'])) {
            return Utils::formatApiResponse(null, 'Images array required', 400);
        }

        $albumPath = FCPATH . "uploads/albums/$albumId/";
        $uploaded = [];
        
        try {
            $files = Utils::processBase64Images(
                $payload['images'],
                $albumPath,
                10
            );
            
            foreach ($files as $filename) {
                $relative = "uploads/albums/$albumId/$filename";
                $this->imageModel->insert([
                    'album_id' => $albumId,
                    'filename' => $filename,
                    'file_url' => $relative,
                    'caption'  => '',
                ]);
                $uploaded[] = base_url($relative);
            }

            ActionLogHelper::logAction(
                'Uploaded Album Images',
                "Uploaded " . count($files) . " images to album ID {$albumId}",
                'Admin',
                $albumId,
                $auth['id']
            );
            
        } catch (\Exception $e) {
            log_message('error', 'Image processing failed: ' . $e->getMessage());
            return Utils::formatApiResponse(null, 'Image processing failed: ' . $e->getMessage(), 400);
        }

        return Utils::formatApiResponse(['uploaded' => $uploaded], 'Images uploaded successfully', 200);
    }

    public function images($albumId = null)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Albums', 'READ')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        if (!$albumId) {
            return Utils::formatApiResponse(null, 'Album ID is required', 400);
        }

        $page     = max(1, (int) ($this->request->getGet('page') ?? 1));
        $pageSize = min(50, (int) ($this->request->getGet('page_size') ?? 12));

        $result = Utils::getPaginationData(
            model: $this->imageModel,
            filters: ['album_id' => $albumId],
            pageNumber: $page,
            pageSize: $pageSize,
            orderBy: ['created_at' => 'DESC']
        );

        $result['data'] = array_map(fn ($img) => [
            'id'        => (int) $img['id'],
            'albumId'   => (int) $img['album_id'],
            'fileName'  => $img['filename'],
            'fileUrl'   => base_url($img['file_url']),
            'caption'   => $img['caption'] ?? '',
            'createdAt'=> $img['created_at'] ?? null,
        ], $result['data']);

        return Utils::formatApiResponse($result, 'Images fetched successfully', 200);
    }
}
